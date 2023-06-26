import { useEffect, useState } from 'react';
import { useSettings } from '@editor/aStore';
import { useVisible } from '@editor/hooks';
import { OnBoarding } from './OnBoarding';
import { Button, Modal } from 'antd';
import { css } from 'emotion';
import Player from 'xgplayer';
import 'xgplayer/dist/xgplayer.min.css';
import { Close } from '@icon-park/react';
import Icon from '@ant-design/icons';

export function TutorialModal() {
  const [visible, setVisible] = useVisible('onboarding');
  const [localVisible, setLocalVisible] = useState(true);
  const typeOfPlay = useSettings('typeOfPlay');
  useEffect(() => {
    if (typeOfPlay === 3 && visible && localVisible) {
      const vh = Math.floor((656 * 9) / 16);
      const url =
        typeOfPlay === 3
          ? 'https://v9-default.365yg.com/40cda788ca1e96a778206a25b00b0ae3/75a2528e/video/tos/cn/tos-cn-v-736065/1daa5c232b91467b9d8accf29b36249f/'
          : 'https://v3-default.ixigua.com/d032b2b295e15eee10a1e368d749e35a/7447c0e3/video/tos/cn/tos-cn-v-736065/a048e6ee07234090b14764553a63538f/';
      const player = new Player({
        id: 'xgVideo1',
        url,
        height: `${vh}px`,
        width: '100%',
        cssFullscreen: false,
        playbackRate: false,
        controls: false,
        commonStyle: {
          playedColor: '#5676EA',
          sliderBtnStyle: { borderColor: 'none' },
        },
      });
      return () => {
        player.destroy(true);
      };
    }
  }, [typeOfPlay, visible, localVisible]);

  if (typeOfPlay !== 3) {
    return null;
  }
  return (
    <>
      <Modal
        width={704}
        title={<div className={css({ textAlign: 'center', fontSize: 16 })}>直出互动编辑器怎么用？</div>}
        footer={null}
        closeIcon={<Icon component={Close as any} />}
        centered
        maskClosable={false}
        open={visible && localVisible}
        onCancel={() => {
          setVisible(false);
        }}
        className={css({
          '.ant-modal-header': {
            borderBottom: 'none',
          },
          '.ant-modal-body': {
            padding: '0 24px 24px',
          },
        })}
      >
        <div>
          <div id="xgVideo1" />
          <div
            className={css({
              margin: '16px 0 24px',
              textAlign: 'center',
              height: 40,
              fontSize: 12,
            })}
          >
            <span>
              点击视频，了解详细教程。关闭后也可点右上角的 <b>帮助-教程中心</b> 查看教程视频。
            </span>
            <br />
            <span>
              或者你也可以点击<b>「查看分步骤引导」</b>在页面中跟随指引熟悉工具。
            </span>
          </div>
          <div className={css({ display: 'flex', justifyContent: 'center' })}>
            <Button
              type="primary"
              className={css({ margin: '0 auto', height: 34 })}
              onClick={() => {
                setLocalVisible(false);
              }}
            >
              查看分步引导
            </Button>
          </div>
        </div>
      </Modal>
      {visible && !localVisible && <OnBoarding onClose={() => setVisible(false)} />}
    </>
  );
}
