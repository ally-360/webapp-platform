// ----------------------------------------------------------------------

export default function CssBaseline(theme) {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box'
        },
        html: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch'
        },
        body: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',

          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 8
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 12,
            backgroundColor: '#6b6b6b',
            minHeight: 24,

            // border: `4px solid ${theme.palette.background.default}`,
            opacity: 0
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: '#959595'
          },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
            backgroundColor: '#959595'
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#959595'
          },
          '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
            backgroundColor: '#2b2b2b'
          }
        },
        '#root, #__next': {
          width: '100%',
          height: '100%'
        },
        input: {
          '&[type=number]': {
            MozAppearance: 'textfield',
            '&::-webkit-outer-spin-button': {
              margin: 0,
              WebkitAppearance: 'none'
            },
            '&::-webkit-inner-spin-button': {
              margin: 0,
              WebkitAppearance: 'none'
            }
          }
        },
        img: {
          maxWidth: '100%',
          display: 'inline-block',
          verticalAlign: 'bottom'
        }
      }
    }
  };
}
