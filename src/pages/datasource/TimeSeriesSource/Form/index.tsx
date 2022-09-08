import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import Kafka from '@/Packages/Settings/pages/LogSource/Form/Kafka';
import TimeSeriesSourceForm from '@/components/DataSource/TimeSeriesSource/Form/index';
import { IProps } from '@/components/DataSource/TimeSeriesSource/types';
import Oracle from './Oracle';
import Prometheus from '@/components/DataSource/TimeSeriesSource/Form/Prometheus';
import Zabbix from './Zabbix';
import MySQL from './MySQL';

export default function Index() {
  const renderContent = (props: IProps) => {
    const { type, onFinish, data, submitLoading } = props;
    switch (type) {
      case 'oracle':
        return <Oracle initialValues={data} onFinish={onFinish} submitLoading={submitLoading} />;
      case 'prometheus':
        return <Prometheus initialValues={data} onFinish={onFinish} submitLoading={submitLoading} />;
      case 'zabbix':
        return <Zabbix initialValues={data} onFinish={onFinish} submitLoading={submitLoading} />;
      case 'mysql':
        return <MySQL initialValues={data} onFinish={onFinish} submitLoading={submitLoading} />;
      case 'kafka':
        return <Kafka initialValues={data} onFinish={onFinish} submitLoading={submitLoading} />;
      default:
        return <div>无效的数据源类型：{type}</div>;
    }
  };

  return <TimeSeriesSourceForm renderContent={renderContent} />;
}
