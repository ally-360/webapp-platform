import React, { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { alpha, styled } from '@mui/material/styles';
// components
import { Icon } from '@iconify/react';
import { useStagedImageUpload, UploadProgress } from 'src/hooks/use-staged-image-upload';
import type { UploadPurpose } from 'src/interfaces/api/uploads';

/**
 * 🎨 Styled Drop Zone
 */
const StyledDropZone = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isDragActive' && prop !== 'hasError'
})<{ isDragActive?: boolean; hasError?: boolean }>(({ theme, isDragActive, hasError }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  border: `2px dashed ${
    hasError ? theme.palette.error.main : isDragActive ? theme.palette.primary.main : theme.palette.grey[300]
  }`,
  backgroundColor: isDragActive
    ? alpha(theme.palette.primary.main, 0.08)
    : hasError
    ? alpha(theme.palette.error.main, 0.08)
    : theme.palette.grey[50],
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04)
  }
}));

/**
 * 🎯 Props del componente
 */
export interface StagedImageUploadProps {
  /** Callback cuando se suben imágenes exitosamente - retorna upload_ids */
  onUploadComplete?: (uploadIds: string[]) => void;

  /** IDs de uploads ya subidos (para mostrar previews) */
  initialUploadIds?: string[];

  /** Máximo número de archivos */
  maxFiles?: number;

  /** Tamaño máximo en MB */
  maxSizeMB?: number;

  /** Propósito del upload */
  purpose?: UploadPurpose;

  /** Texto de ayuda personalizado */
  helperText?: string;

  /** Deshabilitar upload */
  disabled?: boolean;
}

/**
 * 📤 Componente de Upload con Drag & Drop + Preview + Progreso
 *
 * CARACTERÍSTICAS:
 * ✅ Drag & Drop de múltiples archivos
 * ✅ Preview de imágenes en grid responsivo
 * ✅ Barra de progreso por archivo
 * ✅ Validación de tipo y tamaño
 * ✅ Eliminar imágenes subidas
 * ✅ Upload ANTES de crear producto
 */
