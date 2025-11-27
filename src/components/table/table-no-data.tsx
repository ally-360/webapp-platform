// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import { useRouter } from 'src/routes/hook';
import { Icon } from '@iconify/react';
import React from 'react';
import EmptyContent from '../empty-content';

// ----------------------------------------------------------------------

interface TableNoDataProps {
  notFound: boolean;
  sx?: object;
  text?: string;

  // 🆕 Nuevas props para mejorar UX
  hasFilters?: boolean; // Indica si hay filtros activos
  emptyStateConfig?: {
    title?: string;
    description?: string;
    action?: {
      label: string;
      href: string;
      icon?: string;
    };
  };
}

export default function TableNoData({ notFound, sx, text, hasFilters = false, emptyStateConfig }: TableNoDataProps) {
  const router = useRouter();

  // 📊 Si hay filtros activos, mostrar mensaje de "sin resultados"
  if (notFound && hasFilters) {
    return (
      <TableRow>
        <TableCell colSpan={12}>
          <EmptyContent
            filled
            title={text || 'No se encontraron resultados'}
            description="Intenta ajustar los filtros o realizar una búsqueda diferente"
            imgUrl="/assets/icons/empty/ic_folder_empty.svg"
            sx={{
              py: 10,
              ...sx
            }}
          />
        </TableCell>
      </TableRow>
    );
  }

  // 📭 Estado vacío (sin items creados)
  if (notFound && emptyStateConfig) {
    const actionButton = emptyStateConfig.action ? (
      <Button
        variant="contained"
        size="large"
        startIcon={
          emptyStateConfig.action.icon ? (
            <Icon icon={emptyStateConfig.action.icon} width={24} />
          ) : (
            <Icon icon="mingcute:add-line" width={24} />
          )
        }
        onClick={() => router.push(emptyStateConfig.action!.href)}
        sx={{ mt: 3 }}
      >
        {emptyStateConfig.action.label}
      </Button>
    ) : undefined;

    return (
      <TableRow>
        <TableCell colSpan={12}>
          <EmptyContent
            filled
            title={emptyStateConfig.title || text || 'No hay datos disponibles'}
            description={emptyStateConfig.description}
            imgUrl="/assets/icons/empty/ic_content.svg"
            action={actionButton}
            sx={{
              py: 10,
              ...sx
            }}
          />
        </TableCell>
      </TableRow>
    );
  }

  // 🔄 Fallback al comportamiento original
  return (
    <TableRow>
      {notFound ? (
        <TableCell colSpan={12}>
          <EmptyContent
            filled
            title={text || 'No se encontraron datos'}
            sx={{
              py: 10,
              ...sx
            }}
          />
        </TableCell>
      ) : (
        <TableCell colSpan={12} sx={{ p: 0 }} />
      )}
    </TableRow>
  );
}
