import React, { memo } from 'react';
import { isNil } from 'lodash';
import { Upload, message } from 'antd';
import { AcceptedType, accepted } from '../accepted';
import { Category, useProject, useEditor } from '@editor/aStore';
import { usePersistCallback } from '@byted/hooks';
import { fromFiles } from './fromFiles';
import { collectEvent, EventTypes } from '@editor/utils/collectEvent';
export * from './fromFiles';

export type BeforeUpload = (file: File, fileList: File[]) => Promise<boolean>;

export type UploadEntry = {
  id: number | string;
  mime: string;
  name: string;
  url: string;
  cover?: string;
  extra?: Record<string, unknown>;
};
export interface UploadFilesProps {
  className?: string;
  dragger?: boolean;
  multiple?: boolean;
  category?: Category;
  uploading: boolean;
  accepts?: string;
  children: React.ReactNode;
  beforeUpload?: (before: BeforeUpload) => BeforeUpload;
  acceptFiles?: (files: File[]) => File[];
  onAddResourceEntry(entry: UploadEntry, index: number): void;
  setUploading(uploading: boolean): void;
}
export const UploadFiles = memo(({ beforeUpload, ...props }: UploadFilesProps) => {
  const projectId = useProject('id');
  const { readOnly } = useEditor(0, 'readOnly');
  return (
    <UploadFilesBase
      {...props}
      projectId={projectId}
      beforeUpload={befUpload => {
        if (readOnly) {
          message.error('只读模式下无法上传资源');
          return () => Promise.resolve(false);
        }
        return beforeUpload?.(befUpload) || befUpload;
      }}
    />
  );
});

export const UploadFilesBase = memo(
  ({
    onAddResourceEntry,
    setUploading,
    beforeUpload,
    acceptFiles,
    uploading,
    category,
    children,
    className,
    dragger,
    accepts,
    projectId,
    multiple = true,
  }: UploadFilesProps & { projectId: number }) => {
    const Uploader = dragger ? Upload.Dragger : Upload;
    const accept = !isNil(accepts) ? accepts : category ? AcceptedType[category] : accepted;
    const befUpload = usePersistCallback(async (file, fileList) => {
      if (fileList.indexOf(file) !== fileList.length - 1) {
        return false;
      }
      const withAccepted = await fromFiles(fileList, { projectId }, category, acceptFiles);
      if (withAccepted) {
        setUploading(true);
        withAccepted()
          .then(dataList => {
            dataList.forEach(() => {
              collectEvent(EventTypes.UploadResource, {
                type: '上传成功量',
              });
            });
            return Promise.all(dataList.map(onAddResourceEntry));
          })
          .catch(e => console.error(e))
          .finally(() => {
            setUploading(false);
          });
      }
      return false;
    });
    return (
      <Uploader
        multiple={multiple}
        disabled={uploading}
        showUploadList={false}
        className={className}
        accept={accept}
        beforeUpload={async (file, fileList) => {
          if (beforeUpload) {
            return beforeUpload(befUpload)(file, fileList);
          } else {
            return befUpload(file, fileList);
          }
        }}
      >
        {children}
      </Uploader>
    );
  }
);
