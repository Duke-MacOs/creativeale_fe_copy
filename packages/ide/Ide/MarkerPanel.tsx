import React, { useContext, useEffect, useState } from 'react';
import { onWebpackErrors } from './extensions/compiler';
import { Abnormal } from '@icon-park/react';
import { useSelector } from 'react-redux';
import { IdeState } from '@webIde/index';
import { EditorContext } from './context';
import { Badge } from 'antd';
import { css } from 'emotion';

const baseTipsBoxStyle: Record<string, any> = {
  position: 'fixed',
  bottom: '24px',
  right: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  border: '2px solid',
  zIndex: 100,
  cursor: 'pointer',
  userSelect: 'none',
};

const baseListStyle: Record<string, any> = {
  position: 'fixed',
  bottom: '40px',
  right: '60px',
  width: '300px',
  height: '350px',
  border: '1px solid',
  zIndex: 99,
  borderRadius: '10px',
  overflowY: 'auto',
};

const baseItemStyle: Record<string, any> = {
  margin: '8px 4px',
  padding: '2px 4px',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
};

const styles: Record<string, any> = {
  darkTipsBox: css({
    ...baseTipsBoxStyle,
    borderColor: '#3955f6',
    backgroundColor: '#555',
    boxShadow: '4px 4px 6px 6px rgba(0,0,0,0.1)',
    '&:hover': {
      backgroundColor: '#666',
    },
  }),
  darkList: css({
    ...baseListStyle,
    backgroundColor: '#333',
    borderColor: '#444',
    color: '#fff',
    boxShadow: '0 0 6px 6px rgba(0,0,0,0.1)',

    '&::-webkit-scrollbar': {
      display: 'none',
    },
  }),
  lightTipsBox: css({
    ...baseTipsBoxStyle,
    borderColor: 'transparent',
    boxShadow: '0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%), 0 9px 28px 8px rgb(0 0 0 / 5%)',
    '&:hover': {
      backgroundColor: '#edf4fd',
    },
  }),
  lightList: css({
    ...baseListStyle,
    borderColor: '#ddd',
    color: '#333',
    boxShadow: '0 1px 2px -2px rgb(0 0 0 / 16%), 0 3px 6px 0 rgb(0 0 0 / 12%), 0 5px 12px 4px rgb(0 0 0 / 9%)',

    '&::-webkit-scrollbar': {
      display: 'none',
    },
  }),
  darkItem: css({
    ...baseItemStyle,
    '&:hover': {
      backgroundColor: '#444',
    },
  }),
  lightItem: css({
    ...baseItemStyle,
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  }),
  itemLineTips: css({
    paddingLeft: '2px',
    paddingRight: '4px',
    fontWeight: 'bold',
  }),
};

interface Props {
  theme: string;
}

const MarkerPanel: React.FC<Props> = ({ theme }) => {
  const [showsList, setListVisible] = useState(true);
  const { instance } = useContext(EditorContext);
  const markers = useSelector((state: IdeState) => state.ide.workspace.markers);
  const [errors, setErrors] = useState([] as any[]);
  const themeName = theme[0].toLowerCase() + theme.slice(1);
  useEffect(() => {
    return onWebpackErrors(({ errors }) =>
      setErrors(
        (errors as any[]).map(({ loc, message }) => {
          const [row, col] = loc.split(':');
          return { severity: 8, message, startLineNumber: Number(row), startColumn: Number(col) };
        })
      )
    );
  });
  const severityDict: any = {
    1: { name: 'Hint', color: '#e8de58' },
    2: { name: 'Info', color: '#58dae8' },
    4: { name: 'Warning', color: '#e8de58' },
    8: { name: 'Error', color: '#f93b3b' },
  };

  if (!markers.length && !errors.length) {
    return null;
  }

  return (
    <>
      <div
        className={styles[`${themeName}TipsBox`]}
        onClick={() => {
          setListVisible(visible => !visible);
        }}
      >
        <Badge count={markers.length} size="small">
          <Abnormal
            theme="outline"
            size="26"
            fill={themeName === 'dark' ? '#fff' : '#428ce0'}
            style={{ lineHeight: '11px' }}
          />
        </Badge>
      </div>
      {showsList && (
        <div className={styles[`${themeName}List`]}>
          {[...errors, ...markers].map(
            ({ severity, message, startLineNumber, startColumn, endLineNumber, endColumn }, index) => (
              <div
                key={index}
                className={styles[`${themeName}Item`]}
                onClick={() => {
                  if (instance) {
                    instance.revealPositionInCenterIfOutsideViewport(
                      { lineNumber: startLineNumber, column: startColumn },
                      1
                    );
                    if (endColumn || endLineNumber) {
                      instance.setSelection({
                        startLineNumber,
                        endLineNumber,
                        startColumn,
                        endColumn,
                      });
                    }
                  }
                }}
              >
                <span style={{ color: severityDict[severity].color }}>[{severityDict[severity].name}]</span>
                <span className={styles.itemLineTips}>
                  Line {startLineNumber}:{startColumn}:
                </span>
                {message}
              </div>
            )
          )}
        </div>
      )}
    </>
  );
};

export default MarkerPanel;
