import React, { FC, useEffect, useMemo } from 'react';
import { message } from 'antd';
import { IPlayer } from '@/types';
import { IMaterial } from '@/types/library';
import { Category2PlayType } from '@shared/config';
import IFramePreview from './IFramePreview';

interface Props {
  material: IMaterial;
  playerList: IPlayer[];
}

const EditorCasePreview: FC<Props> = ({
  material: { previewUrl, name, playerId, type },
  playerList = [
    {
      id: 55,
      name: '0.0.55',
      url: 'https://magicplay.oceanengine.com/static-cloud/invoke/riko_player',
    },
  ],
}) => {
  const player = useMemo(() => playerList?.find(({ id }) => id === playerId) ?? playerList[0], [playerList, playerId]);
  const iframeUrl = useMemo(() => {
    if (previewUrl.endsWith('html')) {
      return previewUrl;
    } else {
      return `${player.url}?url=${previewUrl}&type=${Category2PlayType[type.cid]}`;
    }
  }, [previewUrl, player, type]);
  useEffect(() => {
    if (!player) {
      message.error('播放器加载失败！');
    }
  }, [player]);

  return player && <IFramePreview url={iframeUrl} name={name} />;
};

export default EditorCasePreview;
