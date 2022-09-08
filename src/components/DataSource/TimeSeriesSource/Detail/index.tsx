import React, { ReactNode, useState } from 'react';
import { Button, Drawer } from 'antd';
import { Link } from 'react-router-dom';
import './index.less';
import Code from '@/components/Code';
import { DataSourceType } from '@/components/DataSource/TimeSeriesSource/types';
import { urlPrefix } from '@/Packages/Settings/pages/source';

interface Props {
  data: DataSourceType;
  visible: boolean;
  onClose: () => void;
  detailContent: ReactNode;
}
export default function TimeSeriesDetail(props: Props) {
  const { data, visible, onClose, detailContent } = props;

  return (
    <Drawer
      width={584}
      closeIcon={false}
      className='settings-data-source-detail-drawer'
      bodyStyle={{
        padding: '0 15px 15px',
        background: '#fff',
      }}
      title=''
      placement='right'
      onClose={onClose}
      visible={visible}
      footer={
        <Button style={{ float: 'right' }}>
          <Link to={`/${urlPrefix}/datasource/edit/${data.id}`}>编辑</Link>
        </Button>
      }
    >
      <div>
        <div className='page-title'>数据源名称</div>
        <div>{data.name}</div>
        <div className='page-title'>数据源ID</div>
        <Code>{data.id}</Code>
        {detailContent}
        {data.description && (
          <>
            <div className='page-title'>备注</div>
            <div className='flash-cat-block'>{data.description}</div>
          </>
        )}
      </div>
    </Drawer>
  );
}
