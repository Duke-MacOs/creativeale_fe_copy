import { memo } from 'react';
import { useStore } from 'react-redux';
import Icon from '@ant-design/icons';
import { Copy, SettingTwo } from '@icon-park/react';
import { useEditor, useSettings } from '@editor/aStore';
import logoImage from './logoImage.svg';
import HeaderButton from './HeaderButton';
import UndoAndRedo from './UndoAndRedo';
import DebugFlags from './DebugFlags';
import CaseName from './CaseName';
import type useAutoSaving from '@editor/Editor/Header/hooks/useSaving';
import SceneModeSelect from '../../views/SceneModeSelect';
import Preview from './Preview';
import Submit from './Submit';
import Helping from './Helping';
import { amIHere } from '@shared/utils';
import { classnest } from '@editor/utils';
import className from '../../style';
import { http } from '@shared/api';
import { collectEvent, EventTypes } from '@editor/utils';
import Service from './Service';
import Saving from './Saving';
import { ONBOARD_STEP_6 } from '@editor/Editor/OnBoarding/OnBoarding';
import { css, cx } from 'emotion';

export const projectSaveAs = async (projectId: number) => {
  const {
    data: {
      data: { id },
    },
  } = await http.post(`project/saveAs`, { id: projectId });
  const url = new URL(location.href);
  url.pathname = url.pathname.replace(/\d+/, String(id));
  url.searchParams.delete('readonly');
  url.searchParams.delete('type');
  url.searchParams.delete('from');
  if (url.searchParams.get('id')) {
    url.searchParams.set('id', String(id));
  }
  location.href = url.href;
};

export default memo(({ onSaving }: Pick<ReturnType<typeof useAutoSaving>, 'onSaving'>) => {
  const { panoramaEdit, onChange: onChangePanoramaEdit } = useEditor(0, 'panoramaEdit');
  const { settingsOn, onChange } = useEditor(0, 'settingsOn');
  const { sceneMode } = useEditor(0, 'sceneMode');
  const { readOnly } = useEditor(0, 'readOnly');
  const { skinning } = useEditor(0, 'skinning');
  const { loading } = useEditor(0, 'loading');
  const { getState } = useStore<EditorState>();
  const typeOfPlay = useSettings('typeOfPlay');
  const category = useSettings('category');
  const isVRVideo = typeOfPlay === 3 && category === 3;
  // const { token } = theme.useToken();
  return (
    <div className={cx(className)}>
      <div className={classnest({ [`${className}-content`]: 1 })}>
        <div
          className={`${className}-img`}
          onClick={() => {
            if (location.href.includes('from=rubeex')) {
              location.href = '/';
            } else {
              location.href = '/my/project';
            }
          }}
        >
          <img src={logoImage} />
        </div>
      </div>
      <CaseName disabled={loading || readOnly} readOnly={readOnly} />
      {typeOfPlay !== 4 && !isVRVideo && (
        <SceneModeSelect
          options={[
            { label: '素材制作', value: 'Project' },
            { label: '模板配置', value: 'Template' },
            { label: '模板换肤', value: 'Product' },
          ]}
        />
      )}
      <div className={classnest({ [`${className}-content`]: 3 })}>
        {sceneMode === 'Product' ? (
          <UndoAndRedo disabled={loading} />
        ) : (
          <>
            <div>
              <Service />
            </div>
            <div>
              <Helping />
            </div>
            {typeOfPlay !== 4 && (
              <HeaderButton
                disabled={loading}
                type={settingsOn ? 'primary' : 'default'}
                icon={<Icon component={SettingTwo as any} />}
                onClick={() => {
                  onChange(!settingsOn, true);
                  onChangePanoramaEdit({ ...panoramaEdit, type: undefined });
                  collectEvent(EventTypes.OperationButton, {
                    type: '全局',
                  });
                }}
              >
                全局
              </HeaderButton>
            )}
          </>
        )}
        <div className={css({ display: 'flex' })} id={ONBOARD_STEP_6}>
          <Preview disabled={loading} getState={getState} onSaving={onSaving} />
          {!readOnly && <Saving disabled={loading} onSaving={onSaving} />}
          {readOnly && amIHere({ release: true }) && (
            <HeaderButton
              icon={<Icon component={Copy as any} />}
              disabled={loading}
              onClick={async () => {
                collectEvent(EventTypes.OperationButton, {
                  type: '另存版本',
                });
                await projectSaveAs(getState().project.id);
              }}
            >
              另存版本
            </HeaderButton>
          )}
          <Submit
            disabled={loading}
            skinning={skinning}
            sceneMode={sceneMode}
            getState={getState}
            onSaving={onSaving}
          />
        </div>
        <DebugFlags />
      </div>
    </div>
  );
});
