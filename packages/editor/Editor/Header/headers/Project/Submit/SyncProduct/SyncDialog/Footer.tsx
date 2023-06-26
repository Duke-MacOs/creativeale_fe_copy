import React, { useState } from 'react';
import { Button } from 'antd';

interface FooterProps {
  cancelText: string;
  okText: string;
  okDisabled: boolean;
  cancelDisabled: boolean;
  footer?: React.ReactNode;
  onCancel: (setLoading: React.Dispatch<React.SetStateAction<boolean>>) => void;
  onOk: (setLoading: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

export default function AsyncProductDialog({
  cancelDisabled,
  okDisabled,
  cancelText,
  okText,
  footer,
  onCancel,
  onOk,
}: FooterProps) {
  const [loading, setLoading] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ flex: 'auto', textAlign: 'left' }}>{footer}</div>
      <Button
        disabled={loading || cancelDisabled}
        onClick={event => {
          event.stopPropagation();
          onCancel(setLoading);
        }}
      >
        {cancelText}
      </Button>
      <Button
        type="primary"
        loading={loading}
        disabled={loading || okDisabled}
        onClick={event => {
          event.stopPropagation();
          onOk(setLoading);
        }}
      >
        {okText}
      </Button>
    </div>
  );
}
