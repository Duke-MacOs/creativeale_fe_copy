import React, { useMemo } from 'react';
import { Button, theme } from 'antd';
import Icon from '@ant-design/icons';
import { Left, Shop } from '@icon-park/react';
import { useSelector, useDispatch } from 'react-redux';
import { Category, changeCategory, useEditor, useProject, useSettings } from '../aStore';
import { ONBOARD_STEP_2 } from '@editor/Editor/OnBoarding/OnBoarding';
import { classnest, collectEvent, EventTypes } from '../utils';
import TipsPopup from '@editor/common/TipsPopup';
import getEntries from './entries';
import Preview from './Preview';
import { css, cx } from 'emotion';
import { resourceModalController } from '@editor/ResourceModal';

const styles = {
  scroll: css({
    overflow: 'auto',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  }),
  side: css({
    flex: '0 0 48px',
    position: 'relative',
    zIndex: 1,
  }),
  menu: css({
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  }),
  item: css({
    flex: 'none',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '8px 0',
    '&-active': {
      fontWeight: 'bold',
      color: 'blue',
    },
  }),
  content: css({
    width: '256px',
    position: 'absolute',
    height: '100%',
    right: 0,
    top: 0,
    transform: 'translateX(100%)',
    boxShadow: '4px 2px 6px -3px rgba(0,0,0,0.08)',
  }),
};

export default function Resource() {
  const { propsMode } = useEditor(0, 'propsMode');
  const typeOfPlay = useSettings('typeOfPlay');
  const { edit3d } = useEditor('edit3d');
  const type = useProject('type');
  const dispatch = useDispatch();
  const category = useSelector((state: EditorState) => state.resource.category);
  const entries = useMemo(
    () => getEntries({ type, edit3d, typeOfPlay, propsMode }),
    [type, edit3d, typeOfPlay, propsMode]
  );
  const entry = entries.find(({ key }) => key === category);
  const { token } = theme.useToken();
  return (
    <div className={styles.side}>
      <div
        className={cx(
          styles.menu,
          styles.scroll,
          css({
            background: token.colorBgLayout,
          })
        )}
        id={ONBOARD_STEP_2}
      >
        {entries.map(({ key, icon, name, tips }: any) => {
          const button = (
            <div
              key={key}
              className={classnest({ [styles.item]: { active: category === key } })}
              onClick={() => {
                if (key === 'Shape' || key === 'Button') {
                  collectEvent(EventTypes.SelectResource, {
                    type: key,
                  });
                }
                dispatch(changeCategory(key === category ? '' : (key as Category)));
              }}
            >
              {icon}
              <div>{name}</div>
            </div>
          );
          if (tips) {
            return (
              <TipsPopup
                key={key}
                placement="right"
                title={tips.title}
                content={tips.content}
                visibleKey={`${key}ResourceTips`}
              >
                {button}
              </TipsPopup>
            );
          }
          return button;
        })}
        {type === 'Project' && (
          <div
            style={{ color: 'orange', marginTop: 'auto' }}
            className={styles.item}
            onClick={resourceModalController.showModal}
          >
            <Shop theme="outline" size="22" />
            <div>资源库</div>
          </div>
        )}
      </div>
      {entry && (
        <React.Fragment>
          <div
            className={cx(
              styles.content,
              styles.scroll,
              css({
                background: token.colorBgContainer,
              })
            )}
          >
            {entry.comp}
          </div>
          <Button
            size="small"
            icon={<Icon component={Left as any} />}
            type="default"
            style={{
              position: 'absolute',
              border: 'none',
              borderRadius: '0 4px 4px 0',
              top: 0,
              right: -256,
              transform: 'translate(100%)',
            }}
            onClick={() => dispatch(changeCategory(''))}
          />
        </React.Fragment>
      )}
      <Preview content={entry?.comp} />
    </div>
  );
}
