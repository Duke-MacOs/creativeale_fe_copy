import type { IValueSpark } from '../../../../cells';
import { fetchFontOptions } from '@editor/Resource/common/updateResource';
import { useEffect, useState } from 'react';
import { useProject } from '@editor/aStore';

let OPTIONS = [{ label: '默认', value: '' }];

export const fontSpark = (): IValueSpark => {
  return {
    spark: 'value',
    index: 'font',
    content(font = '', onChange) {
      const projectId = useProject('id');
      const teamId = useProject('teamId');
      const [options, setOptions] = useState(OPTIONS);
      const [loading, setLoading] = useState(() => options.every(({ value }) => value !== font));
      useEffect(() => {
        fetchFontOptions(teamId, projectId).then(data => {
          setOptions(([option]) => (OPTIONS = [option, ...data]));
          setLoading(false);
        });
      }, [projectId]);
      return {
        spark: 'element',
        content: render =>
          render({
            spark: 'select',
            label: '字体',
            tooltip: '艺术字体不支持动态修改',
            options,
            loading,
            value: font,
            onChange,
          }),
      };
    },
  };
};
