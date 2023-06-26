import { useState, useMemo } from 'react';
import { Button, Dropdown, message, Popover } from 'antd';
import { DownOutlined, LoadingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { UploadFrame } from '../upload/UploadFrame';
import { UploadFiles } from '../upload/UploadFiles';
import styles from '../style';

export interface Props {
  teamId?: string;
  categoryId?: string;
  onRefetch: (resetPage?: boolean) => void;
}

export default function Library({ onRefetch, teamId, categoryId = '' }: Props) {
  const [uploading, setUploading] = useState(false);
  // 上传物料
  const uploadMenu = useMemo(() => {
    const menuList = [
      { type: undefined, title: '基础资源', desc: '图片、视频、音频' },
      { type: 'Lottie' as const, title: 'Lottie', desc: '格式为json或zip' },
      { type: 'Particle' as const, title: '粒子', desc: '格式为plist或zip' },
      { type: 'DragonBones' as const, title: '龙骨动画', desc: '格式为zip' },
      { type: 'Spine' as const, title: 'Spine', desc: '格式为zip' },
      { type: 'Font' as const, title: '字体', desc: '格式为ttf' },
      { type: 'Live2d' as const, title: 'Live2D', desc: '格式为zip(json+图片)' },
      { type: 'Animation' as const, title: '互动组件', desc: '格式为json或zip' },
    ];
    return [
      ...menuList.map((menu, index) => {
        return {
          label: (
            <UploadFiles
              type={menu.type}
              teamId={teamId}
              multiple={true}
              uploading={uploading}
              categoryId={categoryId}
              setUploading={setUploading}
              onAddResourceEntry={(item, idx, successList) => {
                if (idx === successList.length - 1) {
                  onRefetch(true);
                  message.success(`成功上传${successList.length}个资源`);
                }
              }}
            >
              <div className={styles.uploadMenuItem}>
                <div className={styles.updateMenuTitle}>{menu.title}</div>
                <div className={styles.uploadMenuDesc}>{menu.desc}</div>
              </div>
            </UploadFiles>
          ),
          key: index,
        };
      }),
      {
        label: (
          <UploadFrame
            teamId={teamId}
            uploading={uploading}
            categoryId={categoryId}
            setUploading={setUploading}
            onAddResourceEntry={() => {
              onRefetch(true);
              message.success('成功上传1个资源');
            }}
          >
            <div className={styles.uploadMenuItem}>
              <div className={styles.updateMenuTitle}>序列帧</div>
              <div className={styles.uploadMenuDesc}>需上传多张图片</div>
            </div>
          </UploadFrame>
        ),
        key: 'last',
      },
    ];
  }, [uploading, onRefetch]);

  return (
    <Dropdown menu={{ items: uploadMenu }} trigger={['click']}>
      <Button className={styles.optionButton}>
        <Popover
          placement="bottom"
          content={
            <div style={{ fontSize: '12px' }}>
              <div>图片:格式为jpeg、jpg、png、WebP、Heic、GIF、TIFF、ICO、svg,不大于1M</div>
              <div>视频:格式为mp4,不大于5M</div>
              <div>音频:格式为mp3,不大于2M</div>
              <div>字体:格式为ttf，不大于20M</div>
              <div>Lottie:格式为json或zip(图片+json)，不大于2M</div>
              <div>2D粒子:格式为plist或zip（图片+plist），不大于2M</div>
              <div>Live2D:格式为zip（json+图片），不大于20M</div>
              <div>序列帧:需上传多张图片,不大于2M</div>
              <div>互动组件组件:格式为json或zip,不大于50M</div>
            </div>
          }
        >
          <QuestionCircleOutlined className={styles.optionTipsTrigger} onClick={e => e.stopPropagation()} />
        </Popover>
        上传物料 {uploading ? <LoadingOutlined /> : <DownOutlined />}
      </Button>
    </Dropdown>
  );
}
