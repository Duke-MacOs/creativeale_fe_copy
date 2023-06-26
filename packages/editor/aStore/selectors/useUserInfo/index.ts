import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { UserPermission } from '@/types';
import useInitUser from './useInitUser';
import initImbot, { showImDialog } from './initImbot';

export const useHasUserPermission = (key: UserPermission) => {
  useInitUser();
  return useSelector(({ userinfo }: EditorState) => userinfo?.permissions.includes(key));
};

export const useUserInfo = () => {
  useInitUser();
  return useSelector(({ userinfo }: EditorState) => userinfo);
};

export const useImbot = () => {
  const imbot = useHasUserPermission('imbot');
  useEffect(() => {
    if (imbot && process.env.Mode !== 'development') {
      initImbot();
    }
  }, [imbot]);

  return { showImDialog };
};
