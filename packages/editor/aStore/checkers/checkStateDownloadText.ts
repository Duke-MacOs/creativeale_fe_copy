import { dataUriToFile, http } from '@shared/api';
import { throwColorful } from '@shared/utils';
import { captureNodeData } from '@byted/riko';
import { findById, intoNodes } from '@editor/utils';

export async function checkStateDownloadText(
  { scenes }: EditorState['project'],
  requireText?: string
): Promise<number> {
  const processor = getImageProcessor();
  let buttonCount = 0;
  for (const { props, nodes, type, name } of scenes) {
    const formData = new FormData();
    for (const [id, { type }] of Object.entries(props)) {
      if (type === 'Button') {
        buttonCount++;
        if (requireText) {
          const [node] = intoNodes(findById(nodes, Number(id)).slice(0, 1), props);
          const data = await processor(await captureNodeData(node));
          formData.append('files[]', await dataUriToFile(data));
        }
      }
    }
    if (requireText && Array.from(formData.keys()).length) {
      const {
        data: { data },
      } = await http.post('material/predictImages', formData);
      for (const { words } of data) {
        if (!words.some(({ text }: any) => text.includes(requireText))) {
          throwColorful(
            `为保护用户体验，请确保${type === 'Scene' ? '场景' : '组件'}“`,
            { text: name },
            `”里下载按钮的“下载”字样足够明确`
          );
        }
      }
    }
  }
  return buttonCount;
}

const getImageProcessor = () => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = 100;
  canvas.width = 100;
  return (url: string) => {
    return new Promise<string>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        const { width, height } = image;
        canvas.width = width;
        canvas.height = height;
        context?.clearRect(0, 0, width, height);
        context?.drawImage(image, 0, 0, width, height, 0, 0, width, height);
        const imageData = context?.getImageData(0, 0, width, height);
        if (imageData) {
          const data = imageData.data ?? [];
          for (const indices of block(width, height, 3)) {
            const rbg = [0, 0, 0];
            for (const index of indices) {
              for (let i = 0; i < rbg.length; i++) {
                let value = data[index + i];
                value -= value % 32;
                rbg[i] += value;
              }
            }
            const value = Math.floor(rbg.reduce((a, b) => a + b) / 3 / indices.length);
            for (let i = 0; i < rbg.length; i++) {
              for (const index of indices) {
                data[index + i] = value;
              }
            }
          }
          context?.putImageData(imageData, 0, 0);
        }
        resolve(canvas.toDataURL('image/png'));
      };
      image.onerror = () => {
        reject(new Error(`图片加载失败，无法检验其透明度：${url}`));
      };
      image.src = url;
    });
  };
};

function* block(width: number, height: number, size: number) {
  for (const cols of slice(width, size)) {
    for (const rows of slice(height, size)) {
      const data = [];
      for (const c of cols) {
        for (const r of rows) {
          data.push((c + width * r) * 4);
        }
      }
      yield data;
    }
  }
}

function* slice(total: number, size: number) {
  for (let r = 0; r < total; r += size) {
    yield Array.from(range(r, Math.min(r + size, total)));
  }
}

function* range(start: number, end: number) {
  while (start < end) {
    yield start++;
  }
}
