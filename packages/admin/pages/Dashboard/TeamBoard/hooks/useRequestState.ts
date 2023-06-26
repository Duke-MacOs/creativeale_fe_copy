import { useState } from 'react';

type RequestState = {
  loading: boolean;
  error?: Error;
};

class RequestStateContainer {
  private stateMap = new Map();
  // 存放刷新组件的函数
  private changeStateMap = new Map();
  // 存放请求函数
  private requestMap = new Map();
  static instance: RequestStateContainer | null = null;

  static getInstance() {
    if (!this.instance) {
      this.instance = new RequestStateContainer();
    }
    return this.instance;
  }

  setChangeStateCallback(name: string, cb: any) {
    this.changeStateMap.set(name, cb);
  }

  setRequestFunc(name: string, fn: any, params: any) {
    this.requestMap.set(name, { fn, params });
  }

  getRequestFunc(name: string) {
    return this.requestMap.get(name);
  }

  setRequest(name: string, state?: RequestState) {
    this.stateMap.set(name, { loading: false, ...state });
    if (this.changeStateMap.has(name)) {
      this.changeStateMap.get(name)?.(this.stateMap.get(name));
    }
  }

  getRequest(name: string) {
    return this.stateMap.get(name);
  }
}

export function useRequestState(type: 'edit'): (name: string, state: RequestState) => void;
export function useRequestState(type: 'listen', requestName: string): RequestState;
export default function useRequestState(type: 'listen' | 'edit' | 'resend', requestName?: string): any {
  const instance = RequestStateContainer.getInstance();
  const [state, setState] = useState<RequestState>({ loading: false });

  if (type === 'listen' && requestName) instance.setChangeStateCallback(requestName, setState);

  const setRequestState = (name: string, state: RequestState) => {
    instance.setRequest(name, state);
  };

  const resend = (name: string) => {
    return () => {
      const request = instance.getRequestFunc(name);
      request?.fn(request.params);
    };
  };

  if (type === 'edit')
    return (names: string[], callback: (params: any) => void) => {
      const exec = async (params: any) => {
        try {
          names.forEach(async name => {
            setRequestState(name, { loading: true, error: undefined });
            instance.setRequestFunc(name, exec, params);
            setRequestState(name, { loading: false });
          });
          await callback(params);
        } catch (err) {
          names.forEach(async name => {
            setRequestState(name, { loading: false, error: err });
          });
        }
      };
      return exec;
    };
  if (type === 'listen') return state;
  if (type === 'resend') return resend(requestName as string);
}