export default function StagedImageUpload({
  onUploadComplete,
  initialUploadIds = [],
  maxFiles = 5,
  maxSizeMB = 3,
  purpose = 'product_image',
  helperText = 'Arrastra imágenes aquí o haz clic para seleccionar',
  disabled = false
}: StagedImageUploadProps) {
  const { uploadMultipleImages, removeImage, uploadProgress, isUploading, completedUploads, clearProgress } =
    useStagedImageUpload({
      purpose,
      maxSizeMB,
      onSuccess: () => {
        // Notificar al padre sobre uploads completados
        const uploadIds = completedUploads.filter((u) => u.uploadId).map((u) => u.uploadId as string);

        if (uploadIds.length > 0 && onUploadComplete) {
          onUploadComplete(uploadIds);
        }
      }
    });

  // Notificar cambios en uploads completados
  useEffect(() => {
    const uploadIds = completedUploads.filter((u) => u.uploadId).map((u) => u.uploadId as string);

    if (uploadIds.length > 0 && onUploadComplete) {
      onUploadComplete(uploadIds);
    }
  }, [completedUploads, onUploadComplete]);

  // ========================================
  // 📥 DROPZONE CONFIGURATION
  // ========================================
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const currentCount = completedUploads.length + initialUploadIds.length;
      const remainingSlots = maxFiles - currentCount;

      if (remainingSlots <= 0) {
        return;
      }

      const filesToUpload = acceptedFiles.slice(0, remainingSlots);
      await uploadMultipleImages(filesToUpload);
    },
    [uploadMultipleImages, completedUploads.length, initialUploadIds.length, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles,
    disabled: disabled || isUploading,
    multiple: true
  });

  // ========================================
  // 🗑️ ELIMINAR IMAGEN
  // ========================================
  const handleRemove = useCallback(
    async (uploadId: string) => {
      await removeImage(uploadId);

      // Actualizar lista de uploads completados
      const remainingIds = completedUploads.filter((u) => u.uploadId !== uploadId).map((u) => u.uploadId as string);

      onUploadComplete?.(remainingIds);
    },
    [removeImage, completedUploads, onUploadComplete]
  );

  // ========================================
  // 🎨 RENDER
  // ========================================
  const totalUploads = completedUploads.length + initialUploadIds.length;
  const canUploadMore = totalUploads < maxFiles && !disabled;

  return (
    <Stack spacing={2}>
      {/* DROPZONE */}
      {canUploadMore && (
        <StyledDropZone {...getRootProps()} isDragActive={isDragActive} elevation={0}>
          <input {...getInputProps()} />

          <Box component={Icon} icon="eva:cloud-upload-fill" width={64} height={64} color="text.disabled" />

          <Typography variant="h6" sx={{ mt: 2 }}>
            {isDragActive ? '¡Suelta aquí!' : helperText}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Formatos: JPG, PNG, WEBP • Máximo {maxSizeMB}MB por imagen
          </Typography>

          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
            {totalUploads}/{maxFiles} imágenes subidas
          </Typography>
        </StyledDropZone>
      )}

      {/* GRID DE IMÁGENES SUBIDAS */}
      {completedUploads.length > 0 && (
        <Grid container spacing={2}>
          {completedUploads.map((upload) => (
            <Grid item xs={6} sm={4} md={3} key={upload.uploadId}>
              <ImagePreviewCard upload={upload} onRemove={handleRemove} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* PROGRESO DE UPLOADS EN CURSO */}
      {Object.entries(uploadProgress).map(([key, progress]) => {
        if (progress.status === 'success') return null;

        return <UploadProgressBar key={key} progress={progress} />;
      })}
    </Stack>
  );
}

/**
 * 🖼️ Tarjeta de Preview de Imagen
 */
interface ImagePreviewCardProps {
  upload: UploadProgress;
  onRemove: (uploadId: string) => void;
}

function ImagePreviewCard({ upload, onRemove }: ImagePreviewCardProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        paddingTop: '100%', // Aspect ratio 1:1
        borderRadius: 1,
        overflow: 'hidden',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        '&:hover .remove-button': {
          opacity: 1
        }
      }}
    >
      {/* Imagen */}
      <Box
        component="img"
        src={upload.downloadUrl}
        alt={upload.file.name}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />

      {/* Botón Eliminar */}
      <IconButton
        className="remove-button"
        onClick={() => upload.uploadId && onRemove(upload.uploadId)}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          opacity: 0,
          transition: 'opacity 0.2s',
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.9),
          color: 'white',
          '&:hover': {
            bgcolor: 'error.dark'
          }
        }}
        size="small"
      >
        <Icon icon="eva:trash-2-fill" width={20} height={20} />
      </IconButton>

      {/* Nombre del archivo */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: (theme) => alpha(theme.palette.common.black, 0.6),
          color: 'white',
          py: 0.5,
          px: 1
        }}
      >
        <Typography variant="caption" noWrap>
          {upload.file.name}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * 📊 Barra de Progreso de Upload
 */
interface UploadProgressBarProps {
  progress: UploadProgress;
}

function UploadProgressBar({ progress }: UploadProgressBarProps) {
  const getStatusColor = () => {
    switch (progress.status) {
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      default:
        return 'primary';
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'presigning':
        return 'Solicitando URL...';
      case 'uploading':
        return `Subiendo... ${progress.progress}%`;
      case 'confirming':
        return 'Confirmando...';
      case 'success':
        return '¡Completado!';
      case 'error':
        return progress.error || 'Error';
      default:
        return 'Esperando...';
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
        <Typography variant="body2" noWrap flex={1}>
          {progress.file.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {getStatusText()}
        </Typography>
      </Stack>

      <LinearProgress
        variant={progress.progress > 0 ? 'determinate' : 'indeterminate'}
        value={progress.progress}
        color={getStatusColor()}
        sx={{ height: 6, borderRadius: 1 }}
      />

      {progress.status === 'error' && progress.error && (
        <Typography variant="caption" color="error.main" sx={{ mt: 0.5 }}>
          {progress.error}
        </Typography>
      )}
    </Box>
  );
}
