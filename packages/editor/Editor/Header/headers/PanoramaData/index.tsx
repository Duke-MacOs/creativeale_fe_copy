/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo } from 'react';
import { useEditor, useProject, useScene } from '@editor/aStore';
import { classnest } from '@editor/utils';
import className from '../../style';
import useChanged from '../../hooks/useChanged';
import CompButton from '../Component/PanoramaButton';
import Breadcrumb from '../Component/Breadcrumb';

export default memo(() => {
  const { readOnly } = useEditor(0, 'readOnly');
  const { playing } = useEditor(0, 'playing');
  const projectId = useProject('id');
  const orderId = useScene('orderId');
  const { changed, onReturn } = useChanged(Boolean(projectId && orderId));
  return (
    <div className={className}>
      <Breadcrumb changed={changed} readOnly={readOnly} onReturn={onReturn} />

      <div className={classnest({ [`${className}-content`]: 3 })}>
        <CompButton disabled={playing > 0} changed={changed}>
          保存并返回
        </CompButton>
      </div>
    </div>
  );
});
