import React, { useState, useEffect, ReactNode } from 'react';
import { message, notification, Spin } from 'antd';
import _ from 'lodash';
import { useHistory, useParams } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import BreadCrumb from '@/components/BreadCrumb';
import { getDataSourceDetailById, getDataSourcePluginList, submitRequest } from '@/components/DataSource/TimeSeriesSource/services';
import './index.less';
import { IProps } from '../types';
import { urlPrefix } from '../config';

export default function FormCpt(props: { renderContent: (data: IProps) => ReactNode }) {
  const history = useHistory();
  const params = useParams<{ action: string; type: string }>();
  const { action } = params;
  const id = action === 'edit' ? params.type : undefined;

  const [type, setType] = useState(action === 'add' ? params.type : '');
  const [data, setData] = useState<any>();
  const [submitLoading, setSubmitLoading] = useState(false);

  const onFinish = async (values: any) => {
    if (type === 'prometheus') {
      let temp = values.settings['prometheus.basic'];
      if (_.isEmpty(temp) || !temp['prometheus.password'] || temp['prometheus.password'] === '' || !temp['prometheus.user'] || temp['prometheus.user'] === '') {
        values.settings['prometheus.basic'] = null;
      }
    }

    setSubmitLoading(true);
    let pluginId = data?.plugin_id;
    if (!pluginId) {
      const result = await getDataSourcePluginList({ p: 1, limit: 100, category: 'timeseries' });
      pluginId = _.get(_.find(result, { type }), 'id');
    }
    return submitRequest({
      ...values,
      plugin_id: pluginId,
      id: data?.id, // 如有则更新，否则是新建
      is_enable: data ? undefined : true, // 新建默认启用
      is_test: true, // 是否测试
    })
      .then((res) => {
        if (res.test.success) {
          message.success(action === 'add' ? '添加成功, 2s 后返回列表' : '更新成功, 2s 后返回列表');
          setTimeout(() => {
            history.push({
              pathname: `/${urlPrefix}/source/timeseries`,
            });
          }, 2000);
        } else {
          notification.error({
            message: res.test.message,
          });
        }
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  };

  useEffect(() => {
    if (action === 'edit' && id !== undefined) {
      getDataSourceDetailById(id).then((res: any) => {
        setData(res);
        setType(res.plugin_type);
      });
    }
  }, []);

  return (
    <PageLayout
      title={
        <div>
          {type}
          <BreadCrumb
            crumbs={[
              {
                text: '数据源管理',
                link: `/${urlPrefix}/source/timeseries`,
              },
              {
                text: type!,
              },
            ]}
          />
        </div>
      }
    >
      <div className='srm'>{action === 'edit' && data === undefined ? <Spin spinning={true} /> : props.renderContent({ data, type, onFinish, submitLoading })}</div>
    </PageLayout>
  );
}
