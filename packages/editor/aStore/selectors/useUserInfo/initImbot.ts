import WenwenBot from '@ad/imbot-sdk';
import Axios from 'axios';
import { amIHere } from '@shared/utils';
import { collectEvent, EventTypes } from '@editor/utils';

export declare enum EnumEnv {
  BOE = 'boe',
  PPE = 'ppe',
}
interface IBotConfig {
  env?: EnumEnv;
  platToken: string;
  signatureUrl: string;
  signatureHeaders?: Record<string, unknown>;
  entry: {
    show: boolean;
    theme: 'white' | 'blue';
    bottom: number | string;
  };
  user?: { id: string; name: string };
  moveable: boolean;
  startQuestion: string;
}

async function getInitConfig(): Promise<IBotConfig> {
  let cloudUrl = 'https://magicplay.oceanengine.com/static-cloud/invoke/bot_service';
  if (!amIHere({ online: true })) {
    cloudUrl += '_boe';
  }
  const { data } = await Axios.get(cloudUrl);
  return data;
}

let imMounted = false;
let isLoading = false;

export function showImDialog(message?: string) {
  if (!imMounted) {
    console.warn('Imbot not bo init', message);
    return;
  }
  WenwenBot.show(message);
}

export default () => {
  if (imMounted || isLoading) {
    return;
  }
  isLoading = true;
  getInitConfig().then(config => {
    WenwenBot.init({
      env: config.env,
      platToken: config.platToken,
      getSignatureUrl: config.signatureUrl,
      getSignatureHeaders: config.signatureHeaders,
      version: 'v4',
      entryOptions: {
        theme: config.entry.theme,
        bottom: config.entry.bottom,
      },
      user: config.user,
      showEntry: config.entry.show,
      moveable: config.moveable,
      startQuestion: config.startQuestion,
      onShow: () => {
        collectEvent(EventTypes.SmartRobot, null);
      },
    });
    isLoading = false;
    imMounted = true;
  });
};
