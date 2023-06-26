import traverse from '@babel/traverse';
import { ICustomScriptState } from '@editor/aStore';
import { transform } from '@babel/standalone';
import { withTsSuffix } from './fileSuffix';
import { updateComponent } from '@editor/aStore/selectors/useClipboard/utils';

/**
 * 获取代码中import引入的其他脚本的orderId
 * @param ideCode
 * @param customScripts
 * @param callback
 */
export function syncGetCustomScriptDeps(
  ideCode: string,
  customScripts: ICustomScriptState[],
  callback: (script: ICustomScriptState) => void
) {
  try {
    const { ast } = transform(ideCode, { presets: ['typescript'], filename: 'main.ts', ast: true });
    if (ast) {
      traverse(ast, {
        ImportDeclaration(path) {
          const fileName = withTsSuffix(path.node.source.value.replace(/^\.\//, ''));
          const script = customScripts.find(script => script.name === fileName);
          if (script) {
            callback(script);
          }
        },
      });
    }
  } catch {}
}

/**
 * 异步方法，主要用于跨项目复制脚本时进行取值
 * @param ideCode
 * @param getOldCustomScript
 * @param callback
 */
export function asyncGetCustomScriptDeps(
  ideCode: string,
  getOldCustomScript: Parameters<typeof updateComponent>[5],
  callback: (script: ICustomScriptState) => void
) {
  try {
    const { ast } = transform(ideCode, { presets: ['typescript'], filename: 'main.ts', ast: true });
    if (ast) {
      traverse(ast, {
        ImportDeclaration(path) {
          const fileName = withTsSuffix(path.node.source.value.replace(/^\.\//, ''));
          getOldCustomScript(undefined, fileName).then(([_, script]) => {
            if (script) {
              callback(script);
            }
          });
        },
      });
    }
  } catch {}
}
