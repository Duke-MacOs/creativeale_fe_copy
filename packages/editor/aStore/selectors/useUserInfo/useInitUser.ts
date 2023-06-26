import { useEffect } from 'react';
import { useStore } from 'react-redux';
import Axios from 'axios';
import { updateUserInfo } from '../../userinfo';
import { getUserInfo } from '@shared/api';
import { amIHere } from '@shared/utils';

let cloudUrl = 'https://magicplay.oceanengine.com/static-cloud/invoke/beta_function';
if (!amIHere({ online: true })) {
  cloudUrl += '_boe';
}

let notInit = true;
export default () => {
  const { getState, dispatch } = useStore<EditorState, EditorAction>();
  useEffect(() => {
    if (notInit && !getState().userinfo) {
      notInit = false;
      getUserInfo()
        .then(async info => {
          try {
            await Axios.post(cloudUrl, {
              online: amIHere({ release: true }),
              userId: info.userId,
              advId: new URLSearchParams(location.search).get('aadvid'),
              cusId: info.customerInfo?.customerId,
            }).then(({ data: { permissions } }) => {
              dispatch(updateUserInfo({ ...info, permissions }));
            });
          } catch {
            dispatch(updateUserInfo(info));
          }
        })
        .catch(() => {
          notInit = true;
        });
    }
  }, [getState, dispatch]);
};
