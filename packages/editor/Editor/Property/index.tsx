import React, { ReactNode, useRef } from 'react';
import { useGroup, useGlobalSettings, usePanoramaEdit } from './spark';
import { useStore } from 'react-redux';
import { FloatButton, theme } from 'antd';
import { IPanoramaEdit, useEditor } from '@editor/aStore';
import { ToTop } from '@icon-park/react';
import { css } from 'emotion';
import render from './cells';
import { isVRCaseAndInEdit } from '@editor/Template/Panorama/utils';
import { PanoramaGlobalSettings } from './spark/layouts/3D/PanoramaGlobalSettings';
import { PlayableSettings } from './spark/layouts/usePlayable';

export default function Property() {
  const { getState } = useStore();
  const globalSetting = useGlobalSettings();
  const panoramaEditSpark = usePanoramaEdit();
  const group = useGroup();

  return (
    <Container>
      {(settingsOn, playable, scroller, panoramaEdit) => {
        if (settingsOn) {
          return isVRCaseAndInEdit(getState().project) ? <PanoramaGlobalSettings /> : render(globalSetting);
        }
        if (panoramaEdit.type) {
          return render(panoramaEditSpark);
        }
        if (playable) {
          return <PlayableSettings />;
        }
        if (!group) {
          throw new Error('未匹配到合适的Group');
        }
        return (
          <div className={css({ position: 'relative' })}>
            {render(group)}
            <FloatButton.BackTop
              target={() => scroller.current}
              className={css({
                position: 'absolute',
                bottom: -10,
                right: 30,
              })}
            >
              <div
                className={css({
                  height: 40,
                  width: 40,
                  borderRadius: '50%',
                  color: '#fff',
                  textAlign: 'center',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: '11px',
                  backgroundColor: 'rgba(57, 85, 246, 0.6)',
                  zIndex: 100,
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(57, 85, 246, 0.8)',
                  },
                })}
              >
                <ToTop theme="outline" size="18" fill="#fff" />
              </div>
            </FloatButton.BackTop>
          </div>
        );
      }}
    </Container>
  );
}

function Container({
  children,
}: {
  children(
    settingsOn: boolean,
    playable: boolean | undefined,
    scroller: React.MutableRefObject<any>,
    panoramaEdit: IPanoramaEdit
  ): ReactNode;
}) {
  const { settingsOn } = useEditor(0, 'settingsOn');
  const { propsMode } = useEditor(0, 'propsMode');
  const { playable } = useEditor('playable');
  const { panoramaEdit } = useEditor(0, 'panoramaEdit');
  const scroller = useRef(null);
  const width = propsMode === 'Product' ? 378 : 340;

  const { token } = theme.useToken();
  return (
    <div
      id="editor-property"
      ref={scroller}
      style={{
        flex: `0 0 ${width}px`,
        maxWidth: `${width}px`,
      }}
      className={css({
        // background: '#fff',
        position: 'relative',
        height: '100%',
        borderLeft: `1px solid ${token.colorBorder}`,
        overflow: 'auto',
        paddingBottom: 32,
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      })}
    >
      {children(settingsOn, playable, scroller, panoramaEdit)}
    </div>
  );
}
