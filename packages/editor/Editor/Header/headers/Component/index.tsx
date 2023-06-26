/* eslint-disable react-hooks/exhaustive-deps */
import { memo } from 'react';
import { useEditor, useProject, useScene } from '@editor/aStore';
import { classnest } from '@editor/utils';
import CompButton from './CompButton';
import SceneModeSelect from '../../views/SceneModeSelect';
import className from '../../style';
import useChanged from '../../hooks/useChanged';
import Breadcrumb from './Breadcrumb';

export default memo(() => {
  const { readOnly } = useEditor(0, 'readOnly');
  const { loading } = useEditor(0, 'loading');
  const { playing } = useEditor(0, 'playing');
  const projectId = useProject('id');
  const orderId = useScene('orderId');
  const { changed, onReturn } = useChanged(Boolean(projectId && orderId));
  /**
   * projectId:
   *   - !== 0: 项目
   *   - === 0: 组件
   * readOnly:
   *   - true: 只读
   *   - false: 可编辑
   * orderId:
   *   - === 0: 公共
   *   - !== 0: 私有
   */
  return (
    <div className={className}>
      <Breadcrumb changed={changed} readOnly={readOnly} onReturn={onReturn} />

      <SceneModeSelect
        disabled={loading}
        options={[
          { label: '编辑组件模式', value: 'Project' },
          { label: '设置属性模式', value: 'Template' },
        ]}
      />
      <div className={classnest({ [`${className}-content`]: 3 })}>
        {!readOnly && (
          <CompButton publish disabled={playing > 0} changed={changed}>
            发布
          </CompButton>
        )}
        {projectId !== 0 && (
          <>
            <CompButton saveAs disabled={playing > 0} changed={changed}>
              另存为
            </CompButton>
            {orderId !== 0 && (
              <CompButton disabled={playing > 0} changed={changed}>
                保存并返回
              </CompButton>
            )}
          </>
        )}
      </div>
    </div>
  );
});
