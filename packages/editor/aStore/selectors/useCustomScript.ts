import { useCallback } from 'react';
import { useStore } from 'react-redux';
import { createScene, deleteScene, updateScene } from '@shared/api/project';
import { addCustomScript, deleteCustomScript, updateCustomScript } from '@editor/aStore';
import { componentInUsed, getTopState } from '@editor/utils';
import { ICustomScriptState } from '../project';
import { withTsSuffix, withoutFileSuffix } from '@editor/Editor/Blueprint/utils/fileSuffix';

export async function createScriptComponent(
  projectId: number,
  name: string,
  script: PartialOmit<ICustomScriptState, 'id' | 'orderId' | 'name'>
) {
  return createScene({
    projectId: projectId,
    name: name,
    sceneContent: JSON.stringify(script),
  });
}

export const nameWithOrder = (name: string, customScripts: ICustomScriptState[]) => {
  const segment = '_';
  const max = customScripts.reduce((max, script) => {
    const result = new RegExp(`${withoutFileSuffix(name)}(?:$|${segment}(\\d+))`).exec(withoutFileSuffix(script.name));
    if (result) {
      const current = Number(result[1] || 0);
      if (current > max) {
        max = current;
      }
    }
    return max;
  }, -1);
  return max > -1 ? withTsSuffix(`${withoutFileSuffix(name)}${segment}${max + 1}`) : name;
};

const validateUniqueName = (
  { customScripts, editor: { prevState } }: EditorState['project'],
  newName: string
): boolean => {
  if (customScripts.some(script => script.name.slice(0, -3) === newName.slice(0, -3))) {
    return false;
  }
  return prevState ? validateUniqueName(prevState, newName) : true;
};

export function useOnAddCustomScript() {
  const { getState, dispatch } = useStore<EditorState, EditorAction>();
  return useCallback(
    async (newName: string, language: 'typescript' | 'javascript', content?: string, jsCode = '', status = 0) => {
      const { project } = getState();
      const projectId = project.id;
      newName = nameWithOrder(newName, getTopState(getState().project).customScripts);
      const { id, orderId } = await createScriptComponent(projectId, newName, {
        type: 'CustomScript',
        jsCode,
        ideCode: content || '',
        language,
        status,
      });
      dispatch(
        addCustomScript({
          id,
          orderId,
          name: newName,
          type: 'CustomScript',
          jsCode: jsCode,
          ideCode: content || '',
          language,
          status,
        })
      );

      return { id, orderId, projectId };
    },
    [getState, dispatch]
  );
}
export function useOnDeleteCustomScript() {
  const { getState, dispatch } = useStore<EditorState, EditorAction>();
  return useCallback(
    async (id: number, orderId: number, check = true) => {
      const { project } = getState();

      if (check && componentInUsed(project, orderId)) {
        throw new Error('脚本正在使用，无法删除');
      }
      await deleteScene(id).then(() => {
        dispatch(deleteCustomScript(id));
      });
    },
    [getState, dispatch]
  );
}

export function useOnRenameCustomScript() {
  const { getState, dispatch } = useStore<EditorState, EditorAction>();
  return useCallback(
    async (id: number, newName: string) => {
      const { project } = getState();
      const projectId = project.id;
      if (validateUniqueName(project, newName)) {
        await updateScene({ id, projectId, name: newName });
        dispatch(updateCustomScript(id, { name: newName }));

        return { id, name: newName };
      } else {
        throw new Error('项目中已有同名脚本，请修改后重新提交');
      }
    },
    [getState, dispatch]
  );
}

export function useOnSaveCustomScript() {
  const { dispatch } = useStore<EditorState, EditorAction>();
  return useCallback(
    async (id: number, name: string, content: Record<string, unknown>) => {
      dispatch(updateCustomScript(id, { name, ...content }));

      return { id, name, content };
    },
    [dispatch]
  );
}
