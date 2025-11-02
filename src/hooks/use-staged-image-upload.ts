import { useState, useCallback } from 'react';
import { useSnackbar } from 'src/components/snackbar';
import {
  usePresignUploadMutation,
  useConfirmUploadMutation,
  useDeleteUploadMutation
} from 'src/redux/services/uploadsApi';
import type { UploadPurpose, StagedUpload } from 'src/interfaces/api/uploads';

/**
 * 🎯 Hook para manejar Staged Uploads con progreso en tiempo real
 * 
 * FLUJO COMPLETO:
 * 1. validateFile() - Valida tipo y tamaño
 * 2. presignUpload() - Obtiene URL presignada (15min)
 * 3. uploadToMinIO() - PUT directo a MinIO con progreso
 * 4. confirmUpload() - Marca como disponible
 * 
 * RETORNA:
 * - upload_id para asociar con producto/entidad
 * - download_url para preview de imagen
 */

export interface UploadProgress {
  file: File;
  uploadId?: string;
  progress: number; // 0-100
  status: 'pending' | 'presigning' | 'uploading' | 'confirming' | 'success' | 'error';
  error?: string;
  downloadUrl?: string;
  objectKey?: string;
}

export interface UseStagedImageUploadOptions {
  /** Propósito del upload para validación backend */
  purpose?: UploadPurpose;
  
  /** Tamaño máximo en MB (default: 3) */
  maxSizeMB?: number;
  
  /** Tipos MIME permitidos */
  allowedTypes?: string[];
  
  /** Callback al completar upload exitoso */
  onSuccess?: (uploadId: string, downloadUrl: string) => void;
  
  /** Callback en error */
  onError?: (error: string) => void;
}

