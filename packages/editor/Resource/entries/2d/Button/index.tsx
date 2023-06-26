import { GroupContainer } from '../../../common/withGroup';
import { ImageItem } from '../Image/ImageItem';
import { InfoBox } from '../Effect';
import { amIHere } from '@shared/utils';
import basic from './basic.svg';
import image from './image.svg';
import right from './right.svg';
import left from './left.svg';
import { css } from 'emotion';

const basics = [
  {
    cover: basic,
    name: '基础按钮',
    props: {
      width: 700,
      height: 84,
      leftBottomRounded: 10,
      rightBottomRounded: 10,
      rightTopRounded: 10,
      leftTopRounded: 10,
      buttonType: 'download',
      url: '',
    },
  },
  {
    cover: right,
    name: '右常驻按钮',
    props: {
      buttonType: 'download',
      width: 300,
      height: 84,
      leftBottomRounded: 42,
      leftTopRounded: 42,
      url: '',
    },
  },
  {
    cover: left,
    name: '左常驻按钮',
    props: {
      buttonType: 'download',
      width: 300,
      height: 84,
      rightBottomRounded: 42,
      rightTopRounded: 42,
      url: '',
    },
  },
];
const images = [
  {
    cover: image,
    name: '图片按钮',
    props: {
      width: 700,
      height: 84,
      buttonType: 'download',
      text: '',
      url: amIHere({ online: false })
        ? 'material/private/de3736930ee9417e9e9afa9d5bcb2472.png'
        : 'material/private/a8434bac3cd34cfd937ae9489d814308.png',
    } as any,
  },
];

export default function Button() {
  return (
    <>
      <InfoBox title="转化按钮" />
      <GroupContainer
        groups={[
          {
            name: '图形样式',
            status: 'loaded',
            expandable: true,
            list: basics,
            total: basics.length,
          },
          {
            name: '图片样式',
            status: 'loaded',
            expandable: true,
            list: images,
            total: images.length,
          },
        ]}
      >
        {({ list }) => (
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridAutoRows: 'auto',
              rowGap: '8px',
            })}
          >
            {list.map((item, index) => (
              <ImageItem
                key={index}
                cover={item.cover}
                category={'Button' as any}
                url={item.props.url}
                props={item.props}
                name={item.name}
              />
            ))}
          </div>
        )}
      </GroupContainer>
    </>
  );
}
