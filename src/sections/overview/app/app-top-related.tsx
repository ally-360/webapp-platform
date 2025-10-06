import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
// utils
// components
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function AppTopRelated({ title, subheader, list, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3, minWidth: 360 }}>
          {list.map((app) => (
            <ApplicationItem key={app.id} app={app} />
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
}

AppTopRelated.propTypes = {
  list: PropTypes.array,
  subheader: PropTypes.string,
  title: PropTypes.string
};

// ----------------------------------------------------------------------

function ApplicationItem({ app }) {
  const { name, min_stock, current_stock, pdv_name, sku } = app;
  const navigate = useNavigate();
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          onClick={() => navigate(paths.dashboard.product.details(app.id))}
          sx={{ cursor: 'pointer' }}
        >
          {name}
        </Typography>

        <Stack direction="row" alignItems="center" sx={{ mt: 0.5, color: 'text.secondary', flexWrap: 'wrap', flex: 1 }}>
          {/* <Typography variant="subtitle2">{sku}</Typography> */}
          <Typography variant="body2" noWrap>
            Inventario actual: {current_stock}
          </Typography>
          &nbsp;|&nbsp;
          <Typography variant="body2" noWrap>
            Mínimo: &nbsp;
            <Label color="error">{min_stock}</Label>
          </Typography>
        </Stack>
      </Box>

      <Stack alignItems="flex-end" flex={1}>
        <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', display: 'block' }}>
          {pdv_name}
        </Typography>
      </Stack>
    </Stack>
  );
}

ApplicationItem.propTypes = {
  app: PropTypes.object
};
