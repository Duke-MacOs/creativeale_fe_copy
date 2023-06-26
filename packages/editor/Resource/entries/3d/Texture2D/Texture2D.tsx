import { WithGroupComponentProps } from '../../../common/withGroup';
import { IMaterial } from '@/types/library';
import { ImageItem } from '../../2d/Image/ImageItem';
import { css } from 'emotion';
import { shallowEqual, useSelector } from 'react-redux';
const styles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: 'auto',
    rowGap: '8px',
  }),
};
export default function Texture2Ds({ category, provider }: WithGroupComponentProps<IMaterial & { orderId: number }>) {
  const components = useSelector(({ project }: EditorState) => {
    const components = [] as typeof project.texture2Ds;
    while (project) {
      for (const texture2D of project.texture2Ds) {
        if (!components.some(({ orderId }) => orderId === texture2D.orderId)) {
          components.push(texture2D);
        }
      }
      project = project.editor.prevState!;
    }
    return components;
  }, shallowEqual);

  return (
    <div className={styles.container}>
      {components.map(entry => (
        <ImageItem
          key={entry.id}
          materialId={entry.id}
          category={category}
          provider={provider}
          name={(entry.props?.name as string) ?? entry.name}
          url={entry.orderId}
          cover={entry.props.url}
          orderId={entry.orderId}
        />
      ))}
    </div>
  );
}
