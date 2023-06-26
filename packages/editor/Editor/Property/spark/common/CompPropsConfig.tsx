import { ICompProp } from '@editor/aStore';
import { downloadBlob, RikoHook } from '@editor/utils';
import { Button, message, Upload } from 'antd';
import { css } from 'emotion';

export function PropsConfig<
  T extends
    | {
        [s: string]: RikoHook;
      }
    | ICompProp[]
>({ value, onChange }: { value: T; onChange: (value: T) => void }) {
  return (
    <div
      className={css({
        display: 'flex',
        justifyContent: 'center',
        margin: '0 16px',
      })}
    >
      <Button
        block
        className={css({
          marginRight: 16,
        })}
        onClick={() => {
          downloadBlob(new Blob([JSON.stringify(value)]), 'config.json');
        }}
      >
        导出配置
      </Button>
      <Upload
        className={css({
          '.ant-upload': {
            width: '100%',
          },
          width: '100%',
        })}
        accept=".json"
        showUploadList={false}
        beforeUpload={file => {
          file.text().then(json => {
            try {
              const newCustomProps = JSON.parse(json);
              onChange(newCustomProps);
            } catch (e) {
              console.error(e);
              message.error('文件格式错误');
            }
          });
          return false;
        }}
      >
        <Button
          className={css({
            width: '100%',
          })}
        >
          导入配置
        </Button>
      </Upload>
    </div>
  );
}
