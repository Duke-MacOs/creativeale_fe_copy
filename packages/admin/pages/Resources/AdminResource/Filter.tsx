import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Input, Select, DatePicker, Button, Checkbox, Divider } from 'antd';
import styles from './style';
import { CaretDownOutlined, ClearOutlined, CloseCircleFilled } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import getTreeData from './Modal/convertData';
import moment from 'moment';
import style from './styles';
const { Option } = Select;
const status = [
  { id: '4', name: '待审核' },
  { id: '1', name: '审核通过' },
  { id: '6', name: '审核不通过' },
];

export interface FilterProps {
  keyword: string;
  updateAfter: string;
  updateBefore: string;
  statuses: string;
  onPlatform?: boolean;
  types: string;
  tagIds: [];
  tagNames: [];
  onChange(partial: Record<string, unknown>): void;
  setTagIds: React.Dispatch<React.SetStateAction<[]>>;
  setTagNames: React.Dispatch<React.SetStateAction<[]>>;
  changeTags: boolean;
  setChangeTags: React.Dispatch<React.SetStateAction<boolean>>;
  dropDownId: number;
  setDropDownId: React.Dispatch<React.SetStateAction<number>>;
  onSearch: (resetPage?: boolean) => void;
  catTags: [];
  categories:
    | {
        cid: number;
        name: string;
      }[]
    | undefined;
  tagList: [];
}

