import generatorFace, { IOrientations } from './convert';
import { Format } from './index';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const mimeType = {
  jpg: 'image/jpeg',
  png: 'image/png',
};

function getDataURL(imgData: ImageData, extension: 'jpg' | 'png'): Promise<Blob> {
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  ctx?.putImageData(imgData, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        blob ? resolve(blob) : reject(new Error('canvas toBlob error'));
      },
      mimeType[extension],
      0.92
    );
  });
}

//顺序：pz, nz, px, nx, py, ny
export const facePositions: {
  [key in keyof IOrientations]: { x: number; y: number };
} = {
  px: { x: 2, y: 1 },
  nx: { x: 0, y: 1 },
  py: { x: 1, y: 0 },
  ny: { x: 1, y: 2 },
  pz: { x: 1, y: 1 },
  nz: { x: 3, y: 1 },
};

function loadImage(file: File): Promise<File[]> {
  return new Promise(async (resolve, reject) => {
    try {
      if (!file) {
        reject('非法文件');
      }
      const originFileName = file.name.replaceAll(/[.png|.jpg|.jpeg]/g, '');
      const img = new Image();

      img.setAttribute('crossOrigin', '');
      img.src = URL.createObjectURL(file);

      img.addEventListener('load', async () => {
        const { width, height } = img;
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, width, height);

        const dataList = await processImage(data);
        const dataBlobListPromise = [];
        for (const data of dataList) {
          dataBlobListPromise.push(getDataURL(data, Format));
        }
        const dataBlobList = await Promise.all(dataBlobListPromise);
        resolve(
          dataBlobList.map((blob, idx) => {
            return new File([blob], `${originFileName}-${Object.keys(facePositions)[idx]}.${Format}`);
          })
        );
      });
    } catch (error) {
      throw error;
    }
  });
}

function processImage(data: ImageData): Promise<ImageData[]> {
  const faceList = [];

  for (const [faceName] of Object.entries(facePositions)) {
    faceList.push(renderFace(data, faceName as keyof IOrientations));
  }
  return Promise.all(faceList);
}

const settings = {
  cubeRotation: 360,
  interpolation: 'lanczos',
  format: 'jpg',
};

function renderFace(data: ImageData, faceName: keyof IOrientations): Promise<ImageData> {
  return new Promise(async (resolve, reject) => {
    try {
      const options = {
        data: data,
        face: faceName,
        rotation: (Math.PI * settings.cubeRotation) / 180,
        interpolation: settings.interpolation,
      };

      const imageData = await generatorFace(
        Object.assign({}, options, {
          interpolation: 'linear',
        })
      );
      resolve(imageData);
    } catch (e) {
      reject(e);
    }
  });
}

const convertPanorama = async (sourceFile: File): Promise<File[]> => {
  const dataFiles = await loadImage(sourceFile);
  return [...dataFiles, sourceFile];
};

const convertPanoramaList = (files: File[]): Promise<File[][]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const cubeList = [];
      for (const file of files) {
        const cube = await convertPanorama(file);
        cubeList.push(cube);
      }
      resolve(cubeList);
    } catch (error) {
      reject(error);
    }
  });
};

export default convertPanoramaList;
