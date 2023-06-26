import React, { memo } from 'react';
import { Upload } from 'antd';
import { fromFiles, AcceptedType, acceptedBasisMaterial } from '@editor/Resource/upload';
import { Category } from '@editor/aStore';
import { collectEvent, EventTypes } from '@editor/utils/collectEvent';

interface IResourceEntry {
  id: number;
  mime: string;
  name: string;
  url: string;
}
export interface UploadFilesProps {
  className?: string;
  multiple?: boolean;
  categoryId: string;
  type?: Category;
  accepts?: string;
  uploading: boolean;
  teamId?: string;
  $scope?: string;
  children: React.ReactNode;
  acceptFiles?: (files: File[]) => File[];
  onAddResourceEntry(entry: IResourceEntry, index: number, list: IResourceEntry[]): void;
  setUploading(uploading: boolean): void;
  beforeUpload?: (file: File, fileList: File[]) => Promise<boolean>;
}
export const UploadFiles = memo(
  ({
    onAddResourceEntry,
    setUploading,
    acceptFiles,
    uploading,
    categoryId,
    type,
    children,
    className,
    teamId,
    $scope,
    multiple = true,
  }: UploadFilesProps) => {
    const accept = type ? AcceptedType[type] : acceptedBasisMaterial;
    return (
      <Upload
        multiple={multiple}
        disabled={uploading}
        showUploadList={false}
        className={className}
        accept={accept}
        beforeUpload={async (file, fileList) => {
          if (fileList.indexOf(file) !== fileList.length - 1) {
            return false;
          }
          const withAccepted = await fromFiles(fileList, { categoryId, teamId, $scope }, type, acceptFiles);
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
        }}
      >
        {children}
      </Upload>
    );
  }
);
