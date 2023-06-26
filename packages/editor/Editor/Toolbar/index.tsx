import { GridNine, Magnet, MindMapping, Share } from '@icon-park/react';
import { useProject, useSettings } from '@editor/aStore';
import GuidePopup from './GuidePopup';
import ToolItem from './ToolItem';
import RikoLog from './RikoLog';
import { amIHere } from '@shared/utils';
import { Button, Tooltip, Typography } from 'antd';
import Icon from '@ant-design/icons';
import { GuideTip } from '@editor/views';
import { Mask } from '@editor/icons';
import guide from './guide.png';
import { css } from 'emotion';
import { useEventBus } from '@byted/hooks';

export default function Toolbar() {
  const typeOfPlay = useSettings('typeOfPlay');
  const category = useSettings('category');
  const isVRVideo = typeOfPlay === 3 && category === 3;
  const type = useProject('type');
  const { trigger } = useEventBus('Blueprint');

  return (
    <div
      className={css({
        flex: '0 0 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 0',
      })}
    >
      {(typeOfPlay === 3 || typeOfPlay === 4) && type === 'Project' && !isVRVideo && (
        <GuideTip
          id="straight.playable.mask"
          head="建议开启直出互动元素限制区域"
          placement="leftTop"
          body={
            <div>
              <div>
                直出互动内容支持用户在信息流里直接互动，会与抖音 App
                信息流上下边缘的点击等交互产生冲突，对用户体验造成严重影响，进而影响转化效果
              </div>
              <img src={guide} style={{ width: '100%', objectFit: 'contain', display: 'block', margin: '16px 0 0' }} />
            </div>
          }
        >
          <ToolItem
            id="enableDirectMask"
            title={
              <>
                直出互动限制区域{' '}
                <Typography.Link href="https://bytedance.feishu.cn/docx/doxcnk5lo6W8ZaBGCVjYpSzdOIh" target="_blank">
                  详情 <Icon component={Share as any} />
                </Typography.Link>
              </>
            }
            Icon={Mask}
          />
        </GuideTip>
      )}
      {amIHere({ release: false }) && (
        <>
          {typeOfPlay !== 4 && !isVRVideo && <ToolItem id="enableGuides" title="物理辅助线" Icon={PhysicsCollide} />}
          {!isVRVideo && <ToolItem id="enableGrid" title="网格" Icon={GridNine} />}
          <ToolItem id="enableMagnet" title="吸附" Icon={Magnet} />
        </>
      )}
      {typeOfPlay !== 4 && !isVRVideo && (
        <>
          <GuidePopup />
          <RikoLog />
        </>
      )}
      <Tooltip title="故事板" placement="left">
        <Button
          type="text"
          icon={<Icon component={MindMapping as any} />}
          onClick={() => {
            trigger({ type: 'Project', id: 0 });
          }}
        />
      </Tooltip>
    </div>
  );
}

function PhysicsCollide() {
  return (
    <svg
      className="icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="4742"
      width="1em"
      height="1em"
    >
      <path
        d="M416 882.368l45.248 45.248-45.248 45.248-45.248-45.248 45.248-45.248z m192 0l45.248 45.248-45.248 45.248-45.248-45.248 45.248-45.248zM512 160v76.16a304 304 0 1 1 0 551.68v76.16H96v-704H512z m-59.456 70.4H155.52v563.2H452.48v-42.24A303.488 303.488 0 0 1 336 512c0-97.152 45.568-183.68 116.544-239.36V230.4zM640 272c-47.04 0-90.88 13.504-128 36.928v406.144a240 240 0 1 0 128-443.072zM400 512c0 56.704 19.648 108.8 52.544 149.888V362.112A238.976 238.976 0 0 0 400 512zM416 51.2l45.248 45.248-45.248 45.248-45.248-45.248L416 51.2z m192 0l45.248 45.248-45.248 45.248-45.248-45.248L608 51.2z"
        fill="currentColor"
      />
    </svg>
  );
}
