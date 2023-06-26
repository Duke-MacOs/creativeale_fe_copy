import { isArray, isString } from 'lodash';

export default async (state: EditorState['project']) => {
  let {
    settings: { enableProps },
  } = state;
  if (isArray(enableProps)) {
    enableProps = enableProps?.map((prop: any) => {
      if (isString(prop)) {
        return { key: prop, default: (state.settings as any)[prop] };
      }
      return prop;
    });
    if (enableProps.find(({ key }) => key === 'bgMusic') && !enableProps.find(({ key }) => key === 'bgMusicVoice')) {
      enableProps.push({ key: 'bgMusicVoice', default: state.settings['bgMusicVoice'] });
    }
    state.settings.enableProps = enableProps;
  }
  return state;
};
