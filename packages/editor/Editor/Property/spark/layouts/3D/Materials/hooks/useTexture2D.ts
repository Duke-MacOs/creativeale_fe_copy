import { createScene, updateScene } from '@shared/api/project';
import { addTexture2D, ITexture2D, updateTexture2D } from '@editor/aStore';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import Axios from 'axios';
import { absoluteUrl } from '@shared/utils';
import { getTopState } from '@editor/utils';
import { getRikoAssetProps } from '@editor/Resource/entries/3d/utils';
import { createAsset } from '@byted/riko';

export default (orderId?: number) => {
  const { getState, dispatch } = useStore();

  const { texture2D, projectId } = useSelector(
    ({ project }: EditorState) => ({
      projectId: project.id,
      texture2D: getTopState(project).texture2Ds.find(i => i.orderId === orderId),
    }),
    shallowEqual
  );

  const createTexture2D = async (props: any): Promise<ITexture2D> => {
    const { id, orderId } = await createScene({
      projectId: getState().project.id,
      name: 'texture2D',
      sceneContent: JSON.stringify({ props: { ...props }, type: 'Texture2D' }),
    });

    return {
      id,
      orderId,
      name: 'texture2D',
      type: 'Texture2D',
      props,
    };
  };

  // 创建新的 Texture 场景化数据
  const createLocalTexture2D = async (props: Record<string, any>): Promise<ITexture2D> => {
    const rikoAsset = await getRikoAssetProps(await createAsset(props.name ?? 'Texture2D', 'Texture2D', props.url));
    const data = rikoAsset.files[rikoAsset.entry];
    data.props.type = 'Texture2D';
    return await createTexture2D(data.props);
  };

  // 将材质中的 TextureUrl 转为场景化数据
  const createOriginTexture2D = async (url: string): Promise<ITexture2D> => {
    const { data } = await Axios.get(absoluteUrl(url));
    data.props.type = 'Texture2D';
    return await createTexture2D(data.props);
  };

  /**
   *
   * @param url 资源外链
   * @param props texture2d 属性
   * @param byRiko 是否通过 Riko.createAsset 接口创建 props
   * @returns
   */
  const add = async (url: string | undefined, props: Record<string, any> = {}, byRiko = true) => {
    const texture2D = url
      ? await createOriginTexture2D(url)
      : byRiko
      ? await createLocalTexture2D(props)
      : await createTexture2D(props);
    dispatch(addTexture2D(texture2D));
    return texture2D;
  };

  const update = async (orderId: number, props: Record<string, any>) => {
    const texture2D = get(orderId);
    if (texture2D) {
      await updateScene({
        sceneContent: JSON.stringify({ type: 'Texture2D', props: { ...texture2D.props, ...props } }),
        name: texture2D.name || 'Texture2D',
        id: texture2D.id,
        projectId,
      });
      dispatch(updateTexture2D(orderId, props));
    }
  };

  const get = (orderId: number) => getTopState(getState().project).texture2Ds.find(i => i.orderId === orderId);

  return {
    texture2D,
    createTexture2D,
    addTexture2D: add,
    getTexture2D: get,
    updateTexture2D: update,
  };
};
