import React, { useEffect, useRef, useState } from 'react';
import { Button, Drawer, Table } from 'antd';
import dayjs from 'dayjs';
import { useNewGraph } from './useGraph';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { downloadBlob } from '@editor/utils';

export default ({
  setEventTracking,
  trackedEvents,
  setTrackedEvents,
}: {
  setEventTracking: React.Dispatch<React.SetStateAction<boolean>>;
  trackedEvents: any[];
  setTrackedEvents: React.Dispatch<React.SetStateAction<any[]>>;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentId, addNode, clear, amplify, minify } = useNewGraph(containerRef);
  const indexRef = useRef(0);
  const [showNum, setShowNum] = useState<any>({});
  useEffect(() => {
    const sections = trackedEvents.filter(
      ({ eventName, params }: any) =>
        eventName === 'enterSection' && params.current_section !== 'loading' && params.section !== 'loading'
    );
    if (sections.length < indexRef.current) {
      indexRef.current = 0;
      setShowNum({});
      clear();
    }
    for (let i = sections.length - indexRef.current - 1; i >= 0; i--) {
      const { section, current_section } = sections[i].params;
      const newShowNum = showNum;
      if (newShowNum[section]) {
        newShowNum[section] += 1;
      } else {
        newShowNum[section] = 1;
      }
      setShowNum(newShowNum);
      addNode(
        current_section,
        section,
        newShowNum[section],
        (
          (sections.filter(
            (item: any) => item.params.current_section === current_section && item.params.section === section
          ).length /
            (newShowNum[current_section] || 1)) *
          100
        ).toFixed(0)
      );
    }
    indexRef.current = sections.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackedEvents]);

  const onClose = () => {
    setEventTracking(false);
  };
  //日志列表项
  const logColumns: any[] = [
    {
      title: '事件名称',
      dataIndex: 'eventName',
      key: 'eventName',
      width: '20%',
      render: (eventName: string) => {
        return <div>{eventName}</div>;
      },
    },
    {
      title: '间隔时长(s)',
      dataIndex: 'duration',
      key: 'duration',
      width: '20%',
      render: (duration: number) => {
        return <div>{dayjs(duration).format('ss.SSS')}s</div>;
      },
    },
    {
      title: '当前环节',
      dataIndex: 'params',
      key: 'current_section',
      width: '20%',
      render: (params: any) => {
        return <div>{params?.current_section ?? '-'}</div>;
      },
    },
    {
      title: '目标环节',
      dataIndex: 'params',
      key: 'section_remark',
      width: '20%',
      render: (params: any) => {
        return (
          <div style={{ whiteSpace: 'normal', wordBreak: 'break-all', wordWrap: 'break-word' }}>
            {params?.section ?? '-'}
            {params?.section_remark}
          </div>
        );
      },
    },
    {
      title: '位置',
      dataIndex: 'params',
      key: 'area_remark',
      width: '20%',
      render: (params: any) => {
        return (
          <div style={{ whiteSpace: 'normal', wordBreak: 'break-all', wordWrap: 'break-word' }}>
            {params?.area ?? '-'}
            {params?.area_remark}
          </div>
        );
      },
    },
  ];
  const filterData = () => {
    if (currentId === '') {
      return trackedEvents;
    } else {
      if (currentId.startsWith('edge')) {
        const source = currentId.split('_')[1];
        const target = currentId.split('_')[2];
        return trackedEvents.filter(item => item.params?.current_section === source && item.params?.section === target);
      } else {
        return trackedEvents.filter(item => item.params?.current_section === currentId);
      }
    }
  };
  return (
    <Drawer
      title="埋点日志"
      placement="right"
      open={true}
      width={700}
      mask={false}
      onClose={onClose}
      rootStyle={{ userSelect: 'none' }}
      headerStyle={{ border: 'none' }}
    >
      <div style={{ border: '1px solid #dbdcdd' }}>
        <div
          style={{
            height: '50px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #dbdcdd',
            padding: '0 5px',
            boxSizing: 'border-box',
          }}
        >
          <h4>漏斗图</h4>
          <div>
            <Button icon={<ZoomInOutlined />} onClick={() => amplify()} />
            <Button icon={<ZoomOutOutlined />} style={{ margin: '0 5px' }} onClick={() => minify()} />
            <Button
              onClick={() => {
                setTrackedEvents([]);
              }}
            >
              删除历史记录
            </Button>
          </div>
        </div>
        <div ref={containerRef} style={{ width: '640px', height: '180px', overflow: 'hidden' }} />
      </div>
      <div style={{ border: '1px solid #dbdcdd', marginTop: '20px' }}>
        <div
          style={{
            height: '50px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #dbdcdd',
            padding: '0 5px',
            boxSizing: 'border-box',
          }}
        >
          <h4>埋点详情</h4>
          <Button
            onClick={() => {
              downloadBlob(new Blob([JSON.stringify(trackedEvents)]), 'eventTracking.json');
            }}
          >
            导出
          </Button>
        </div>

        <Table rowKey="id" columns={logColumns} scroll={{ y: 500 }} dataSource={filterData()} pagination={false} />
      </div>
    </Drawer>
  );
};
