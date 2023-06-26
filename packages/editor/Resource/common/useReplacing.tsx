import { useContext } from 'react';
import { relativeUrl } from '@shared/utils';
import { ChangerContext } from '../../common/ResourceChanger';
export default () => {
  const { onChange, acceptFiles } = useContext(ChangerContext);
  return {
    replacing: Boolean(onChange),
    acceptFiles,
    onReplace(id: string | number, name: string, url: string, cover?: string) {
      if (onChange) {
        if (id && typeof url === 'string') {
          const url_ = new URL(url);
          url_.searchParams.set('mid', String(id));
          url = url_.href;
        }
        onChange({ name, url: relativeUrl(url), cover, _from: 'resChanger' });
      }
    },
  };
};
