import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  Typography,
  Paper,
  Fade,
  LinearProgress,
  Alert,
  Stack
} from '@mui/material';
import { Icon } from '@iconify/react';
import { keyframes } from '@mui/material/styles';

// Keyframes para animaciones
const scanLine = keyframes`
  0% { top: 20px; }
  50% { top: 60%; }
  100% { top: 20px; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7); }
  70% { box-shadow: 0 0 0 20px rgba(33, 150, 243, 0); }
  100% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0); }
`;

const cornerAnimation = keyframes`
  0% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.6; transform: scale(1); }
`;

const glitch = keyframes`
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
`;

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
  onError?: (error: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ open, onClose, onScanSuccess, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [foundBarcode, setFoundBarcode] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simular detección de código de barras (placeholder)
  const simulateBarcodeScan = useCallback(() => {
    const mockBarcodes = ['7891234567890', '1234567890123', '9876543210987', '5555555555555', '1111111111111'];

    setTimeout(() => {
      const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
      setFoundBarcode(randomBarcode);
      setScanProgress(100);

      setTimeout(() => {
        onScanSuccess(randomBarcode);
        onClose();
      }, 1500);
    }, 2000);
  }, [onScanSuccess, onClose]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);
      setScanProgress(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      // Progress animation
      const progressInterval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simular escaneo después de iniciar cámara
      simulateBarcodeScan();
    } catch (err) {
      const errorMessage = 'No se pudo acceder a la cámara. Verifica los permisos.';
      setError(errorMessage);
      setIsScanning(false);
      if (onError) onError(errorMessage);
    }
  }, [simulateBarcodeScan, onError]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setScanProgress(0);
    setFoundBarcode(null);
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    setError(null);
    onClose();
  }, [stopCamera, onClose]);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(0, 0, 0, 0.95)',
          borderRadius: 3,
          overflow: 'hidden',
          border: '2px solid',
          borderColor: 'primary.main',
          boxShadow: '0 0 30px rgba(33, 150, 243, 0.5)'
        }
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative', minHeight: 500 }}>
        {/* Header */}
        <Box
          sx={{
            position: 'relative',
            p: 2,
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  animation: `${pulse} 2s infinite`
                }}
              >
                <Icon icon="mdi:barcode-scan" style={{ fontSize: '1.5rem', color: '#fff' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                  Escáner de Código
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {isScanning ? 'Enfoca el código de barras' : 'Iniciando cámara...'}
                </Typography>
              </Box>
            </Stack>

            <IconButton
              onClick={handleClose}
              sx={{
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  animation: `${glitch} 0.3s ease-in-out`
                }
              }}
            >
              <Icon icon="mdi:close" />
            </IconButton>
          </Stack>

          {/* Progress Bar */}
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={scanProgress}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #00f5ff, #0099ff)',
                  borderRadius: 2,
                  boxShadow: '0 0 10px rgba(0, 245, 255, 0.8)'
                }
              }}
            />
          </Box>
        </Box>

        {/* Camera Container */}
        <Box sx={{ position: 'relative', height: 400, overflow: 'hidden' }}>
          {/* Video Stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {/* Scanning Overlay */}
          {isScanning && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.8) 70%),
                  linear-gradient(transparent 20%, rgba(0,245,255,0.1) 50%, transparent 80%)
                `
              }}
            >
              {/* Scanning Frame Corners */}
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
                <Box
                  key={corner}
                  sx={{
                    position: 'absolute',
                    width: 40,
                    height: 40,
                    border: '3px solid #00f5ff',
                    animation: `${cornerAnimation} 2s infinite`,
                    boxShadow: '0 0 20px rgba(0, 245, 255, 0.8)',
                    ...(corner === 'top-left' && { top: 60, left: 60, borderRight: 'none', borderBottom: 'none' }),
                    ...(corner === 'top-right' && { top: 60, right: 60, borderLeft: 'none', borderBottom: 'none' }),
                    ...(corner === 'bottom-left' && { bottom: 60, left: 60, borderRight: 'none', borderTop: 'none' }),
                    ...(corner === 'bottom-right' && { bottom: 60, right: 60, borderLeft: 'none', borderTop: 'none' })
                  }}
                />
              ))}

              {/* Scanning Line */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 60,
                  right: 60,
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)',
                  animation: `${scanLine} 2s infinite`,
                  boxShadow: '0 0 20px rgba(0, 245, 255, 0.8)'
                }}
              />

              {/* Center Target */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 20,
                  height: 20,
                  border: '2px solid #00f5ff',
                  borderRadius: '50%',
                  animation: `${pulse} 1s infinite`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 4,
                    height: 4,
                    bgcolor: '#00f5ff',
                    borderRadius: '50%'
                  }
                }}
              />
            </Box>
          )}

          {/* Success State */}
          {foundBarcode && (
            <Fade in>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0, 0, 0, 0.8)'
                }}
              >
                <Paper
                  elevation={24}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    bgcolor: 'rgba(76, 175, 80, 0.95)',
                    color: 'white',
                    borderRadius: 3,
                    border: '2px solid #4caf50',
                    boxShadow: '0 0 30px rgba(76, 175, 80, 0.5)',
                    animation: `${pulse} 1s infinite`
                  }}
                >
                  <Icon icon="mdi:check-circle" style={{ fontSize: '3rem', marginBottom: 8 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    ¡Código Detectado!
                  </Typography>
                  <Typography variant="h4" sx={{ fontFamily: 'monospace', letterSpacing: 2 }}>
                    {foundBarcode}
                  </Typography>
                </Paper>
              </Box>
            </Fade>
          )}
        </Box>

        {/* Error State */}
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert
              severity="error"
              sx={{
                bgcolor: 'rgba(244, 67, 54, 0.1)',
                color: 'error.main',
                border: '1px solid rgba(244, 67, 54, 0.3)'
              }}
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Instructions */}
        {!error && (
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(33, 33, 33, 0.9) 100%)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
              <Icon icon="mdi:information" style={{ color: '#00f5ff', fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Mantén el código de barras dentro del marco para escanearlo
              </Typography>
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;
