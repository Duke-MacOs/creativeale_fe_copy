import { FC } from 'react';
import { Image } from 'antd';
import { css } from 'emotion';
import { IPlayers } from '@/types';
import { IMaterial } from '@/types/library';
import defaultImage from '@shared/assets/images/default_image.png';
import defaultPsd from '@shared/assets/images/default_psd.svg';
import { Categories, PlayerType } from '@shared/config';
import IFramePreview from './IFramePreview';
import VideoPreview from './VideoPreview';
import AudioPreview from './AudioPreview';
import EditorCasePreview from './EditorCasePreview';
import { fetchPlayerList } from '@shared/api';
import { useQuery } from 'react-query';

interface MaterialPreviewProps {
  detail: IMaterial;
}

const style = {
  container: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }),
};

const previewCreator = (material: IMaterial, players: IPlayers) => {
  const { name, previewUrl: url, type } = material;
  switch (type.cid) {
    case Categories.case:
    case Categories.otherCase:
    case Categories.creative:
      return <IFramePreview name={name} url={url} />;
    case Categories.image:
      return (
        <Image
          src={url}
          alt="previewImage"
          style={{ width: '375px', height: '667px', objectFit: 'contain', cursor: 'zoom-in' }}
        />
      );
    case Categories.video:
      return <VideoPreview url={url} />;
    case Categories.audio:
      return <AudioPreview url={url} />;
    case Categories.lottie:
    case Categories.particles2D:
    case Categories.component:
    case Categories.frameAni:
    case Categories.editor:
    case Categories.scene:
    case Categories.live2d:
    case Categories.dragonBones:
    case Categories.spine:
      return <EditorCasePreview material={material} playerList={players[PlayerType.Editor]} />;
    case Categories.photoshop:
      return <img src={defaultPsd} alt={name} style={{ width: '375px', height: '200px', objectFit: 'contain' }} />;
    default:
      return <img src={defaultImage} alt={name} style={{ width: '375px' }} />;
  }
};

const MaterialPreview: FC<MaterialPreviewProps> = ({ detail }) => {
  const { data: players = {} } = useQuery({
    queryKey: [],
    cacheTime: Infinity,
    queryFn: async () => {
      const playerTypeList: any[] = Object.keys(PlayerType).filter(item => !isNaN(Number(item)));
      const players = await Promise.all(playerTypeList.map(item => fetchPlayerList(Number(item))));
      return players.reduce((players, playerList, index) => {
        players[playerTypeList[index]] = playerList;
        return players;
      }, {} as IPlayers);
    },
  });
  return <section className={style.container}>{previewCreator(detail, players)}</section>;
};

export default MaterialPreview;
