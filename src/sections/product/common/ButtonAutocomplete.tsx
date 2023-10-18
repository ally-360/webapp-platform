import { Icon } from '@iconify/react';
import { Button, Paper } from '@mui/material';

const ButtonAutocomplete = ({ children, title, ...other }) => (
  <Paper
    {...other}
    style={{
      paddingBottom: 40,

      backdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backgroundImage: 'url(/assets/cyan-blur.png),url(/assets/red-blur.png)',
      backgroundRepeat: 'no-repeat,no-repeat',
      backgroundPosition: 'top right,left bottom',
      backgroundSize: '50%,50%',
      boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.24), -20px 20px 40px -4px rgba(145, 158, 171, 0.24)',
      borderRadius: '10px'
    }}
  >
    {console.log(title)}
    <Button
      fullWidth
      color="primary"
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={other.handleOnClick}
      type="button"
      style={{ position: 'absolute', bottom: 0, height: 40, borderRadius: '0 0px 12px 12px ' }}
    >
      {title}
      <Icon style={{ marginLeft: 10 }} icon="gala:add" width={18} height={18} />
    </Button>
    {children}
  </Paper>
);

export default ButtonAutocomplete;
