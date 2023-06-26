import { useImbot, Category } from '@editor/aStore';
import { useVisible } from '@editor/hooks';
import { Alert, Typography } from 'antd';
import withTabs from '../../../common/withTabs';
import withGroup from '../../../common/withGroup';
import Effect from './Effect';
import { css } from 'emotion';

const GroupEffect = withGroup(Effect);

export const InfoBox = ({ title }: { title: string }) => {
  const { showImDialog } = useImbot();
  const [visible, setVisible] = useVisible(title);
  if (!visible) {
    return null;
  }
  return (
    <div
      className={css({
        '& .ant-alert-info': {
          margin: '16px 12px 0',
          border: 'none',
          padding: 8,
        },
      })}
    >
      <Alert
        type="info"
        closable
        onClose={() => setVisible(false)}
        message={
          <>
            什么是
            <Typography.Link
              underline
              onClick={event => {
                event.preventDefault();
                showImDialog(title);
              }}
            >
              {title}
            </Typography.Link>
            ？
          </>
        }
      />
    </div>
  );
};

function Groups(props: any) {
  return (
    <div>
      <InfoBox title="Lottie、粒子、序列帧" />
      <GroupEffect {...props} />
    </div>
  );
}

export const EffectTypes: { value: Category; label: string }[] = [
  { value: 'Particle', label: '2D粒子' },
  { value: 'Lottie', label: 'Lottie' },
  { value: 'DragonBones', label: '龙骨动画' },
  { value: 'Spine', label: 'Spine' },
  { value: 'Live2d', label: 'Live2d' },
  { value: 'FrameAnime', label: '序列帧' },
];

export default (props: Parameters<ReturnType<typeof withTabs>>[0]) => {
  const Tabs = withTabs('Effect', Groups);

  return <Tabs {...(props as any)} />;
};
