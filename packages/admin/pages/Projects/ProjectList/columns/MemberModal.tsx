import { MemberTable } from '@main/pages/Members/MemberTable';
import { ParamsContext } from '@main/routes/withPath';
import { IAdminUserParams } from '@main/pages/Members';
import { useUserInfo } from '@shared/userInfo';
import { useState } from 'react';
import { Modal } from 'antd';

interface MemberModalProps {
  onFinish: (userId: string) => void;
  onCancel: () => void;
  current: string;
}

export const MemberModal = ({ onFinish, onCancel, current }: MemberModalProps) => {
  const [selected, setSelected] = useState('');
  const {
    userInfo: { teamId, userId },
  } = useUserInfo();
  const defaultParams = {
    page: 1,
    pageSize: 10,
    keyword: '',
    deleted: '0',
    userId: '',
    roles: '',
    teamId,
  };
  const [params, setParams] = useState<IAdminUserParams>(defaultParams);
  return (
    <Modal
      open
      width={600}
      centered={true}
      title="选择协作成员"
      onCancel={onCancel}
      okButtonProps={{ disabled: !selected || selected === userId }}
      onOk={() => {
        onFinish(selected);
      }}
    >
      <ParamsContext.Provider
        value={{
          params,
          defaultParams,
          onParamsChange(params) {
            setParams(p => ({ ...p, ...params }));
          },
        }}
      >
        <MemberTable value={selected} excludedValue={current} onChange={setSelected} />
      </ParamsContext.Provider>
    </Modal>
  );
};
