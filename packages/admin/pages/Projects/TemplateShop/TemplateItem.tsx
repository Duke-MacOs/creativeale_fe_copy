import { useState } from 'react';
import { Card, message, Button, Space, Tag } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { previewTemplate, useTemplate } from '@shared/api/template';
import defaultImage from '@shared/assets/images/default_image.png';
import { categoryMap } from '../ProjectList/columns/nameAndId';
import { IProjectFromServer } from '../ProjectList/api';
import { collectEventTableAction } from '@main/collectEvent';
import { Previewer } from '@editor/Editor/Header';
import { gotoEditor } from '@shared/utils';
import style from './style';

export interface TemplateItemProps {
  data: IProjectFromServer;
  index: number;
}

export default function ({ data }: TemplateItemProps) {
  const [previewUrl, setPreviewUrl] = useState({ url: '', typeOfPlay: 0 });
  const { name, cover, teamName, category } = data;

  const Cover = (
    <div className={style.materialCover}>
      <div className={style.cover}>
        <img src={cover || defaultImage} className={style.coverImage} alt={name} />
      </div>
      <div className={style.mask}>
        <Space direction="vertical">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={async () => {
              const collect = collectEventTableAction('模板换肤');
              const { id } = data;
              try {
                const res = await useTemplate(id, 1);
                collect('okay');
                gotoEditor({ id: res.id, mode: 'product' });
              } catch (err) {
                collect('error');
                message.error(`${err.message}`);
              }
            }}
          >
            模板换肤
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={async () => {
              const collect = collectEventTableAction('自由编辑');
              const { id } = data;
              try {
                const res = await useTemplate(id, 0);
                collect('okay');
                gotoEditor({ id: res.id, mode: 'project' });
              } catch (err) {
                collect('error');
                message.error(`${err.message}`);
              }
            }}
          >
            自由编辑
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={async () => {
              const collect = collectEventTableAction('查看详情');
              const { id } = data;
              try {
                const { previewUrl } = await previewTemplate(id);
                const url = new URL(previewUrl);
                url.searchParams.set('recorder', 'true');
                collect('okay');
                setPreviewUrl({ url: url.href, typeOfPlay: data.typeOfPlay! });
              } catch (err) {
                collect('error');
                message.error('无法生成预览链接');
              }
            }}
          >
            查看详情
          </Button>
        </Space>
      </div>
    </div>
  );

  return (
    <>
      <Card hoverable className={style.item} cover={Cover}>
        <div className={style.title}>
          <span className={style.name}>
            <Tag color="success" children={categoryMap[category]} />
            {name}
          </span>
          <div className={style.countAndIsFree}>
            <span className={style.count}>{teamName || '0'}</span>
          </div>
        </div>
      </Card>
      {previewUrl.url.length > 0 && (
        <Previewer
          httpUrl={previewUrl.url}
          typeOfPlay={previewUrl.typeOfPlay as any}
          originSize={[667, 375]}
          onClose={() => setPreviewUrl({ url: '', typeOfPlay: 0 })}
        />
      )}
    </>
  );
}
