import type { Log } from '@editor/Editor/Toolbar/RikoLog';
import { useCallback, useEffect, MutableRefObject } from 'react';
import { Category } from '../resource';
import { debounce } from 'lodash';

type Listener<T> = MutableRefObject<T> | ((payload: T) => void);

const listeners = {} as Record<string, Array<(...args: any[]) => void>>;

export function useEmitter(eventName: 'UseReflines', listener?: Listener<number[]>): (reflines: number[]) => void;
export function useEmitter(eventName: 'AddScripts', listener?: Listener<boolean>): (isScript: boolean) => void;
export function useEmitter(eventName: 'CleanIndexedDB', listener?: Listener<number>): (projOrSceneId: number) => void;
export function useEmitter(eventName: 'UpdateRikoLog', listener?: Listener<Log>): (log: Log) => void;
export function useEmitter(
  eventName: 'ResourceDeleted' | 'ResourceAdded' | 'ResourceRenamed',
  listener?: Listener<number | string>
): (resourceId: number | string) => void;
export function useEmitter<
  T extends {
    type: 'enter' | 'leave';
    category: Category;
    url: string | number;
    name: string;
    description?: string;
    extra?: Record<string, any>;
  }
>(
  eventName: 'ViewResource',
  listener?: Listener<ReturnType<typeof debounce>> | Listener<T>
): (props: T | { type: 'leave' }) => void;
export function useEmitter<
  T extends {
    loadComponent: () => Promise<void>;
    skip?: boolean;
  }
>(eventName: 'LoadComponent', listener?: Listener<T>): (options: T) => void;
export function useEmitter(eventName: string, listener?: any): any {
  useEffect(() => {
    if (listener) {
      const handler = typeof listener !== 'function' ? (payload: any) => (listener.current = payload) : listener;
      if (listeners[eventName]) {
        listeners[eventName].push(handler);
      } else {
        listeners[eventName] = [handler];
      }
      return () => {
        listeners[eventName].splice(listeners[eventName].indexOf(handler), 1);
      };
    }
  }, [eventName, listener]);
  return useCallback(
    (payload: any) => {
      listeners[eventName]?.slice().forEach(listener => listener(payload));
    },
    [eventName]
  );
}
