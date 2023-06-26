import Axios from 'axios';
import { getStsToken } from '@shared/api';
import bytedUploader from '@main/hooks/useBytedUploader';
import { amIHere } from '@shared/utils';
import { message, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { getDims } from '../..';
import { collectEvent, EventTypes } from '@editor/utils/collectEvent';
import { Category } from '@editor/aStore';
import { formatBytes } from '@editor/utils';

enum size {
  video = 10 * 1024 * 1024,
  audio = 2 * 1024 * 1024,
  image = 1 * 1024 * 1024,
}
enum maxSize {
  video = 100 * 1024 * 1024,
  audio = 100 * 1024 * 1024,
  image = 30 * 1024 * 1024,
}
const typeList: any = {
  video: ['video/mp4'],
  audio: ['audio/mpeg'],
  image: ['image/jpeg', 'image/png'],
};
const timer: any = [];
// 判断文件是否需要处理
const judge = async (fileList: File[], category?: Category) => {
  const processList: File[] = [];
  const uploadList: File[] = [];
  const warningList: Array<{ name: string; reason: string }> = [];
  if (category === 'NativeLoadingVideo' || category === 'NativeVideo' || category === 'VRVideo') {
    return { uploadList: fileList, processList, warningList };
  }
  const judgeOneFile = (cat: any, file: File, maxLength: number) => {
    if (!['image', 'video', 'audio'].includes(cat)) {
      uploadList.push(file);
    } else {
      if (file.size > (size[cat] as any)) {
        if (file.size > (maxSize[cat] as any)) {
          message.error(`${cat}类型文件最大限制为${formatBytes(maxSize[cat] as any)}`);
        } else {
          processList.push(file);
          warningList.push({ name: file.name, reason: `文件超过${formatBytes(size[cat] as any)}` });
        }
      } else if (!typeList[cat].includes(file.type)) {
        processList.push(file);
        warningList.push({ name: file.name, reason: '文件格式需要转换' });
      } else if (maxLength > 2048) {
        processList.push(file);
        warningList.push({ name: file.name, reason: '图片尺寸超过了2048*2048' });
      } else {
        uploadList.push(file);
      }
    }
  };
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const cat = file.type.split('/')[0];
    if (cat === 'image') {
      const { width, height } = await getDims(file);
      const maxLength = Math.max(width, height);
      judgeOneFile(cat, file, maxLength);
    } else {
      judgeOneFile(cat, file, 0);
    }
  }
  return { uploadList, warningList, processList };
};
// 上传图片到imageX
const imageXUpload = async (img: any) => {
  const bytedUploader_ = bytedUploader();
  const data = await getStsToken();
  const fileKey = bytedUploader_.addFile({
    file: img,
    stsToken: {
      //从服务端拿到的ststoken，token为一个包含多个属性的对象，见下方说明
      CurrentTime: data.currentTime,
      ExpiredTime: data.expiredTime,
      SessionToken: data.sessionToken,
      AccessKeyId: data.accessKeyId,
      SecretAccessKey: data.secretAccessKey,
    },
    type: 'image', // 上传文件类型，三个可选值：video(视频或者音频，默认值)，image(图片)，object（普通文件）
  });
  bytedUploader_.start(fileKey);
  return new Promise<void>((resolve, reject) => {
    bytedUploader_.on('complete', (info: any) => {
      resolve(info.uploadResult.ImageUri);
    });
    bytedUploader_.on('error', (info: any) => {
      message.error(`${info?.extra?.message}`);
      reject(info);
    });
  });
};

// 压缩视频、音频
const compress = async (file: File, level: any) => {
  const startTime = new Date().getTime();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('level', level);
  file.type.startsWith('video') ? formData.append('mediaType', '3') : formData.append('mediaType', '2');
  formData.append('fileName', file.name);
  const res = await Axios.post(`/api/worker/processMedia`, formData, {
    responseType: 'arraybuffer',
  });
  if (res.headers.error) {
    //视频压缩时长埋点（超时）
    if (file.type.startsWith('video')) {
      collectEvent(EventTypes.VideoCompressDuration, {
        duration: '超时',
      });
    }
    message.error(decodeURI(res.headers.error).includes('Timeout') ? `文件压缩超时` : `文件压缩出错`);
    return { headers: { 'media-width': 0, 'media-height': 0, 'media-duration': 0, error: true } as any, data: null };
  }
  const endTime = new Date().getTime();
  const duration = Math.round((endTime - startTime) / 1000);

  if (file.type.startsWith('video')) {
    //视频压缩时长埋点
    collectEvent(EventTypes.VideoCompressDuration, {
      duration: `${duration}`,
    });
  }
  return res;
};

