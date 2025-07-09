import PropTypes from 'prop-types';
// components
import Markdown from 'src/components/markdown';
import React from 'react';

// ----------------------------------------------------------------------

export default function ProductDetailsDescription({ description }: { description?: string }) {
  return (
    <Markdown
      children={description || 'No hay descripción'}
      sx={{
        py: 1,
        '& p, li, ol': {
          typography: 'body2'
        },
        '& ol': {
          p: 0,
          display: { md: 'flex' },
          listStyleType: 'none',
          '& li': {
            '&:first-of-type': {
              minWidth: 240,
              mb: { xs: 0.5, md: 0 }
            }
          }
        }
      }}
    />
  );
}

ProductDetailsDescription.propTypes = {
  description: PropTypes.string
};