export function useStagedImageUpload(options: UseStagedImageUploadOptions = {}) {
  const {
    purpose = 'product_image',
    maxSizeMB = 3,
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    onSuccess,
    onError
  } = options;

  const { enqueueSnackbar } = useSnackbar();
  
  // RTK Query mutations
  const [presignUpload] = usePresignUploadMutation();
  const [confirmUpload] = useConfirmUploadMutation();
  const [deleteUpload] = useDeleteUploadMutation();

  // Estado de progreso por archivo
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});

  // ========================================
  // 🔍 VALIDACIÓN DE ARCHIVO
  // ========================================
  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Validar tipo MIME
      if (!allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `Tipo de archivo no permitido. Solo: ${allowedTypes.join(', ')}`
        };
      }

      // Validar tamaño
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        return {
          valid: false,
          error: `Archivo muy grande. Máximo ${maxSizeMB}MB`
        };
      }

      return { valid: true };
    },
    [allowedTypes, maxSizeMB]
  );

  // ========================================
  // 📤 UPLOAD COMPLETO (3 PASOS)
  // ========================================
  const uploadImage = useCallback(
    async (file: File): Promise<{ uploadId: string; downloadUrl: string } | null> => {
      const fileKey = `${file.name}-${Date.now()}`;

      try {
        // 1️⃣ Validar archivo
        const validation = validateFile(file);
        if (!validation.valid) {
          enqueueSnackbar(validation.error, { variant: 'error' });
          setUploadProgress((prev) => ({
            ...prev,
            [fileKey]: {
              file,
              progress: 0,
              status: 'error',
              error: validation.error
            }
          }));
          onError?.(validation.error || 'Archivo inválido');
          return null;
        }

        // 2️⃣ Solicitar URL presignada
        setUploadProgress((prev) => ({
          ...prev,
          [fileKey]: {
            file,
            progress: 10,
            status: 'presigning'
          }
        }));

        const presignResponse = await presignUpload({
          filename: file.name,
          content_type: file.type,
          size: file.size,
          purpose
        }).unwrap();

        setUploadProgress((prev) => ({
          ...prev,
          [fileKey]: {
            ...prev[fileKey],
            uploadId: presignResponse.upload_id,
            objectKey: presignResponse.object_key,
            progress: 20,
            status: 'uploading'
          }
        }));

        // 3️⃣ Upload directo a MinIO con XMLHttpRequest para progreso
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // Tracking de progreso
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 70) + 20; // 20-90%
              setUploadProgress((prev) => ({
                ...prev,
                [fileKey]: {
                  ...prev[fileKey],
                  progress: percentComplete,
                  status: 'uploading'
                }
              }));
            }
          });

          // Completado
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`MinIO upload failed: ${xhr.status} ${xhr.statusText}`));
            }
          });

          // Error
          xhr.addEventListener('error', () => {
            reject(new Error('Network error durante upload a MinIO'));
          });

          // Timeout
          xhr.addEventListener('timeout', () => {
            reject(new Error('Timeout durante upload a MinIO'));
          });

          // Iniciar request
          xhr.open('PUT', presignResponse.upload_url);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.timeout = 120000; // 2 minutos
          xhr.send(file);
        });

        // 4️⃣ Confirmar upload
        setUploadProgress((prev) => ({
          ...prev,
          [fileKey]: {
            ...prev[fileKey],
            progress: 90,
            status: 'confirming'
          }
        }));

        const confirmResponse = await confirmUpload({
          upload_id: presignResponse.upload_id
        }).unwrap();

        // ✅ SUCCESS
        setUploadProgress((prev) => ({
          ...prev,
          [fileKey]: {
            ...prev[fileKey],
            progress: 100,
            status: 'success',
            downloadUrl: confirmResponse.download_url
          }
        }));

        enqueueSnackbar(`Imagen "${file.name}" subida exitosamente`, { variant: 'success' });
        onSuccess?.(confirmResponse.upload_id, confirmResponse.download_url);

        return {
          uploadId: confirmResponse.upload_id,
          downloadUrl: confirmResponse.download_url
        };
      } catch (error: any) {
        console.error('Upload error:', error);
        const errorMessage = error?.data?.detail || error?.message || 'Error al subir imagen';

        setUploadProgress((prev) => ({
          ...prev,
          [fileKey]: {
            ...prev[fileKey],
            progress: 0,
            status: 'error',
            error: errorMessage
          }
        }));

        enqueueSnackbar(errorMessage, { variant: 'error' });
        onError?.(errorMessage);
        return null;
      }
    },
    [
      validateFile,
      presignUpload,
      confirmUpload,
      purpose,
      enqueueSnackbar,
      onSuccess,
      onError
    ]
  );

  // ========================================
  // 📤 UPLOAD MÚLTIPLE (PARALELO)
  // ========================================
  const uploadMultipleImages = useCallback(
    async (files: File[]): Promise<Array<{ uploadId: string; downloadUrl: string }>> => {
      const results = await Promise.allSettled(files.map((file) => uploadImage(file)));

      return results
        .filter((result) => result.status === 'fulfilled' && result.value !== null)
        .map((result) => (result as PromiseFulfilledResult<any>).value);
    },
    [uploadImage]
  );

  // ========================================
  // 🗑️ ELIMINAR UPLOAD
  // ========================================
  const removeImage = useCallback(
    async (uploadId: string) => {
      try {
        await deleteUpload(uploadId).unwrap();
        enqueueSnackbar('Imagen eliminada', { variant: 'info' });

        // Limpiar del estado de progreso
        setUploadProgress((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((key) => {
            if (updated[key].uploadId === uploadId) {
              delete updated[key];
            }
          });
          return updated;
        });
      } catch (error: any) {
        console.error('Delete error:', error);
        const errorMessage = error?.data?.detail || 'Error al eliminar imagen';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    },
    [deleteUpload, enqueueSnackbar]
  );

  // ========================================
  // 🧹 LIMPIAR ESTADO DE PROGRESO
  // ========================================
  const clearProgress = useCallback(() => {
    setUploadProgress({});
  }, []);

  // ========================================
  // 📊 UTILIDADES
  // ========================================
  const isUploading = Object.values(uploadProgress).some(
    (p) => p.status === 'presigning' || p.status === 'uploading' || p.status === 'confirming'
  );

  const hasErrors = Object.values(uploadProgress).some((p) => p.status === 'error');

  const completedUploads = Object.values(uploadProgress).filter((p) => p.status === 'success');

  return {
    // Funciones principales
    uploadImage,
    uploadMultipleImages,
    removeImage,
    clearProgress,

    // Estado
    uploadProgress,
    isUploading,
    hasErrors,
    completedUploads,

    // Utilidades
    validateFile
  };
}
