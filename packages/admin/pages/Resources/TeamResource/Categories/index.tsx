import { useContext } from 'react';
import { Button } from 'antd';
import Icon from '@ant-design/icons';
import { FolderPlus } from '@icon-park/react';
import { UserMaterialContext } from '../context';
import { ICategoryItem } from './useCategory';
import Item from './Item';
import styles from '../style';

interface Props {
  active: string | null;
  editable: boolean;
  onChange(category: ICategoryItem['id']): void;
}

export * from './useCategory';

export default function Categories({ active, editable, onChange }: Props) {
  const {
    category: { list, addCategory },
  } = useContext(UserMaterialContext);

  return (
    <div className={styles.sidebar}>
      {editable && (
        <div className={styles.sidebarHeader}>
          <Button
            type="link"
            icon={<Icon component={FolderPlus as any} style={{ fontSize: '16px' }} />}
            onClick={addCategory}
          >
            新增分类
          </Button>
        </div>
      )}
      <div className={styles.sidebarList}>
        {(list || []).map(item => {
          return (
            <Item key={item.id} editable={editable} category={item} isActive={active === item.id} onSelect={onChange} />
          );
        })}
      </div>
    </div>
  );
}
