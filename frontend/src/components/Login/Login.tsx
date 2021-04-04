import React, { useState } from 'react';
import PreJoinScreens from '../VideoCall/VideoFrontend/components/PreJoinScreens/PreJoinScreens';
import MediaErrorSnackbar
  from '../VideoCall/VideoFrontend/components/PreJoinScreens/MediaErrorSnackbar/MediaErrorSnackbar';
import { TownJoinResponse } from '../../classes/TownsServiceClient';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import UserDetails from "../VideoCall/VideoFrontend/components/UserDetails/UserDetails";

interface LoginProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

export default function Login({ doLogin }: LoginProps): JSX.Element {
  const [mediaError, setMediaError] = useState<Error>();

  return (
    <>
      <MediaErrorSnackbar error={mediaError} dismissError={() => setMediaError(undefined)} />
      <LoginButton/>
      <LogoutButton/>
      <UserDetails/>
      <PreJoinScreens
        doLogin={doLogin}
        setMediaError={setMediaError}
      />
    </>
  );
}
