import { useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

export interface FormDraftOptions<T> {
  key: string; // Clave única para el localStorage
  data: T; // Datos actuales del formulario
  enabled?: boolean; // Si está habilitado el autoguardado
  debounceMs?: number; // Tiempo de debounce para guardar (ms)
}

export interface FormDraftResult {
  hasDraft: boolean; // Si existe un borrador guardado
  clearDraft: () => void; // Función para limpiar el borrador
  saveDraft: () => void; // Función para guardar manualmente
}

/**
 * Hook para gestionar borradores de formularios en localStorage
 * Permite autoguardado y recuperación de datos del formulario
 *
 * @example
 * const { hasDraft, clearDraft } = useFormDraft({
 *   key: 'debit-note-draft',
 *   data: formData,
 *   enabled: !isEdit
 * });
 */
export function useFormDraft<T = any>(options: FormDraftOptions<T>): FormDraftResult {
  const { key, data, enabled = true, debounceMs = 2000 } = options;

  const [hasDraft, setHasDraft] = useState(false);

  // Verificar si existe un borrador al montar
  useEffect(() => {
    if (!enabled) {
      setHasDraft(false);
      return;
    }

    try {
      const saved = localStorage.getItem(key);
      setHasDraft(!!saved);
    } catch (error) {
      console.error('Error checking draft:', error);
      setHasDraft(false);
    }
  }, [key, enabled]);

  // Autoguardar con debounce
  useEffect(() => {
    if (!enabled || !data) return;

    const timeoutId = setTimeout(() => {
      try {
        const serialized = JSON.stringify({
          data,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem(key, serialized);
        setHasDraft(true);
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [key, data, enabled, debounceMs]);

  // Limpiar borrador
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setHasDraft(false);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, [key]);

  // Guardar manualmente
  const saveDraft = useCallback(() => {
    if (!enabled || !data) return;

    try {
      const serialized = JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(key, serialized);
      setHasDraft(true);
    } catch (error) {
      console.error('Error saving draft manually:', error);
    }
  }, [key, data, enabled]);

  return {
    hasDraft,
    clearDraft,
    saveDraft
  };
}

/**
 * Recuperar un borrador guardado del localStorage
 */
export function getDraft<T = any>(key: string): { data: T; timestamp: string } | null {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    return parsed;
  } catch (error) {
    console.error('Error getting draft:', error);
    return null;
  }
}

/**
 * Verificar si existe un borrador
 */
export function hasDraftSaved(key: string): boolean {
  try {
    return !!localStorage.getItem(key);
  } catch (error) {
    return false;
  }
}
