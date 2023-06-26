import axios from 'axios';
import saveAs from 'file-saver';
import JSZip from 'jszip';
import { useStore } from 'react-redux';
import { Category, Provider } from '../../aStore';

export const useBatchDownload = () => {
  const { getState } = useStore<EditorState, EditorAction>();

  return async (category: Exclude<Category, '' | 'shape'>, provider: Provider) => {
    const data = getState().resource.database[category][provider];
    const images = data[0].list;
    const zip = new JSZip();
    const folder = zip.folder('images');
    await Promise.all(
      images.map(async (image: any) => {
        const { data } = await axios.get((image.previewUrl || image.url) as string, { responseType: 'blob' });
        folder?.file(`${image.name}.${image.extra?.ext}`, data);
      })
    );
    zip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, 'images.zip');
    });
  };
};

export default useBatchDownload;
