import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { sourceLogoMap } from '@/components/DataSource/TimeSeriesSource/config';
import { getDataSourcePluginList } from '@/components/DataSource/TimeSeriesSource/services';
import SourceCards from '@/components/DataSource/components/SourceCards';
import { DataSourceType } from '@/components/DataSource/TimeSeriesSource/types';
import TableSource from '@/components/DataSource/components/TableSource';
import TimeSeriesDetail from '@/components/DataSource/TimeSeriesSource/Detail';
import Zabbix from './Detail/Zabbix';
import Oracle from './Detail/Oracle';
import Prometheus from '@/components/DataSource/TimeSeriesSource/Detail/Prometheus';
import Mysql from './Detail/Mysql';

export default function index() {
  const [pluginList, setPluginList] = useState();
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<DataSourceType>();

  useEffect(() => {
    getDataSourcePluginList({ p: 1, limit: 100, category: 'timeseries' }).then((res) => {
      setPluginList(
        _.map(res, (item) => {
          return {
            name: item.type_name,
            type: item.type,
            logo: sourceLogoMap[item.type],
          };
        }),
      );
    });
  }, []);

  const detailContent = () => {
    switch (data?.plugin_type) {
      case 'zabbix':
        return <Zabbix data={data} />;
      case 'oracle':
        return <Oracle data={data} />;
      case 'prometheus':
        return <Prometheus data={data} />;
      case 'mysql':
        return <Mysql data={data} />;
      default:
        return <div>无效的数据源类型：{data?.plugin_type}</div>;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <span className='second-color'>添加的数据源可被用于 </span>
        <Link to='/polaris' className='theme-color'>
          北极星系统
        </Link>
        {'、 '}
        <Link to='/firemap' className='theme-color'>
          灭火图
        </Link>
      </div>

      <SourceCards sourceMap={pluginList} />
      <div className='page-title'>已接入的数据源</div>
      {visible && (
        <TimeSeriesDetail
          data={data!}
          visible={visible}
          onClose={() => {
            setVisible(false);
          }}
          detailContent={detailContent()}
        />
      )}

      {pluginList && (
        <TableSource
          pluginList={pluginList}
          category='timeseries'
          nameClick={(record) => {
            setData(record);
            setVisible(true);
          }}
        />
      )}
    </div>
  );
}
