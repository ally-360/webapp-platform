import React, { useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Icon } from '@iconify/react';
import { enqueueSnackbar } from 'notistack';
import { paths } from 'src/routes/paths';
import { useNavigate } from 'react-router-dom';
import { ChartToolbar } from 'src/sections/accounting/components/ChartToolbar';
import { FilterDrawer } from 'src/sections/accounting/components/FilterDrawer';
import { AuditDrawer } from 'src/sections/accounting/components/AuditDrawer';
import { AccountWizardDialog } from 'src/sections/accounting/components/AccountWizardDialog';
import { AccountNature, AccountStatus, ChartAccountNode } from 'src/sections/accounting/types';

function natureLabel(n: AccountNature) {
  return n === 'DEBIT' ? 'Débito' : 'Crédito';
}

function statusColor(s: AccountStatus) {
  switch (s) {
    case 'ACTIVE':
      return 'success';
    case 'BLOCKED':
      return 'warning';
    case 'ARCHIVED':
      return 'default';
    default:
      return 'default';
  }
}

function deriveParentIdByCode(code: string, level: ChartAccountNode['level'], all: ChartAccountNode[]): string | null {
  if (level === 'CLASS') return null;
  let parentLength = 1;
  if (level === 'ACCOUNT') parentLength = 2;
  if (level === 'SUBACCOUNT') parentLength = 4;
  const parentCode = code.slice(0, parentLength);
  const parent = all.find((r) => r.code === parentCode);
  return parent ? parent.id : null;
}

// Mock data with a standard PUC-like seed (Servicios)
const seedAccounts: ChartAccountNode[] = [
  { id: '1', code: '1', name: 'Activo', level: 'CLASS', nature: 'DEBIT', status: 'ACTIVE' },
  {
    id: '11',
    code: '11',
    name: 'Disponible',
    level: 'GROUP',
    nature: 'DEBIT',
    status: 'ACTIVE',
    parentId: '1'
  },
  {
    id: '1105',
    code: '1105',
    name: 'Caja',
    level: 'ACCOUNT',
    nature: 'DEBIT',
    status: 'ACTIVE',
    parentId: '11',
    reconcilable: true,
    allowMovements: true,
    usage: ['BANCOS']
  },
  {
    id: '110505',
    code: '110505',
    name: 'Caja general',
    level: 'SUBACCOUNT',
    nature: 'DEBIT',
    status: 'ACTIVE',
    parentId: '1105',
    reconcilable: true,
    allowMovements: true,
    usage: ['BANCOS']
  },
  { id: '2', code: '2', name: 'Pasivo', level: 'CLASS', nature: 'CREDIT', status: 'ACTIVE' },
  {
    id: '22',
    code: '22',
    name: 'Obligaciones financieras',
    level: 'GROUP',
    nature: 'CREDIT',
    status: 'ACTIVE',
    parentId: '2'
  },
  {
    id: '2205',
    code: '2205',
    name: 'Bancos',
    level: 'ACCOUNT',
    nature: 'CREDIT',
    status: 'ACTIVE',
    parentId: '22',
    reconcilable: true
  },
  {
    id: '220505',
    code: '220505',
    name: 'Banco corriente',
    level: 'SUBACCOUNT',
    nature: 'CREDIT',
    status: 'ACTIVE',
    parentId: '2205',
    reconcilable: true
  },
  { id: '4', code: '4', name: 'Ingresos', level: 'CLASS', nature: 'CREDIT', status: 'ACTIVE' },
  {
    id: '41',
    code: '41',
    name: 'Ingresos operacionales',
    level: 'GROUP',
    nature: 'CREDIT',
    status: 'ACTIVE',
    parentId: '4'
  },
  {
    id: '4135',
    code: '4135',
    name: 'Servicios',
    level: 'ACCOUNT',
    nature: 'CREDIT',
    status: 'ACTIVE',
    parentId: '41',
    taxTags: ['IVA']
  },
  {
    id: '413505',
    code: '413505',
    name: 'Servicios profesionales',
    level: 'SUBACCOUNT',
    nature: 'CREDIT',
    status: 'ACTIVE',
    parentId: '4135',
    taxTags: ['IVA'],
    usage: ['VENTAS']
  }
];

