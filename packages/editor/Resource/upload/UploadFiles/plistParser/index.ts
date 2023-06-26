import GZIP from './gzip.js';
import PNGReader from './PNGReader.js';
import TIFFReader from './TIFFReader.js';
import PlistParser from './PlistParser';
import { isString } from 'lodash';

const defaultTexture =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAA6ElEQVR4nO3QwQ3AIBDAsNL9dz5WIC+EZE8QZc3Mx5n/dsBLzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCjbP8QPFyqa8aAAAAABJRU5ErkJggg==';

// 图片解压
function unzip(key: string) {
  const buffer = atob(key);
  let dec = '';
  try {
    dec = GZIP.gunzip(buffer);
  } catch (e) {
    dec = buffer.slice(7);
  }
  const bytes = 1;

  // eslint-disable-next-line prefer-const
  let ar = [],
    i,
    j,
    len;
  for (i = 0, len = dec.length / bytes; i < len; i++) {
    ar[i] = 0;
    for (j = bytes - 1; j >= 0; --j) {
      ar[i] += dec.charCodeAt(i * bytes + j) << (j * 8);
    }
  }
  return ar;
}
//获取图片格式
function getImageFormatByData(imgData: Array<number>) {
  // if it is a png file buffer.
  if (
    imgData.length > 8 &&
    imgData[0] === 0x89 &&
    imgData[1] === 0x50 &&
    imgData[2] === 0x4e &&
    imgData[3] === 0x47 &&
    imgData[4] === 0x0d &&
    imgData[5] === 0x0a &&
    imgData[6] === 0x1a &&
    imgData[7] === 0x0a
  ) {
    return 'PNG';
  }

  // if it is a tiff file buffer.
  if (
    imgData.length > 2 &&
    ((imgData[0] === 0x49 && imgData[1] === 0x49) ||
      (imgData[0] === 0x4d && imgData[1] === 0x4d) ||
      (imgData[0] === 0xff && imgData[1] === 0xd8))
  ) {
    return 'TIFF';
  }
  return 'UNKNOWN';
}

// function dataURLtoBlob(dataURL: string) {
//   const byteString = atob(dataURL.split(',')[1]);
//   const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
//   const ab = new ArrayBuffer(byteString.length);
//   const ia = new Uint8Array(ab);
//   for (let i = 0; i < byteString.length; i++) {
//     ia[i] = byteString.charCodeAt(i);
//   }
//   return new Blob([ab], { type: mimeString });
// }

function parseTextureData(data: string): Promise<string> {
  const buffer = unzip(data);
  const canvasObj = document.createElement('canvas');
  const imageFormat = getImageFormatByData(buffer);
  let dataURL = '';

  if (imageFormat === 'PNG' || imageFormat === 'TIFF') {
    if (imageFormat === 'PNG') {
      const png = new PNGReader(buffer);
      png.render(canvasObj);
    } else {
      TIFFReader.parseTIFF(buffer, canvasObj);
    }
    dataURL = canvasObj.toDataURL('image/png', 1);
  } else {
    //图片数据出错，换成默认图片资源
    dataURL = defaultTexture;
  }

  return Promise.resolve().then(() => {
    return dataURL;
  });
}

export function parsePlist(file: File | Blob): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      if (isString(reader.result)) {
        const parser = new PlistParser();
        const content = reader.result;
        const data = parser.parse(content);

        if (data['textureImageData']) {
          parseTextureData(data['textureImageData']).then(dataURL => {
            data['textureImageData'] = dataURL;
            resolve(data);
          });
        } else if (data['textureFileName']) {
          resolve(data);
        } else {
          data['textureImageData'] = defaultTexture;
          resolve(data);
        }
      }
    };
    reader.onerror = () => reject('Fail to load plist file');
  });
}