// 处理文件
const processFile = async (
  index: number,
  file: File,
  level: number,
  type: string,
  processQuality: any,
  setProcessQuality: any,
  completeFiles: any,
  setCompleteFiles: any,
  processPercent: any,
  setProcessPercent: any
) => {
  //记录每个文件的压缩进度
  changePercent(index, processPercent, setProcessPercent);
  // 记录每个文件的压缩质量
  const targetQualityIndex = processQuality.findIndex((item: any) => item.index === index);
  if (targetQualityIndex === -1) {
    setProcessQuality([...processQuality, { index: index, quality: level }]);
  } else {
    const newProcessQuality = processQuality;
    newProcessQuality[targetQualityIndex].quality = level;
    setProcessQuality([...newProcessQuality]);
  }
  const online = amIHere({ online: true });
  if (file.type.startsWith('image')) {
    // 使用压缩优化埋点（图片）
    collectEvent(EventTypes.CompressResource, {
      type: '图片',
    });
    let resize = '0:0';
    const { width, height } = await getDims(file);
    if (width > 2048) {
      resize = '2048:0';
    }
    if (height > 2048) {
      resize = '0:2048';
    }
    const url = await imageXUpload(file);
    const cdnDomain = online
      ? ['https://p3-magicplay', '.byteimg.com'].join('')
      : ['https://p-boe', '.byted', '.org'].join();
    const template = online ? 'tplv-q2c0dv3l96-resize' : 'tplv-lrm9e79t2k-resize';
    const newImg = await Axios.get(`${cdnDomain}/${url}~${template}:${resize}:q${level * 10}.${type}`, {
      responseType: 'arraybuffer',
    });
    const myBlob = new Blob([newImg.data], { type: `image/${type}` });
    clearTimeout(timer[index]);
    const newFile = new File([myBlob], `${file.name.split('.').slice(0, -1).join('.')}.${type}`, {
      type: `image/${type}`,
    });
    // 将压缩完成的进度置为100
    const newPercent = processPercent;
    processPercent[index] = 100;
    setProcessPercent([...newPercent]);
    // 记录每个文件的压缩结果
    const completeFilesIndex = completeFiles.findIndex((item: any) => item.index === index);
    const newCompleteFiles = completeFiles;
    if (completeFilesIndex === -1) {
      newCompleteFiles.push({ index: index, file: newFile, type: type, src: URL.createObjectURL(myBlob) });
    } else {
      newCompleteFiles[completeFilesIndex] = {
        index: index,
        file: newFile,
        type: type,
        src: URL.createObjectURL(myBlob),
      };
    }
    setCompleteFiles([...newCompleteFiles]);
  } else {
    if (file.type.startsWith('video')) {
      // 使用压缩优化埋点（视频）
      collectEvent(EventTypes.CompressResource, {
        type: '视频',
      });
    } else {
      //视频压缩时长埋点(音频)
      collectEvent(EventTypes.CompressResource, {
        type: '音频',
      });
    }
    const res = await compress(file, level);
    const myBlob = new Blob([res.data]);
    clearTimeout(timer[index]);
    const newFile = new File(
      [myBlob],
      `${file.name.split('.').slice(0, -1).join('.')}.${file.type.startsWith('video') ? 'mp4' : 'mp3'}`
    );
    const newPercent = processPercent;
    processPercent[index] = 100;
    // 将压缩完成的进度置为100
    setProcessPercent([...newPercent]);
    const completeFilesIndex = completeFiles.findIndex((item: any) => item.index === index);
    const newCompleteFiles = completeFiles;
    if (completeFilesIndex === -1) {
      newCompleteFiles.push({
        index: index,
        file: newFile,
        width: res.headers['media-width'],
        height: res.headers['media-height'],
        duration: res.headers['media-duration'],
        type: file.type.startsWith('video') ? 'mp4' : 'mp3',
        error: res.headers['error'],
        src: URL.createObjectURL(myBlob),
      });
    } else {
      newCompleteFiles[completeFilesIndex] = {
        index: index,
        file: newFile,
        width: res.headers['media-width'],
        height: res.headers['media-height'],
        duration: res.headers['media-duration'],
        type: file.type.startsWith('video') ? 'mp4' : 'mp3',
        error: res.headers['error'],
        src: URL.createObjectURL(myBlob),
      };
    }
    setCompleteFiles([...newCompleteFiles]);
  }
};
// 记录文件处理进度
const changePercent = async (index: number, processPercent: any, setProcessPercent: any) => {
  let percent = 0;
  timer[index] = setInterval(() => {
    if (percent < 40) {
      percent = percent + 10;
    } else if (percent >= 40 && percent < 70) {
      percent = percent + 5;
    } else if (percent >= 70 && percent < 90) {
      percent = percent + 2;
    } else if (percent >= 90 && percent < 98) {
      percent = percent + 1;
    } else {
      clearTimeout(timer[index]);
    }
    const newPercent = processPercent;
    processPercent[index] = percent;
    setProcessPercent([...newPercent]);
  }, 500);
};
// 关闭窗口
const onCancel = (
  completeIndex: number[],
  processList: File[],
  onFinish: (files: File[]) => void,
  confirmFiles: File[]
) => {
  const completed = completeIndex.length;
  const all = processList.length;
  if (completed < all) {
    Modal.confirm({
      title: '确认关闭',
      icon: <ExclamationCircleOutlined />,
      content: `您还有${all - completed}个文件未上传，关闭此窗口将不会上传这些文件，是否确认关闭？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        onFinish(confirmFiles);
        Modal.destroyAll();
      },
    });
  } else {
    onFinish(confirmFiles);
    Modal.destroyAll();
  }
};

// 列表区预览
const preview = (
  processList: File[],
  setPreList: React.Dispatch<
    React.SetStateAction<
      {
        index: number;
        src: string;
        type: string;
      }[]
    >
  >,
  setTypeList: React.Dispatch<
    React.SetStateAction<
      {
        index: number;
        type: string;
      }[]
    >
  >,
  setProcessList: React.Dispatch<React.SetStateAction<File[]>>
) => {
  const tempList: any[] = [];
  const tempTypes: any[] = [];
  processList.forEach((file, index) => {
    if (file.type.startsWith('image')) {
      tempTypes.push({ index: index, type: file.type === 'image/png' ? 'png' : 'jpeg' });
    }
    const reader = new FileReader();
    reader.onload = function () {
      tempList.push({ index: index, src: reader.result, type: file.type });
      setProcessList([...processList]);
    };
    reader.readAsDataURL(file);
  });
  setPreList(tempList);
  setTypeList(tempTypes);
};
export { judge, processFile, onCancel, preview };
