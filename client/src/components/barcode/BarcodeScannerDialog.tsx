import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Button } from '@astryxdesign/core/Button';
import { Stack } from '@astryxdesign/core/Stack';
import { TextInput } from '@astryxdesign/core/TextInput';
import * as stylex from '@stylexjs/stylex';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { getSessionSnapshot, subscribeSession } from '@/lib/session';

interface BarcodeScannerDialogProps { open: boolean; onOpenChange: (open: boolean) => void; onScan: (barcode: string) => void }
const styles = stylex.create({
  video: { width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', backgroundColor: 'var(--color-background-muted)', borderRadius: 'var(--radius-element)' },
});
export function BarcodeScannerDialog({ open, onOpenChange, onScan }: BarcodeScannerDialogProps) {
  const session = useSyncExternalStore(subscribeSession, getSessionSnapshot);
  const visible = open && session.status === 'active';
  const [manual, setManual] = useState('');
  const handleDetected = useCallback((value: string) => {
    onScan(value); onOpenChange(false);
  }, [onScan, onOpenChange]);
  const { videoRef, start, stop, capture, isScanning, error } = useBarcodeScanner({ onDetected: handleDetected });
  useEffect(() => {
    if (visible) void start();
    else stop();
    return stop;
  }, [visible, start, stop]);
  const close = (isOpen: boolean) => { if (!isOpen) stop(); onOpenChange(isOpen); };
  return <Dialog isOpen={visible} onOpenChange={close} width={480} purpose="form" padding={4}>
    <DialogHeader title="Scan Barcode" onOpenChange={close} />
    <Stack gap={4}>
      <video ref={videoRef} {...stylex.props(styles.video)} muted playsInline />
      {!isScanning && !error && <p role="status">Starting camera...</p>}
      {error && <p role="alert">{error}</p>}
      <p>Point the camera at a barcode, tap Capture, or enter it manually.</p>
      <TextInput label="Manual barcode" value={manual} onChange={setManual} />
      <Stack direction="horizontal" gap={2} wrap="wrap">
        <Button label="Cancel" variant="ghost" onClick={() => close(false)} />
        <Button label="Capture" onClick={capture} isDisabled={!isScanning} />
        <Button label="Use barcode" onClick={() => { stop(); handleDetected(manual.trim()); }} isDisabled={!manual.trim()} />
      </Stack>
    </Stack>
  </Dialog>;
}
