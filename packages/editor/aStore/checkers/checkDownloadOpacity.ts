import { absoluteUrl, toColorful } from '@shared/utils';
import { findById } from '@editor/utils';

export function* checkDownloadOpacity({ scenes }: EditorState['project']) {
  const pixelAlphaCounter = getPixelAlphaCounter();
  for (const scene of scenes) {
    for (const [key, prop] of Object.entries(scene.props)) {
      if (prop.type === 'Script' && (prop.enabled ?? true) && hasDownloadEvent(prop.scripts)) {
        const [{ id, type }] = findById(scene.nodes, Number(key), true);
        if (type === 'Sprite' && typeof scene.props[id].url === 'string') {
          yield pixelAlphaCounter(absoluteUrl(scene.props[id].url as string))
            .then(ratio => {
              if (ratio > 0.3) {
                return toColorful(
                  `您在“`,
                  { text: scene.name },
                  '”中为“',
                  { text: scene.props[id].name! },
                  `”设置了下载APP事件。检测到该下载按钮实际点击区域与可视区域不一致，存在审核风险`
                );
              }
            })
            .catch(() => {
              return toColorful(
                `您在“`,
                { text: scene.name },
                '”中为“',
                { text: scene.props[id].name! },
                `”设置了下载APP事件，但无法检测按钮背景图的透明区域是否合规`
              );
            });
        }
      }
      if (prop.type === 'Button' && typeof prop.url === 'string' && prop.url) {
        yield pixelAlphaCounter(absoluteUrl(prop.url)).then(ratio => {
          if (ratio > 0.3) {
            return toColorful('为保护用户体验，转化按钮', { text: prop.name! }, '的背景图片透明区域不能多于30%');
          }
        });
      }
    }
  }
}

const getPixelAlphaCounter = () => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = 100;
  canvas.width = 100;
  return (url: string) => {
    return new Promise<number>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        const { width, height } = image;
        context?.clearRect(0, 0, 100, 100);
        context?.drawImage(image, 0, 0, width, height, 0, 0, 100, 100);
        const data = context?.getImageData(0, 0, 100, 100).data ?? [];
        let alphaCount = 0;
        for (let alphaChannel = 3; alphaChannel < data.length; alphaChannel += 4) {
          if (data[alphaChannel] < 0xf) {
            alphaCount++;
          }
        }
        resolve(data.length !== 0 ? (alphaCount * 4) / data.length : 0);
      };
      image.onerror = () => {
        reject(new Error(`图片加载失败，无法检验其透明度：${url}`));
      };
      image.src = url;
    });
  };
};

export const hasDownloadEvent = (scripts: RikoScript[] = [], script_ = 'DownloadApp'): boolean =>
  scripts.reduce(
    (has, { props: { script, scripts, enabled = true, elseScripts } }) =>
      has ||
      (enabled && (script === script_ || hasDownloadEvent(scripts, script_) || hasDownloadEvent(elseScripts, script_))),
    false as boolean
  );
