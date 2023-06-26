import { ICustomScriptState } from '@editor/aStore';
import { updateScene } from '@shared/api/project';
import { isNil } from 'lodash';

interface IScriptItem extends ICustomScriptState {
  projectId: number;
}

export function amendTabName(scriptList: IScriptItem[]) {
  const nameDict: Record<string, number> = {};
  const plist: Array<Promise<IScriptItem>> = [];

  scriptList.forEach(script => {
    const { projectId, id, name, language, ...restContent } = script;
    let taskType = 0; // 0: 无需改名；>=1 有重名；>=10: 需添加后缀或添加后缀后有重名
    let pureName = name;
    let fileSuffix = '';

    // 没有后缀
    if (!name.endsWith('.ts') && !name.endsWith('.js')) {
      taskType = 10;
      fileSuffix = language === 'typescript' ? '.ts' : '.js';
    } else {
      pureName = name.slice(0, -3);
      fileSuffix = name.slice(-3);
    }

    // 与前面的资源名存在重复
    if (nameDict[pureName]) taskType++;

    if (taskType === 0) {
      plist.push(Promise.resolve(script));
      nameDict[pureName] = 1;
    } else {
      let fileName = name;
      if (taskType !== 10) {
        fileName = `${pureName}(${nameDict[pureName]})`;
      }
      nameDict[name] = isNil(nameDict[pureName]) ? 1 : nameDict[pureName] + 1;

      plist.push(
        updateScene({
          id,
          projectId,
          name: fileName + fileSuffix,
          sceneContent: JSON.stringify({ language, ...restContent }),
        }).then(() => {
          return { ...script, name: fileName + fileSuffix };
        })
      );
    }
  });

  return Promise.all(plist);
}
