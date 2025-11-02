/**
 * Staged Uploads API - Type Definitions
 * 
 * Sistema de pre-subida de archivos que permite a usuarios
 * subir imágenes ANTES de crear entidades (productos, facturas, etc.)
 */

/**
 * Estados posibles de un archivo subido
 */
export type FileStatus = 
  | 'pending_upload'  // URL presignada generada, esperando upload a MinIO
  | 'available'       // Archivo confirmado en MinIO, listo para asociar
  | 'associated'      // Archivo asociado a una entidad (producto, factura, etc.)
  | 'processing'      // Procesándose (thumbnails, virus scan, etc.)
  | 'failed'          // Error en upload o procesamiento
  | 'expired';        // URL expirada sin confirmación

/**
 * Propósitos de upload (para validación y organización)
 */
export type UploadPurpose = 
  | 'product_image'
  | 'invoice_pdf'
  | 'user_avatar'
  | 'company_logo'
  | 'general';

/**
 * Tipos de entidades que pueden tener archivos asociados
 */
export type EntityType = 
  | 'product'
  | 'invoice'
  | 'user'
  | 'company'
  | 'bill';

/**
 * Request para solicitar URL presignada de subida
 */
export interface PresignUploadRequest {
  /** Nombre original del archivo (ej: "laptop-lenovo.jpg") */
  filename: string;
  
  /** Tipo MIME (ej: "image/jpeg", "application/pdf") */
  content_type: string;
  
  /** Tamaño del archivo en bytes */
  size: number;
  
  /** Propósito del upload para validación */
  purpose: UploadPurpose;
}

/**
 * Response con URL presignada para upload directo a MinIO
 */
export interface PresignUploadResponse {
  /** ID único del upload (UUID) */
  upload_id: string;
  
  /** URL presignada para PUT directo a MinIO (expira en 15 min) */
  upload_url: string;
  
  /** Key del objeto en MinIO (ej: "tenant/abc123.../product_image.jpg") */
  object_key: string;
  
  /** Segundos hasta que expire la URL (típicamente 900) */
  expires_in: number;
}

/**
 * Request para confirmar que el archivo fue subido exitosamente
 */
export interface ConfirmUploadRequest {
  /** ID del upload a confirmar */
  upload_id: string;
}

/**
 * Response al confirmar upload (incluye URL de descarga)
 */
export interface ConfirmUploadResponse {
  /** ID del upload confirmado */
  upload_id: string;
  
  /** Key del objeto en MinIO */
  object_key: string;
  
  /** Estado actualizado (debería ser "available") */
  status: FileStatus;
  
  /** URL de descarga temporal (expira en 1 hora) */
  download_url: string;
  
  /** Tamaño real del archivo en bytes (verificado en MinIO) */
  size: number;
  
  /** Timestamp de confirmación */
  confirmed_at?: string;
}

/**
 * Modelo completo de un StagedUpload
 */
export interface StagedUpload {
  /** ID único (UUID) */
  id: string;
  
  /** ID del tenant propietario */
  tenant_id: string;
  
  /** Bucket de MinIO (típicamente "ally360") */
  bucket: string;
  
  /** Key completo del objeto en MinIO */
  object_key: string;
  
  /** Nombre original del archivo */
  original_filename: string;
  
  /** Tipo MIME */
  content_type: string;
  
  /** Tamaño en bytes */
  size: number;
  
  /** Estado actual del archivo */
  status: FileStatus;
  
  /** ID del usuario que subió */
  uploaded_by: string;
  
  /** Tipo de entidad asociada (null si no está asociado) */
  entity_type?: EntityType | null;
  
  /** ID de la entidad asociada (null si no está asociado) */
  entity_id?: string | null;
  
  /** Timestamp de asociación con entidad */
  associated_at?: string | null;
  
  /** Propósito del upload */
  purpose: UploadPurpose;
  
  /** Timestamp de expiración (típicamente 24h desde creación) */
  expires_at: string;
  
  /** Orden de visualización (para galerías) */
  sort_order: number;
  
  /** Indica si es la imagen principal */
  is_primary: boolean;
  
  /** Timestamps de auditoría */
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * Filtros para listar uploads
 */
export interface ListUploadsFilters {
  /** Filtrar por tipo de entidad */
  entity_type?: EntityType;
  
  /** Filtrar por ID de entidad específica */
  entity_id?: string;
  
  /** Filtrar por propósito */
  purpose?: UploadPurpose;
  
  /** Filtrar por estado */
  status?: FileStatus;
  
  /** Solo uploads huérfanos (no asociados) */
  is_orphaned?: boolean;
  
  /** Paginación */
  page?: number;
  page_size?: number;
}

/**
 * Response de listado paginado
 */
export interface ListUploadsResponse {
  items: StagedUpload[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Update payload para modificar un upload
 */
export interface UpdateUploadRequest {
  /** Cambiar orden de visualización */
  sort_order?: number;
  
  /** Marcar/desmarcar como primaria */
  is_primary?: boolean;
  
  /** Asociar a una entidad */
  entity_type?: EntityType;
  entity_id?: string;
}

/**
 * Error response de la API
 */
export interface UploadErrorResponse {
  detail: string;
  code?: string;
  field?: string;
}
