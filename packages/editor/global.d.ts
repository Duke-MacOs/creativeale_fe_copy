import type * as RikoTypes from '@byted/riko';
import editorStore from './aStore';
import { ThunkDispatch } from 'redux-thunk';
import { Store } from 'redux';

declare global {
  type PartialOmit<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
  type PartialPick<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;
  type Unpack<T> = T extends Array<infer I> ? Unpack<I> : T extends Promise<infer P> ? Unpack<P> : T;

  type EditorDispatch = ThunkDispatch<EditorState, Record<string, never>, EditorAction>;
  type EditorAction = Parameters<(typeof editorStore)['dispatch']>[0];
  type EditorState = ReturnType<(typeof editorStore)['getState']>;
  type EditorStore = Store<EditorState, EditorAction>;

  type AnyFn = (...args: any) => any;
  type MemberOf<T> = Pick<
    T,
    {
      [K in keyof T]: T[K] extends AnyFn ? never : K;
    }[keyof T]
  >;
  type MethodOf<T> = Pick<
    T,
    {
      [K in keyof T]: T[K] extends AnyFn ? K : never;
    }[keyof T]
  >;
  type FirstParam<T> = T extends (...arg: infer P) => any ? P[0] : never;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface RikoScript extends RikoTypes.IScriptData {
    props: RikoTypes.IScriptData['props'] & {
      /**
       * ChangeScene
       */
      sceneId?: number;
      destroyLastScene?: boolean;
      relation?: 0 | 1 | 2;
      transition?: 'none' | 'alpha' | 'move';
      /**
       *  ChangeState
       */
      targetId?: number;
      value?: number | string;
      /**
       * CloneComponent
       */
      url?: any;
      x?: number;
      y?: number;
      parent?: 'scene' | 'parent';
      /**
       * Conditions
       */
      conditions?: Array<{
        from: any;
        to: any;
        compare: any;
      }>;
      /**
       * CopyText
       */
      text?: string;
      /**
       *  Destroy
       */
      targetType?: string;
      /**
       * EmitEvent
       */
      event?: string;
      /**
       * FollowMouse
       */
      followMode?: string;
      /**
       * GotoAndPlay
       */
      startTime?: number;
      /**
       * GotoAndStop
       */
      stopTime?: number;
      /**
       * ModifyData
       */
      expression?: {
        from: any;
        to: any;
        mode: string;
      };
      /**
       * PhysicsBehavior
       */
      behaviorType?: any;
      /**
       * Settings
       */
      settingType?: 0 | 1 | 2 | 3;
    };
  }
  type RikoNode = RikoTypes.INodeData;
}
