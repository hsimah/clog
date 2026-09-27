import { Text } from "@astryxdesign/core/Text";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Button } from "@astryxdesign/core/Button";
import { Stack } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import * as stylex from "@stylexjs/stylex";
import { useBarcodeScanner } from "./scanner-dialog/useBarcodeScanner";
import { SESSION } from "../../lib/session";

export function BarcodeScannerDialog({
  open,
  onOpenChange,
  onScan,
}: BarcodeScannerDialogProps) {
  const {
    visible,
    manual,
    setManual,
    videoRef,
    capture,
    isScanning,
    error,
    close,
    useManualBarcode,
  } = useBarcodeScannerDialog({ open, onOpenChange, onScan });
  return (
    <Dialog
      isOpen={visible}
      onOpenChange={close}
      width={480}
      purpose="form"
      padding={4}
    >
      <DialogHeader title="Scan Barcode" onOpenChange={close} />
      <Stack gap={4}>
        <video
          ref={videoRef}
          {...stylex.props(styles.video)}
          muted
          playsInline
        />
        {!isScanning && !error && <Text role="status">Starting camera...</Text>}
        {error && <Text role="alert">{error}</Text>}
        <Text>
          Point the camera at a barcode, tap Capture, or enter it manually.
        </Text>
        <TextInput label="Manual barcode" value={manual} onChange={setManual} />
        <Stack direction="horizontal" gap={2} wrap="wrap">
          <Button label="Cancel" variant="ghost" onClick={() => close(false)} />
          <Button label="Capture" onClick={capture} isDisabled={!isScanning} />
          <Button
            label="Use barcode"
            onClick={useManualBarcode}
            isDisabled={!manual.trim()}
          />
        </Stack>
      </Stack>
    </Dialog>
  );
}

interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
}

function useBarcodeScannerDialog({
  open,
  onOpenChange,
  onScan,
}: BarcodeScannerDialogProps) {
  const session = useSyncExternalStore(
    SESSION.subscribeSession,
    SESSION.getSessionSnapshot,
  );
  const visible = open && session.status === "active";
  const [manual, setManual] = useState("");
  const handleDetected = useCallback(
    (value: string) => {
      onScan(value);
      onOpenChange(false);
    },
    [onScan, onOpenChange],
  );
  const { videoRef, start, stop, capture, isScanning, error } =
    useBarcodeScanner({ onDetected: handleDetected });
  useEffect(() => {
    if (visible) void start();
    else stop();
    return stop;
  }, [visible, start, stop]);
  const close = (isOpen: boolean) => {
    if (!isOpen) stop();
    onOpenChange(isOpen);
  };
  function useManualBarcode() {
    stop();
    handleDetected(manual.trim());
  }
  return {
    visible,
    manual,
    setManual,
    videoRef,
    capture,
    isScanning,
    error,
    close,
    useManualBarcode,
  };
}

const styles = stylex.create({
  video: {
    width: "100%",
    aspectRatio: "16 / 9",
    objectFit: "cover",
    backgroundColor: "var(--color-background-muted)",
    borderRadius: "var(--radius-element)",
  },
});
