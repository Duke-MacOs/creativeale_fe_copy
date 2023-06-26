import useTexture2D from '../../hooks/useTexture2D';
import { ResourceBox } from '../../../../groups/resourceSpark/ResourceBox';

export default (index: string, name: string) => {
  return {
    spark: 'value',
    index,
    content(orderId: number | undefined, onChange: any) {
      const { texture2D } = useTexture2D(orderId);
      return {
        spark: 'element',
        content() {
          return (
            <ResourceBox
              type="Texture2D"
              name={name}
              url={texture2D?.props.url}
              deletable={true}
              onChange={async ({ orderId }) => {
                onChange(orderId);
              }}
            />
          );
        },
      };
    },
  };
};
