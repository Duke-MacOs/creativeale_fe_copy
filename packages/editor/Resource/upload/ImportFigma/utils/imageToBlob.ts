const canvas = document.createElement('CANVAS') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

export default function imageToBlob(src: string): Promise<Blob> {
  return imageToCanvas(src).then(() => {
    const needsCheckAlpha = canvas.width > 500 && canvas.height > 500;
    let hasAlphaBackground = false;

    if (needsCheckAlpha) {
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
      if (imageData) {
        for (let index = 3; index < imageData.length; index += 4) {
          if (imageData[index] != 255) {
            hasAlphaBackground = true;
            break;
          }
        }
      }
    }
    return new Promise(resolve => {
      canvas.toBlob(
        file => {
          resolve(file as Blob);
        },
        needsCheckAlpha && !hasAlphaBackground ? 'image/jpeg' : 'image/png'
      );
    });
  });
}

function imageToCanvas(src: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = '';
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(img, 0, 0);
      resolve(null);
    };
    img.onerror = function () {
      reject(new Error('图片' + src + '加载出错'));
    };
    img.src = src;
  });
}
