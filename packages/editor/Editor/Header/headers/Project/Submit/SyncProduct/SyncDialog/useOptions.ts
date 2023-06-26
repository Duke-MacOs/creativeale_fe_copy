import { useEffect, useState } from 'react';
import { getAllAdvIds } from '@shared/api/authority';
import { uniqBy } from 'lodash';
import { http } from '@shared/api';

export default () => {
  const [options, setOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    Promise.all([
      getAllAdvIds().catch(() => {
        if (process.env.MODE === 'development') {
          setOptions(
            Array.from({ length: 24 })
              .map((_, index) => `${index + 10}`.repeat(2))
              .map((id, index) => ({ id, name: `Name${index}` }))
          );
        } else {
          return [];
        }
      }),
      http
        .get('user/authorizedAdvList')
        .then(
          ({
            data: {
              data: { list },
            },
          }) => list.map(({ advId: id, advName: name }: any) => ({ id, name }))
        )
        .catch(() => []),
    ]).then(lists => {
      const options = uniqBy(lists.flat(), 'id');
      setOptions(options);
      setLoading(false);
    });
  }, []);
  return { loading, options };
};
