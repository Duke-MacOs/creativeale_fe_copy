import React, { memo } from 'react';
import { message, Upload } from 'antd';
import { AcceptedType } from '../accepted';
import { uploadFile } from '@shared/api';
import useTexture2D from '@editor/Editor/Property/spark/layouts/3D/Materials/hooks/useTexture2D';

export interface UploadTexture2DProps {
  className?: string;
  uploading: boolean;
  children: React.ReactNode;
  setUploading(uploading: boolean): void;
}

export const UploadTexture2D = memo(({ setUploading, children, uploading, className }: UploadTexture2DProps) => {
  const { addTexture2D } = useTexture2D();
  return (
    <Upload
      disabled={uploading}
      showUploadList={false}
      className={className}
      accept={AcceptedType['Texture2D']}
      beforeUpload={async file => {
        setUploading(true);

        try {
          const res = await uploadFile(file);
          await addTexture2D(undefined, { url: res.downloadUrl, name: file.name });
        } catch (error) {
          message.error(error.message);
        }
        setUploading(false);

        return false;
      }}
    >
      {children}
    </Upload>
  );
});