// Alternative seeds (simple mocks)
const seedCommerce: ChartAccountNode[] = [
  { id: '1c', code: '1', name: 'Activo', level: 'CLASS', nature: 'DEBIT', status: 'ACTIVE' },
  {
    id: '11c',
    code: '11',
    name: 'Disponible',
    level: 'GROUP',
    nature: 'DEBIT',
    status: 'ACTIVE',
    parentId: '1c'
  },
  {
    id: '1435c',
    code: '1435',
    name: 'Inventarios mercancías',
    level: 'ACCOUNT',
    nature: 'DEBIT',
    status: 'ACTIVE',
    parentId: '11c',
    usage: ['INVENTARIO']
  },
  {
    id: '4135c',
    code: '4135',
    name: 'Ingresos por ventas',
    level: 'ACCOUNT',
    nature: 'CREDIT',
    status: 'ACTIVE',
    parentId: '41c',
    taxTags: ['IVA']
  },
  { id: '4c', code: '4', name: 'Ingresos', level: 'CLASS', nature: 'CREDIT', status: 'ACTIVE' },
  {
    id: '41c',
    code: '41',
    name: 'Ingresos operacionales',
    level: 'GROUP',
    nature: 'CREDIT',
    status: 'ACTIVE',
    parentId: '4c'
  }
];

const seedManufacturing: ChartAccountNode[] = [
  { id: '1m', code: '1', name: 'Activo', level: 'CLASS', nature: 'DEBIT', status: 'ACTIVE' },
  {
    id: '14m',
    code: '14',
    name: 'Inventarios',
    level: 'GROUP',
    nature: 'DEBIT',
    status: 'ACTIVE',
    parentId: '1m'
  },
  {
    id: '1405m',
    code: '1405',
    name: 'Materia prima',
    level: 'ACCOUNT',
    nature: 'DEBIT',
    status: 'ACTIVE',
    parentId: '14m',
    usage: ['INVENTARIO']
  },
  { id: '5m', code: '5', name: 'Gastos', level: 'CLASS', nature: 'DEBIT', status: 'ACTIVE' },
  {
    id: '51m',
    code: '51',
    name: 'Gastos de administración',
    level: 'GROUP',
    nature: 'DEBIT',
    status: 'ACTIVE',
    parentId: '5m'
  }
];

