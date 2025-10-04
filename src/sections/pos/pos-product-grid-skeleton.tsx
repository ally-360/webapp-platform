import React from 'react';
// @mui
import { Grid, Card, CardContent, Skeleton, Stack, Box } from '@mui/material';

interface Props {
  count?: number;
}

export default function PosProductGridSkeleton({ count = 12 }: Props) {
  const skeletonItems = Array.from({ length: count }, (_, index) => index);

  return (
    <Box sx={{ p: 2 }}>
      {/* Search Bar Skeleton */}
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="rectangular" height={40} />
      </Box>

      {/* Products Grid Skeleton */}
      <Grid container spacing={2}>
        {skeletonItems.map((index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ flex: 1, pb: 1 }}>
                <Stack spacing={1}>
                  {/* Avatar & Category Skeleton */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: '12px' }} />
                  </Stack>

                  {/* Product Name Skeleton */}
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="text" height={20} width="80%" />

                  {/* SKU Skeleton */}
                  <Skeleton variant="text" height={16} width="60%" />

                  {/* Price Skeleton */}
                  <Skeleton variant="text" height={28} width="50%" sx={{ mt: 1 }} />

                  {/* Stock Info Skeleton */}
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Skeleton variant="circular" width={16} height={16} />
                    <Skeleton variant="text" height={16} width="40%" />
                  </Stack>
                </Stack>
              </CardContent>

              {/* Button Skeleton */}
              <Box sx={{ p: 1, pt: 0 }}>
                <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
