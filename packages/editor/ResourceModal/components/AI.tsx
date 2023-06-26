import { DoubleRightOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { http } from '@shared/api';
import { createAIImageByImage, createAIImageByText } from '@shared/api/store';
import { Button, Checkbox, Form, message, Select, Tabs, Space, Upload, Image } from 'antd';
import { RcFile } from 'antd/es/upload';
import { useState } from 'react';
import { useSelectedList } from '../Context';
import { IAIData } from '../type';
import { css } from 'emotion';
import { fileToBinary } from '@editor/Resource/upload/UploadFiles/spineVersionValidator';

const CheckboxGroup = Checkbox.Group;

const keywordMap = {
  Sun: '太阳',
  Earth: '地球',
  Moon: '月球',
  Sky: '天空',
  Tree: '树',
  River: '河流',
  Mountain: '山脉',
  Ocean: '海洋',
  Beach: '海滩',
  Forest: '森林',
  Flower: '花',
  Grass: '草',
  Rock: '岩石',
  Lake: '湖泊',
  Rain: '雨',
  Snow: '雪',
  Cloud: '云',
  Storm: '暴风雨',
  Thunder: '雷声',
  Lightning: '闪电',
  Volcano: '火山',
  Waterfall: '瀑布',
  Stream: '小溪',
  Valley: '山谷',
  Desert: '沙漠',
  Iceberg: '冰山',
  Aurora: '极光',
  Rainbow: '彩虹',
  Fog: '雾',
  Sunlight: '阳光',
  Raindrop: '雨滴',
  Dew: '露珠',
  Hail: '冰雹',
  Snowflake: '雪花',
  Mist: '薄雾',
  Breeze: '微风',
  Wind: '风',
  Hurricane: '飓风',
  Typhoon: '台风',
  Tornado: '龙卷风',
  Earthquake: '地震',
  Tsunami: '海啸',
  Flood: '洪水',
  Wildfire: '野火',
  Blizzard: '暴风雪',
  Landslide: '山崩',
  'Tree trunk': '树干',
  'Tree bark': '树皮',
  'Tree leaves': '树叶',
  'Tree branch': '树枝',
  'Tree root': '树根',
  'Flower petal': '花瓣',
  'Flower stem': '花茎',
  'Flower bud': '花蕾',
  'Grass blade': '草刺',
  'Grass seed': '草种',
  'Mountain peak': '山峰',
  'Mountain range': '山脉',
  'Mountain trail': '山径',
  'Ocean wave': '海浪',
  'Ocean current': '海流',
  'Ocean tide': '潮汐',
  'Ocean depth': '海洋深度',
  'Beach sand': '沙滩',
  'Beach shell': '海贝壳',
  'Beach rock': '海岸岩石',
  'Forest canopy': '森林冠层',
  'Forest floor': '森林地面',
  'Forest animals': '森林动物',
};

const keywordMap2 = {
  'game art': '游戏艺术',
  'oil painting': '油画',
  'fantasy vivid colors': '色彩动人',
  photorealistic: '照片',
};

const TextToImage = () => {
  const { selectedAIList, updateSelectedAIList, getSelectedAIList } = useSelectedList();
  const [list, setList] = useState<IAIData[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onCreate = () => {
    form.validateFields().then(async values => {
      try {
        setLoading(true);
        const { keywords1 = [], keywords2 = [], keywords3 = [] } = values;
        const {
          data: { data },
        } = await createAIImageByText([...keywords1, ...keywords2, ...keywords3].join(','));
        if (data?.image?.data) {
          const file = new File([new Blob([new Uint8Array(data.image.data).buffer])], '未命名AI');
          const url = URL.createObjectURL(file);
          setList([
            {
              file,
              url,
            },
          ]);
        } else {
          throw new Error('图像生成失败，请重新尝试');
        }
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    });
  };

  const onAdd = (b: IAIData) => {
    if (getSelectedAIList().some(i => i.url === b.url)) {
      message.warning('不能重复添加');
      return;
    }
    updateSelectedAIList([...selectedAIList, b]);
  };

  return (
    <>
      <Form form={form} labelCol={{ span: 3 }} wrapperCol={{ span: 12 }}>
        <Form.Item name="keywords1" label="风格">
          <CheckboxGroup options={Object.entries(keywordMap2).map(([value, label]) => ({ label, value }))} />
        </Form.Item>
        <Form.Item name="keywords2" label="预设关键词">
          <Select
            mode="multiple"
            placeholder="预设关键词"
            allowClear
            options={Object.entries(keywordMap).map(([value, label]) => ({ label, value }))}
          />
        </Form.Item>
        <Form.Item name="keywords3" label="自定义关键词">
          <Select mode="tags" placeholder="自定义关键词（英文）" allowClear />
        </Form.Item>
        <Form.Item
          colon={false}
          label={
            <Button type="primary" loading={loading} onClick={onCreate}>
              {list.length === 0 ? '生成图片' : '换一张'}
            </Button>
          }
        />
      </Form>
      <Space>
        {list.map(i => (
          <Space align="end">
            <Image
              src={i.url}
              style={{ cursor: 'pointer', width: '240px', height: '240px', objectFit: 'cover' }}
              alt=""
            />
            <Button
              size="small"
              onClick={() => {
                onAdd(i);
              }}
            >
              添加
            </Button>
          </Space>
        ))}
      </Space>
    </>
  );
};

const ImageToImage = () => {
  const { selectedAIList, updateSelectedAIList } = useSelectedList();
  const [image, setImage] = useState<IAIData>();
  const [AIImage, setAIImage] = useState<IAIData>();
  const [keywords, setKeywords] = useState<string>();
  const [loading, setLoading] = useState(false);

  const onBeforeUpload = async (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只接受 jpg/jpeg/png 格式图片');
      return;
    }
    console.log('file:', file);
    setImage({ file, url: URL.createObjectURL(file) });

    return false;
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>点击上传图片</div>
    </div>
  );

  const onCreate = async () => {
    if (!image) {
      message.warning('缺少原始图片');
      return;
    }
    try {
      setLoading(true);
      const {
        data: { data },
      } = await createAIImageByImage(image.file, keywords ?? '');
      if (data?.image?.data) {
        const file = new File([new Blob([new Uint8Array(data.image.data).buffer])], '未命名AI');
        setAIImage({
          file,
          url: URL.createObjectURL(file),
        });
      } else {
        throw new Error('图像生成失败，请重新尝试');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onAdd = () => {
    AIImage && updateSelectedAIList([...selectedAIList, AIImage]);
  };

  const onChange = (values: string) => {
    setKeywords(values);
  };

  return (
    <Space>
      <div
        className={css({
          width: '300px',
          height: '350px',
          '.ant-upload.ant-upload-select': {
            width: '300px !important',
            height: '350px !important',
          },
        })}
      >
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={onBeforeUpload}
        >
          {image ? (
            <img src={image.url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            uploadButton
          )}
        </Upload>
        <Select
          style={{ width: '300px' }}
          value={keywords}
          mode="tags"
          placeholder="自定义关键词（英文）"
          allowClear
          onChange={onChange}
        />
      </div>
      <Button type="primary" loading={loading} onClick={onCreate}>
        点击转化
      </Button>
      {AIImage && (
        <>
          <Image
            src={AIImage.url}
            style={{
              visibility: AIImage ? 'visible' : 'hidden',
              width: '300px',
              height: '350px',
              objectFit: 'cover',
              cursor: 'pointer',
            }}
          />
          <Button type="primary" loading={loading} onClick={onAdd}>
            添加
          </Button>
        </>
      )}
    </Space>
  );
};

export default () => {
  const onChange = (key: string) => {
    console.log(key);
  };
  return (
    <div
      className={css({
        position: 'relative',
        height: '100%',
        width: '100%',
        overflowY: 'scroll',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      })}
    >
      <Tabs
        style={{ padding: '0 20px' }}
        defaultActiveKey="1"
        onChange={onChange}
        items={[
          {
            label: `关键词生成`,
            key: '1',
            children: <TextToImage />,
          },
          {
            label: `图片转化`,
            key: '2',
            children: <ImageToImage />,
          },
        ]}
      />
    </div>
  );
};
