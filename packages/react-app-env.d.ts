/* eslint-disable */
/// <reference types="react" />

declare const REACT_APP_BUILD_TYPE: 'offline' | 'online' | 'test';
declare const PACKAGE_VERSION: string;

declare module '*.avif' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;

  const src: string;
  export default src;
}

declare module 'psd.js' {
  declare const PSD: any;
  export default PSD;
}
declare module 'simple-crop' {
  export type ICropConfig = any;
  export default class SimpleCrop {
    constructor(...args: any[]): any;
  }
}
declare module 'bezier-easing-editor' {
  import { Component, CSSProperties } from 'react';
  export type Values = [number, number, number, number];
  export default class BezierEditor extends Component<{
    defaultValue?: Values;
    down?: number;
    value?: Values;
    width?: number;
    height?: number;
    readOnly?: boolean;
    textStyle?: Record<string, unknown>;
    padding?: number[];
    style?: CSSProperties;
    background?: string;
    curveColor?: string;
    gridColor?: string;
    handleColor?: string;
    handleStroke?: number;
    curveWidth?: number;
    onChange?: (value: Values) => void;
  }> {}
}
declare namespace NodeJS {
  // type Branch<N extends string, V extends number | string> = `${N}-${V}`;
  interface ProcessEnv {
    /**
     * offline: 线下版本
     * online: 线上版本
     * test: 测试版本
     */
    readonly REACT_APP_BUILD_TYPE?: 'offline' | 'online' | 'test';
  }
}

interface Window {
  collectEvent: any;
  editorScene: any;
  getSceneByHistoryId: any;
  replaceSelectedScene: any;
  /**
   * SCM "$BUILD_REPO_ID@$BUILD_VERSION"
   */
  VERSION: string | undefined;
  previewLog: () => void;
  filterXSS: any;
  blueprint: any;
}

interface ActiveXObject {
  new (s: string): any;
}

declare var ActiveXObject: ActiveXObject;

interface Error {
  name: string;
  message: React.ReactNode;
  stack?: string;
}
interface ErrorConstructor {
  new (message?: React.ReactNode): Error;
  (message?: ReactNode): Error;
  readonly prototype: Error;
}

declare module 'panorama-to-cubemap' {
  declare const convertImage: any;
  export { convertImage };
  // export default convertImage;
}

declare module 'md5' {
  declare const hash: (message: string) => string;
  export default hash;
}
