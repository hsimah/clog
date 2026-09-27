/** @module-boundary Owns camera permission, capture scheduling, detection, and stream cleanup. */
import { useRef, useState, useCallback, useEffect } from "react";
import "barcode-detector/polyfill";

export function useBarcodeScanner({ onDetected }: UseBarcodeScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const detector = useRef<BarcodeDetector | null>(null);
  const frame = useRef(0);
  const generation = useRef(0);
  const running = useRef(false);
  const detecting = useRef(false);
  const callback = useRef(onDetected);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    callback.current = onDetected;
  }, [onDetected]);

  const stop = useCallback(() => {
    generation.current++;
    running.current = false;
    detecting.current = false;
    cancelAnimationFrame(frame.current);
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    detector.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsScanning(false);
  }, []);

  const detect = useCallback(
    async (token: number, manual = false) => {
      const video = videoRef.current;
      if (
        !running.current ||
        token !== generation.current ||
        detecting.current ||
        !video ||
        video.readyState < 2 ||
        !detector.current
      )
        return;
      detecting.current = true;
      try {
        const codes = await detector.current.detect(video);
        if (!running.current || token !== generation.current) return;
        if (codes[0]?.rawValue) {
          stop(); // Invalidate concurrent detection/capture before delivering once.
          callback.current(codes[0].rawValue);
        } else if (manual)
          setError(
            "No barcode found. Adjust the camera or enter the barcode below.",
          );
      } catch {
        if (manual && token === generation.current)
          setError("Detection failed. Enter the barcode below.");
      } finally {
        if (token === generation.current) detecting.current = false;
      }
    },
    [stop],
  );

  const start = useCallback(async () => {
    stop();
    const token = generation.current;
    setError(null);
    try {
      detector.current = new BarcodeDetector();
      const next = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (token !== generation.current || !videoRef.current) {
        next.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = next;
      videoRef.current.srcObject = next;
      await videoRef.current.play();
      if (token !== generation.current) return;
      running.current = true;
      setIsScanning(true);
      let last = 0;
      const tick = (now: number) => {
        if (!running.current || token !== generation.current) return;
        if (now - last >= 150) {
          last = now;
          void detect(token);
        }
        frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    } catch (failure) {
      if (token !== generation.current) return;
      setError(
        `${failure instanceof Error ? failure.message : "Camera unavailable"}. You can enter a barcode manually.`,
      );
      stop();
    }
  }, [detect, stop]);
  useEffect(() => stop, [stop]);
  const capture = useCallback(() => {
    void detect(generation.current, true);
  }, [detect]);
  return { videoRef, start, stop, capture, isScanning, error };
}

interface UseBarcodeScannerOptions {
  onDetected: (rawValue: string) => void;
}
