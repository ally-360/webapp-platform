import { Avatar } from '@mui/material';
import React from 'react';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// api
import { useGetUserAvatarQuery } from 'src/redux/services/userProfileApi';

function MyAvatar() {
  const { user } = useAuthContext();
  const { data: avatarData } = useGetUserAvatarQuery(undefined, { skip: !user });

  return (
    <Avatar
      alt={user?.profile?.first_name || 'User'}
      src={avatarData?.avatar_url || user?.profile?.avatar_url || undefined}
    />
  );
}

export default MyAvatar;