export default function ChartOfAccountsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ChartAccountNode[]>(seedAccounts);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [auditOpen, setAuditOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editing, setEditing] = useState<ChartAccountNode | null>(null);
  const [sortKey, setSortKey] = useState<'code' | 'name'>('code');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [filterNature, setFilterNature] = useState<AccountNature | ''>('');
  const [filterStatus, setFilterStatus] = useState<AccountStatus | ''>('');
  const [filterFlags, setFilterFlags] = useState({
    requiresThirdParty: false,
    requiresCostCenter: false,
    reconcilable: false,
    allowMovements: false
  });

  const anyFilterActive = useMemo(
    () =>
      Boolean(filterText.trim()) ||
      Boolean(filterNature) ||
      Boolean(filterStatus) ||
      Object.values(filterFlags).some(Boolean),
    [filterText, filterNature, filterStatus, filterFlags]
  );

  const treeComparator = useMemo(
    () => (a: ChartAccountNode, b: ChartAccountNode) => {
      const av = sortKey === 'code' ? a.code : a.name.toLowerCase();
      const bv = sortKey === 'code' ? b.code : b.name.toLowerCase();
      const base = av.localeCompare(bv, 'es', { numeric: true, sensitivity: 'base' });
      return sortDir === 'asc' ? base : -base;
    },
    [sortKey, sortDir]
  );

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'code',
        headerName: 'Código',
        width: 140,
        sortable: false
      },
      {
        field: 'name',
        headerName: 'Nombre',
        flex: 1,
        minWidth: 220,
        sortable: false,
        renderCell: (params) => {
          const node = params.row as ChartAccountNode & { __depth?: number };
          const depth = node.__depth || 0;
          const hasChildren = rows.some((r) => r.parentId === node.id);
          return (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%', pl: depth * 2 }}>
              {hasChildren && (
                <IconButton size="small" onClick={() => setExpanded((e) => ({ ...e, [node.id]: !e[node.id] }))}>
                  <Icon icon={expanded[node.id] ? 'mdi:chevron-down' : 'mdi:chevron-right'} />
                </IconButton>
              )}
              <Typography variant="body2">{node.name}</Typography>
            </Stack>
          );
        }
      },
      {
        field: 'nature',
        headerName: 'Naturaleza',
        width: 140,
        sortable: false,
        valueGetter: ({ row }) => natureLabel(row.nature)
      },
      {
        field: 'status',
        headerName: 'Estado',
        width: 140,
        sortable: false,
        renderCell: ({ row }) => <Chip label={row.status} color={statusColor(row.status) as any} size="small" />
      },
      {
        field: 'flags',
        headerName: 'Flags',
        flex: 1,
        minWidth: 260,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {row.requiresThirdParty && <Chip size="small" label="Req. tercero" />}
            {row.requiresCostCenter && <Chip size="small" label="Req. CC" />}
            {row.reconcilable && <Chip size="small" label="Conciliable" />}
            {row.allowMovements && <Chip size="small" label="Movimientos" />}
          </Stack>
        )
      },
      {
        field: 'taxTags',
        headerName: 'Impuestos',
        width: 160,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {(row.taxTags || []).map((t: string) => (
              <Chip key={t} size="small" label={t} color="info" variant="outlined" />
            ))}
          </Stack>
        )
      },
      {
        field: 'usage',
        headerName: 'Uso/Mapeo',
        width: 200,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {(row.usage || []).map((u: string) => (
              <Chip key={u} size="small" label={u} variant="outlined" />
            ))}
          </Stack>
        )
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={() => {
                  setEditing(row as ChartAccountNode);
                  setWizardOpen(true);
                }}
              >
                <Icon icon="mdi:pencil" />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [rows, expanded]
  );

  // Flatten with expansion
  type VisibleRow = ChartAccountNode & { __depth: number };
  const visibleRows = useMemo(() => {
    const term = filterText.trim().toLowerCase();

    const children = new Map<string, ChartAccountNode[]>();
    const parentOf = new Map<string, string | null>();
    rows.forEach((r) => {
      if (r.parentId) {
        children.set(r.parentId, [...(children.get(r.parentId) || []), r]);
      }
      parentOf.set(r.id, r.parentId ?? null);
    });

    const matchSet = new Set<string>();

    function matches(r: ChartAccountNode): boolean {
      if (term) {
        const text = `${r.code} ${r.name}`.toLowerCase();
        if (!text.includes(term)) return false;
      }
      if (filterNature && r.nature !== filterNature) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterFlags.requiresThirdParty && !r.requiresThirdParty) return false;
      if (filterFlags.requiresCostCenter && !r.requiresCostCenter) return false;
      if (filterFlags.reconcilable && !r.reconcilable) return false;
      if (filterFlags.allowMovements && !r.allowMovements) return false;
      return true;
    }

    const filterActive =
      Boolean(term) || Boolean(filterNature) || Boolean(filterStatus) || Object.values(filterFlags).some(Boolean);

    if (filterActive) {
      rows.forEach((r) => {
        if (matches(r)) matchSet.add(r.id);
      });
    }

    const ancestors = new Set<string>();
    if (filterActive) {
      matchSet.forEach((id) => {
        let cur = parentOf.get(id) || null;
        while (cur) {
          ancestors.add(cur);
          cur = parentOf.get(cur) || null;
        }
      });
    }

    const includeSet = filterActive ? new Set<string>([...matchSet, ...ancestors]) : null;
    const autoExpand = ancestors; // expand ancestors paths so matches are visible

    const result: VisibleRow[] = [];

    function pushWithTree(node: ChartAccountNode, depth = 0) {
      const shouldInclude = !filterActive || (includeSet && includeSet.has(node.id));
      if (!shouldInclude) return;

      result.push({ ...(node as ChartAccountNode), __depth: depth });
      const isExpanded = Boolean(expanded[node.id]) || autoExpand.has(node.id);
      if (isExpanded) {
        (children.get(node.id) || []).sort(treeComparator).forEach((c) => pushWithTree(c, depth + 1));
      }
    }

    // roots
    rows
      .filter((r) => !r.parentId)
      .sort(treeComparator)
      .forEach((root) => pushWithTree(root));

    return result;
  }, [rows, expanded, treeComparator, filterText, filterNature, filterStatus, filterFlags]);

  const handleCreateOpen = () => {
    setEditing(null);
    setWizardOpen(true);
  };
  const handleImport = () => navigate(paths.dashboard.accounting.import);
  const handleExport = () => enqueueSnackbar('Exportación generada (mock)', { variant: 'success' });
  const handleExpandAll = () => {
    const all: Record<string, boolean> = {};
    rows.forEach((r) => {
      if (rows.some((x) => x.parentId === r.id)) all[r.id] = true;
    });
    setExpanded(all);
  };
  const handleCollapseAll = () => setExpanded({});

  const loadTemplate = (type: 'SERVICES' | 'COMMERCE' | 'MANUFACTURING') => {
    let data: ChartAccountNode[] = [];
    if (type === 'SERVICES') data = seedAccounts;
    if (type === 'COMMERCE') data = seedCommerce;
    if (type === 'MANUFACTURING') data = seedManufacturing;
    setRows(data);
    setExpanded({});
    enqueueSnackbar('Plantilla PUC cargada (mock)', { variant: 'success' });
  };

  const hasData = rows.length > 0;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Catálogo de Cuentas</Typography>
        <ChartToolbar
          onCreate={handleCreateOpen}
          onImport={handleImport}
          onExport={handleExport}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onOpenAudit={() => setAuditOpen(true)}
          onOpenFilters={() => setFilterOpen(true)}
          filterActive={anyFilterActive}
          onClearFilter={() => {
            setFilterText('');
            setFilterNature('');
            setFilterStatus('');
            setFilterFlags({
              requiresThirdParty: false,
              requiresCostCenter: false,
              reconcilable: false,
              allowMovements: false
            });
          }}
        />
      </Stack>

      {!hasData ? (
        <Card>
          <CardContent>
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="h6">Aún no tienes un catálogo</Typography>
              <Typography variant="body2" color="text.secondary">
                Carga una plantilla inicial del PUC para comenzar. Podrás editarlo luego.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={() => loadTemplate('SERVICES')}>
                  PUC Servicios
                </Button>
                <Button variant="outlined" onClick={() => loadTemplate('COMMERCE')}>
                  PUC Comercio
                </Button>
                <Button variant="outlined" onClick={() => loadTemplate('MANUFACTURING')}>
                  PUC Manufactura
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <DataGrid
              autoHeight
              rows={visibleRows}
              columns={columns}
              getRowId={(r) => r.id}
              disableRowSelectionOnClick
              disableColumnMenu
              sx={{ border: 'none' }}
            />
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 3 }} />

      <Card>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Historial / Auditoría (mock)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Próximamente verás aquí los eventos de creación/edición/borrado con usuario, fecha y observaciones.
          </Typography>
          <Button
            size="small"
            startIcon={<Icon icon="mdi:history" />}
            sx={{ mt: 1 }}
            onClick={() => setAuditOpen(true)}
          >
            Ver historial
          </Button>
        </CardContent>
      </Card>

      <AccountWizardDialog
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSubmit={(payload) => {
          if (editing) {
            setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...payload } : r)));
            enqueueSnackbar('Cuenta actualizada (mock)', { variant: 'success' });
          } else {
            const id = payload.code; // simple id for mock
            const parentId = deriveParentIdByCode(payload.code, payload.level, rows);
            const newNode: ChartAccountNode = { id, parentId, status: 'ACTIVE', ...payload };
            setRows((prev) => [...prev, newNode]);
            enqueueSnackbar('Cuenta creada (mock)', { variant: 'success' });
          }
          setWizardOpen(false);
          setEditing(null);
        }}
        initial={editing || undefined}
        existingCodes={rows.map((r) => r.code)}
      />

      <AuditDrawer open={auditOpen} onClose={() => setAuditOpen(false)} />
      <FilterDrawer
        open={filterOpen}
        initialText={filterText}
        initialSortKey={sortKey}
        initialSortDir={sortDir}
        initialNature={filterNature}
        initialStatus={filterStatus}
        initialFlags={filterFlags}
        onClose={() => setFilterOpen(false)}
        onApply={(payload) => {
          setFilterText(payload.text.trim());
          setSortKey(payload.sortKey);
          setSortDir(payload.sortDir);
          setFilterNature(payload.nature);
          setFilterStatus(payload.status);
          setFilterFlags(payload.flags);
          setFilterOpen(false);
        }}
      />
    </Box>
  );
}
