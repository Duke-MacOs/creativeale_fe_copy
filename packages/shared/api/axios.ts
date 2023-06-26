import { replaceWithProxy } from '@shared/utils';
import Axios, { AxiosRequestConfig } from 'axios';
import { mapValues } from 'lodash';

export const aadvidHeader = { 'x-relation-adv': new URLSearchParams(location.search).get('aadvid') || '-1' };

// Full config:  https://github.com/axios/axios#request-config
export const createAxios = (
  config: AxiosRequestConfig = {
    baseURL: '/api/',
    timeout: 5 * 60 * 1000, // Timeout
    withCredentials: true, // Check cross-site Access-Control
    headers: aadvidHeader,
  }
) => Axios.create(config);

export const http = createAxios();

http.interceptors.request.use(
  config => {
    if (!config.url?.startsWith('oneService')) {
      config.params = { ...config.params, _: Date.now() };
    }
    return config;
  },
  error => {
    // 发送失败
    console.error(error);
    throw error;
  }
);

// 统一接口响应数据格式
http.interceptors.response.use(response => {
  const { data } = response;
  if (data instanceof ArrayBuffer || data instanceof Blob) {
    response.data = {
      code: 200,
      message: 'success',
      data,
    };
  }
  return response;
});

// 重定向拦截
http.interceptors.response.use(response => {
  const {
    data: { code, data },
  } = response;
  if (300 <= code && code < 400 && data.url) {
    location.href = data.url;
    throw response;
  }
  return response;
});

// 登录拦截
// 接口返回未登录 code 时，除开获取用户信息接口外都进行登录跳转
http.interceptors.response.use(async response => {
  const { data, config } = response;
  const CODE_INVALID_SESSION_ID = 2006;
  if (data.code !== CODE_INVALID_SESSION_ID || config.url === 'user/info') return response;
  if (location.hostname.indexOf('oceanengine.com') > -1) {
    location.href = `https://e.oceanengine.com/account/page/service/login?from=${encodeURIComponent(location.href)}`;
    await new Promise(resole => setTimeout(resole, 10000));
  } else {
    const {
      data: {
        data: { url },
      },
    } = await http.get(`/oauth2/auth_url?redirect=${window.location.pathname}`);
    location.href = url;
  }
  throw response;
});

// 权限拦截
http.interceptors.response.use(response => {
  const { data } = response;
  const CODE_INVALID_PERMISSION = 2008;
  if (data.code !== CODE_INVALID_PERMISSION) return response;
  // location.href = '/';
  throw response;
});

// 过滤不符合规定的接口响应格式
http.interceptors.response.use(response => {
  const { data } = response;
  if (data?.code !== 200) {
    throw response;
  }
  return response;
});

http.interceptors.response.use(
  response => {
    return { ...response, data: deepReplace(response.data) };
  },
  error => {
    throw new Error(error.data?.message || error.message);
  }
);

const deepReplace = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return replaceWithProxy(data);
  }
  if (Array.isArray(data)) {
    return data.map(deepReplace);
  }
  return mapValues(data, value => deepReplace(value));
};
