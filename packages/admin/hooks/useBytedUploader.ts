import { amIHere } from '@shared/utils';
import BytedUploader from '@byted/uploader';

export default () => {
  const online = amIHere({ online: true });
  const bytedUploader = new BytedUploader({
    // 建议设置能识别用户的唯一标识id，用于上传出错时排查问题，不要传入非 ASCII编码
    userId: online ? '1000000292' : '1900000130',
    // 在应用云平台申请的appid，视频云中的质量监控等都是以这个参数来区分业务方的，务必正确填写
    appId: 5158,
    region: online ? 'cn' : 'boe',
    // BOE 环境必填，见下方说明
    imageHost: online ? '' : ['https://staging', '-openapi-boe', '.byted', '.org'].join(),

    // 仅图片上传时需要配置
    imageConfig: {
      serviceId: online ? 'q2c0dv3l96' : 'lrm9e79t2k', // 在视频云中申请的服务id
    },
  });
  return bytedUploader;
};
