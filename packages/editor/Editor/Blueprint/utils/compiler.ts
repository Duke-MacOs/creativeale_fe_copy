import { ICustomScriptState } from '@editor/aStore';
import { transform } from '@babel/standalone';
import { serverSideBundler } from '@shared/api/library';
import { withTsSuffix, withoutFileSuffix } from './fileSuffix';
import md5 from 'md5';
import { notificationForCompile } from './notification';

/**
 * 只编译单个TS文件
 * @param tsCode
 * @returns
 */
export const compilerTSCode = async (entryCustomScript: ICustomScriptState, allCustomScripts: ICustomScriptState[]) => {
  return retryFn(async () => {
    const jsCode = await serverSideBundler(
      {
        name: entryCustomScript.name || 'compilerTSCode.ts',
        content: entryCustomScript.ideCode,
      },
      allCustomScripts
        .filter(scene => scene.id !== entryCustomScript.id)
        .map(({ name, ideCode: content }) => ({
          name,
          content,
        }))
    );
    return jsCode.replace(
      /module\.exports\s+=\s+(__toCommonJS\(\w+\));/,
      `Object.defineProperty(exports, 'default', { get: () => $1.default });`
    );
  });
};

export async function compileAllToOne(customScripts: ICustomScriptState[]): Promise<string> {
  try {
    customScripts = customScripts.map(script => ({ ...script, name: script.name.replace('/', '_') })); // 兼容老数据，后续可移除
    const entry = generateEntry(customScripts);
    const jsCode = await serverSideBundler(
      {
        name: 'entry.ts',
        content: entry,
      },
      customScripts.map(({ name, ideCode: content }) => ({
        name: withTsSuffix(name),
        content,
      }))
    );
    return jsCode;
  } catch (error) {
    notificationForCompile({
      type: 'error',
      message: '脚本编译失败',
      description: error.message,
      duration: 2,
    });

    throw error;
  }

  function generateEntry(customScripts: ICustomScriptState[]) {
    const entries = customScripts.filter(({ ideCode }) => /export\s+default\s+class/.test(ideCode));
    const hashMap = new Map();
    const { importStatement, regStatement, recordStatement } = entries.reduce(
      ({ importStatement, regStatement, recordStatement }, { orderId, name, ideCode }, currentIndex) => {
        const path = withoutFileSuffix(name);
        let fileName = `_${path.replace(/[()（）-\s]/g, '_')}${currentIndex}`; // 替换非法字符
        const hash = md5(ideCode);
        if (hashMap.has(hash)) {
          fileName = hashMap.get(hash);
        } else {
          hashMap.set(hash, fileName);
          importStatement.push(`import ${fileName} from './${path}';\r\n`);
        }
        regStatement.push(`Riko.RegManager.regScript(${orderId}, ${fileName});\r\n`);
        recordStatement.push(`${orderId}: ${fileName},\r\n`);
        return {
          importStatement,
          regStatement,
          recordStatement,
        };
      },
      {
        importStatement: [] as string[],
        regStatement: [] as string[],
        recordStatement: [] as string[],
      }
    );

    return `
      ${importStatement.join('')}
      ${regStatement.join('')}
      const map = {
        ${recordStatement.join('')}
      }
      exports.default = function (orderId) {
        return map[orderId]
      }
    `;
  }
}

export function isValidCode(code: string) {
  try {
    transform(code, { presets: ['typescript'], filename: 'main.ts' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 云函数小概率异常报错，此时重发请求
 * @param asyncFn
 * @param times
 * @returns
 */
function retryFn(asyncFn: () => Promise<any>, times = 2): any {
  try {
    return asyncFn();
  } catch (error) {
    if (times > 0) {
      return retryFn(asyncFn, times - 1);
    }
    throw error;
  }
}