export default function Filter({
  keyword,
  updateAfter,
  updateBefore,
  statuses,
  onPlatform,
  onChange,
  onSearch,
  tagIds,
  setTagIds,
  tagNames,
  setTagNames,
  changeTags,
  setChangeTags,
  dropDownId,
  setDropDownId,
  catTags,
  categories,
  tagList,
  types,
}: FilterProps) {
  const [form] = Form.useForm();
  const [cur, setCur] = useState('1');
  const [showClear, setShowClear] = useState(false);
  const [currentCatTagName, setCurrentCatTagName] = useState([]);
  const [curGroup, setCurGroup] = useState('玩法组件');

  useEffect(() => {
    const cats = (catTags as any).filter((item: any) => (tagIds as any)?.includes(item.id)).map((tag: any) => tag.id);
    const platforms = tagIds?.filter((item: any) => !(cats as any).includes(item));
    const names = tagList
      .filter((item: any) => (platforms as any).includes(item.id))
      .map((tag: any) => tag.name) as any;
    setTagNames(names);
    onChange({ tagIds: tagIds.length === 0 ? '' : tagIds });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catTags, form, setTagNames, tagIds, tagList, types]);

  return (
    <div className={styles.filterWrapper}>
      <div className={styles.headerWrapper}>
        <Form form={form} colon={false} labelAlign="right">
          <Row gutter={[50, 16]}>
            <Col span={10}>
              <Form.Item name="keyword" initialValue={keyword} label={<span className={styles.filterLabel}>搜索</span>}>
                <Input.Search
                  allowClear
                  placeholder="请输入资源名称、ID"
                  value={keyword}
                  onSearch={e => {
                    onChange({ keyword: e });
                    onSearch(true);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="updateTime"
                initialValue={[updateAfter, updateBefore].filter(Boolean).map(date => moment(date, 'X')) as any}
                label={<span className={styles.filterLabel}>更新时间</span>}
              >
                <DatePicker.RangePicker
                  allowClear
                  style={{ width: '100%' }}
                  onChange={(_, [startDate, endDate]) => {
                    startDate !== '' && endDate !== ''
                      ? onChange({
                          updateAfter: (Date.parse(startDate) - 3600 * 1000 * 8) / 1000,
                          updateBefore: (Date.parse(endDate) + 3600 * 1000 * 15.99) / 1000,
                        })
                      : onChange({ updateAfter: '', updateBefore: '' });
                    onSearch(true);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="status"
                initialValue={statuses === '' ? [] : statuses.split(',')}
                label={<span className={styles.filterLabel}>审核状态</span>}
              >
                <Select
                  mode="multiple"
                  allowClear
                  maxTagCount={2}
                  placeholder="请选择审核状态"
                  showArrow={true}
                  onChange={(e: any) => {
                    if (e.includes('4') || e.includes('6')) {
                      form.setFieldsValue({ onPlatform: '' });
                      onChange({ statuses: e.join(','), onPlatform: '' });
                    } else if (e.length === 0) {
                      onChange({ statuses: ['1', '4', '6'].join(',') });
                    } else {
                      onChange({ statuses: e.join(',') });
                    }
                    onSearch(true);
                  }}
                >
                  {status.map(item => {
                    return (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="onPlatform"
                initialValue={onPlatform}
                label={<span className={styles.filterLabel}>发布状态</span>}
              >
                <Select
                  allowClear
                  placeholder="请选择发布转态"
                  showArrow={true}
                  onChange={e => {
                    if (e === 'true') {
                      form.setFieldsValue({ status: ['1'] });
                      onChange({ statuses: 1, onPlatform: e });
                    } else if (e === 'false') {
                      form.setFieldsValue({ status: [] });
                      onChange({ statuses: '', onPlatform: e });
                    } else {
                      onChange({ onPlatform: '' });
                    }
                    onSearch(true);
                  }}
                >
                  <Option value="false">待上架</Option>
                  <Option value="true">已上架</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label={<span className={styles.filterLabel}>平台标签</span>} style={{ position: 'relative' }}>
                <TextArea
                  placeholder="请选择平台标签"
                  value={tagNames}
                  readOnly
                  className={style.textarea}
                  onClick={e => {
                    e.stopPropagation();
                    setChangeTags(!changeTags);
                    if (cur !== '1') {
                      setCur('1');
                    }
                    setDropDownId(-1);
                  }}
                  onMouseEnter={() => setShowClear(true)}
                  onMouseLeave={() => setShowClear(false)}
                />
                {showClear && tagNames.length !== 0 && (
                  <CloseCircleFilled
                    style={{ position: 'absolute', right: '10px', top: '10px', opacity: '0.4' }}
                    onClick={() => {
                      const allCats = catTags.map((cat: any) => cat.id);
                      const cats = tagIds.filter(i => allCats.includes(i)) as any;
                      setTagIds(cats);
                      setTagNames([]);
                      onChange({ tagIds: cats?.join(',') });
                    }}
                    onMouseEnter={() => setShowClear(true)}
                  />
                )}
                {changeTags && (
                  <div className={style.changeTags} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {getTreeData(tagList).map(item => (
                        <Button
                          value={item.id}
                          key={item.id}
                          onClick={() => {
                            setCur(item.value);
                          }}
                          style={{ margin: '10px', border: 'none', background: 'none' }}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                    <Divider type="vertical" style={{ height: '300px' }} />
                    <div className={style.tagList}>
                      {tagList
                        .filter((item: any) => item.category == cur)
                        .map((i: any) => (
                          <Checkbox
                            key={i.id}
                            checked={!tagIds.length ? false : (tagIds as any).includes(i.id)}
                            style={{ width: '110px', margin: '10px 5px' }}
                            onChange={e => {
                              if (e.target.checked) {
                                setTagIds([...tagIds, i.id] as any);
                                onChange({ tagIds: [...tagIds, i.id].join(',') });
                                onSearch(true);
                                setTagNames([...tagNames, i.name] as any);
                              } else {
                                setTagIds(tagIds?.filter(item => item !== i.id) as any);
                                onChange({
                                  tagIds: tagIds?.filter(item => item !== i.id).join(','),
                                });
                                setTagNames(tagNames.filter(item => item !== i.name) as any);
                              }
                            }}
                          >
                            {i.name}
                          </Checkbox>
                        ))}
                    </div>
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
      <Button
        type="link"
        icon={<ClearOutlined />}
        className={style.clear}
        onClick={() => {
          form.setFieldsValue({ keyword: '' });
          form.setFieldsValue({ updateTime: [] });
          form.setFieldsValue({ status: ['1', '4', '6'] });
          form.setFieldsValue({ onPlatform: '' });
          setTagIds([]);
          setTagNames([]);
          setCurrentCatTagName([]);
          onChange({
            keyword: '',
            updateAfter: '',
            updateBefore: '',
            statuses: '1,4,6',
            onPlatform: undefined,
            tagIds: '',
            types: '',
          });
        }}
      >
        重置筛选
      </Button>
      <section className={styles.section}>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: types === '' ? '#6380ff' : '#f2f4f7' }} className={style.categories}>
            <Button
              type="text"
              style={{ background: 'none', border: 'none', color: types === '' ? 'white' : 'black' }}
              onClick={() => {
                const allCats = catTags.map((cat: any) => cat.id);
                onChange({
                  allType: true,
                  types: '',
                  page: 1,
                  tagIds: tagIds.filter(i => !allCats.includes(i)) as any,
                });
                setTagIds(tagIds.filter(i => !allCats.includes(i)) as any);
                onSearch(true);
                setCurrentCatTagName([]);
              }}
            >
              全部
            </Button>
          </div>
          {categories?.map(item => {
            return (
              <div
                key={item.cid}
                style={{ backgroundColor: Number(types) === item.cid ? '#6380ff' : '#f2f4f7' }}
                className={style.categories}
              >
                <Button
                  type="text"
                  style={{ background: 'none', border: 'none', color: Number(types) === item.cid ? 'white' : 'black' }}
                  onClick={e => {
                    e.stopPropagation();
                    onChange({ allType: false, types: item.cid, page: 1 });
                    if (dropDownId !== item.cid) {
                      setDropDownId(-1);
                      const allCats = catTags.map((cat: any) => cat.id);
                      setTagIds(tagIds.filter(i => !allCats.includes(i)) as any);
                      onChange({ tagIds: tagIds.filter(i => !allCats.includes(i)) as any });
                      onSearch(true);
                      setCurrentCatTagName([]);
                    }
                  }}
                >
                  {item.name}
                </Button>
                {catTags.filter((cat: any) => cat.path.startsWith(item.name)).length !== 0 &&
                  Number(types) === item.cid && (
                    <CaretDownOutlined
                      style={{ cursor: 'pointer' }}
                      onClick={e => {
                        e.stopPropagation();
                        if (Number(types) === item.cid) {
                          setDropDownId(item.cid);
                        }
                        if (dropDownId === item.cid) {
                          setDropDownId(-1);
                        }
                      }}
                    />
                  )}
                {dropDownId === item.cid && item.name !== '互动组件' && (
                  <div className={style.catTags} onClick={e => e.stopPropagation()}>
                    {catTags
                      .filter((cat: any) => cat.parentName.startsWith(item.name))
                      .map((i: any) => {
                        return (
                          <Checkbox
                            key={i.id}
                            checked={!tagIds.length ? false : (tagIds as any).includes(i.id)}
                            style={{ width: '110px', margin: '10px 5px' }}
                            onChange={e => {
                              if (e.target.checked) {
                                setTagIds([...tagIds, i.id] as any);
                                onChange({ tagIds: [...tagIds, i.id].join(',') });
                                onSearch(true);
                                setCurrentCatTagName([...currentCatTagName, i.name] as any);
                              } else {
                                setTagIds(tagIds?.filter(item => item !== i.id) as any);
                                onChange({
                                  tagIds: tagIds?.filter(item => item !== i.id).join(','),
                                });
                                setCurrentCatTagName(currentCatTagName.filter(item => item !== i.name) as any);
                              }
                            }}
                          >
                            {i.name}
                          </Checkbox>
                        );
                      })}
                  </div>
                )}
                {dropDownId === item.cid && item.name === '互动组件' && (
                  <div className={style.catTags} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'start', width: '100%', margin: '10px 3px' }}>
                      <Button
                        type={curGroup === '玩法组件' ? 'link' : 'text'}
                        style={{ marginRight: '20px' }}
                        onClick={() => setCurGroup('玩法组件')}
                      >
                        玩法组件
                      </Button>
                      <Button type={curGroup === '附加组件' ? 'link' : 'text'} onClick={() => setCurGroup('附加组件')}>
                        附加组件
                      </Button>
                      <Button type={curGroup === '视频组件' ? 'link' : 'text'} onClick={() => setCurGroup('视频组件')}>
                        视频组件
                      </Button>
                    </div>
                    <Divider dashed style={{ margin: '0' }} />
                    {curGroup === '玩法组件' &&
                      catTags
                        .filter((cat: any) => cat.parentName.startsWith('玩法组件'))
                        .map((i: any) => {
                          return (
                            <Checkbox
                              key={i.id}
                              checked={!tagIds.length ? false : (tagIds as any).includes(i.id)}
                              style={{ width: '110px', margin: '10px 5px' }}
                              onChange={e => {
                                if (e.target.checked) {
                                  setTagIds([...tagIds, i.id] as any);
                                  onChange({ tagIds: [...tagIds, i.id].join(',') });
                                  onSearch(true);
                                  setCurrentCatTagName([...currentCatTagName, i.name] as any);
                                } else {
                                  setTagIds(tagIds?.filter(item => item !== i.id) as any);
                                  onChange({
                                    tagIds: tagIds?.filter(item => item !== i.id).join(','),
                                  });
                                  setCurrentCatTagName(currentCatTagName.filter(item => item !== i.name) as any);
                                }
                              }}
                            >
                              {i.name}
                            </Checkbox>
                          );
                        })}
                    {curGroup === '附加组件' &&
                      catTags
                        .filter((cat: any) => cat.parentName.startsWith('附加组件'))
                        .map((i: any) => {
                          return (
                            <Checkbox
                              key={i.id}
                              checked={!tagIds.length ? false : (tagIds as any).includes(i.id)}
                              style={{ width: '110px', margin: '10px 5px' }}
                              onChange={e => {
                                if (e.target.checked) {
                                  setTagIds([...tagIds, i.id] as any);
                                  onChange({ tagIds: [...tagIds, i.id].join(',') });
                                  onSearch(true);
                                  setCurrentCatTagName([...currentCatTagName, i.name] as any);
                                } else {
                                  setTagIds(tagIds?.filter(item => item !== i.id) as any);
                                  onChange({
                                    tagIds: tagIds?.filter(item => item !== i.id).join(','),
                                  });
                                  setCurrentCatTagName(currentCatTagName.filter(item => item !== i.name) as any);
                                }
                              }}
                            >
                              {i.name}
                            </Checkbox>
                          );
                        })}
                    {curGroup === '视频组件' &&
                      catTags
                        .filter((cat: any) => cat.name === '视频组件')
                        .map((i: any) => {
                          return (
                            <Checkbox
                              key={i.id}
                              checked={!tagIds.length ? false : (tagIds as any).includes(i.id)}
                              style={{ width: '110px', margin: '10px 5px' }}
                              onChange={e => {
                                if (e.target.checked) {
                                  setTagIds([...tagIds, i.id] as any);
                                  onChange({ tagIds: [...tagIds, i.id].join(',') });
                                  onSearch(true);
                                  setCurrentCatTagName([...currentCatTagName, i.name] as any);
                                } else {
                                  setTagIds(tagIds?.filter(item => item !== i.id) as any);
                                  onChange({
                                    tagIds: tagIds?.filter(item => item !== i.id).join(','),
                                  });
                                  setCurrentCatTagName(currentCatTagName.filter(item => item !== i.name) as any);
                                }
                              }}
                            >
                              {i.name}
                            </Checkbox>
                          );
                        })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {currentCatTagName.length !== 0 && (
          <div style={{ color: '#d58b0b', marginLeft: '10px' }}>当前筛选类别：{currentCatTagName.join(',')}</div>
        )}
      </section>
    </div>
  );
}
