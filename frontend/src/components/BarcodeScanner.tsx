import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, CameraAlt as CameraIcon } from '@mui/icons-material';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
}

export default function BarcodeScanner({ open, onClose, onScan, title = 'Scan Barcode' }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    if (open && !scannerRef.current) {
      initializeScanner();
    }

    return () => {
      stopScanning();
    };
  }, [open]);

  const initializeScanner = async () => {
    try {
      // Check camera permission
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(permission.state);

      const scanner = new Html5Qrcode('barcode-scanner-region');
      scannerRef.current = scanner;

      await startScanning();
    } catch (err) {
      console.error('Scanner initialization error:', err);
      setError('Failed to initialize camera. Please check permissions.');
    }
  };

  const startScanning = async () => {
    if (!scannerRef.current) return;

    try {
      setScanning(true);
      setError(null);

      await scannerRef.current.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778,
        },
        (decodedText) => {
          // Barcode detected
          onScan(decodedText);
          handleClose();
        },
        (errorMessage) => {
          // Scanning error (usually just "no barcode found")
          // Ignore these errors to avoid console spam
        }
      );
    } catch (err: any) {
      console.error('Start scanning error:', err);
      setError(err.message || 'Failed to start camera');
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setScanning(false);
      } catch (err) {
        console.error('Stop scanning error:', err);
      }
    }
  };

  const handleClose = async () => {
    await stopScanning();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <CameraIcon />
            <Typography variant="h6">{title}</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ minHeight: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'error.light',
                color: 'error.contrastText',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">{error}</Typography>
            </Box>
          )}

          {cameraPermission === 'denied' && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'warning.light',
                color: 'warning.contrastText',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">
                Camera access denied. Please enable camera permissions in your browser settings.
              </Typography>
            </Box>
          )}

          <Box
            id="barcode-scanner-region"
            sx={{
              width: '100%',
              minHeight: 300,
              bgcolor: 'black',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!scanning && !error && (
              <Typography color="white">Initializing camera...</Typography>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" align="center">
            Position the barcode within the camera view
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
