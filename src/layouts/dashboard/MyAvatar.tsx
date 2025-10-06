import { Avatar } from '@mui/material';
import React from 'react';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// api
import { useGetUserAvatarQuery } from 'src/redux/services/userProfileApi';

function MyAvatar() {
  const { user } = useAuthContext();
  const { data: avatarData } = useGetUserAvatarQuery();

  return <Avatar alt={user?.profile?.name || 'User'} src={avatarData?.avatar_url || user?.profile?.photo} />;
}

export default MyAvatar;
