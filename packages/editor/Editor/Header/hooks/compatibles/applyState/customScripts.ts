import { fetchUserMaterialList } from '@shared/api/library';
import { createScriptComponent } from '@editor/aStore';
import Axios from 'axios';

export default async (state: EditorState['project']) => {
  const customScripts = [...state.customScripts];

  const { materialList } = await fetchUserMaterialList({
    projectId: state.id,
    page: 1,
    pageSize: 99,
    types: '25',
  } as any).catch(() => ({ materialList: [] }));

  for (const { previewUrl, name } of materialList) {
    if (customScripts.find(({ parentId }) => parentId === previewUrl)) {
      continue;
    }

    const { data } = await Axios.get(previewUrl);
    const baseScript = {
      name,
      jsCode: data.jsCode,
      ideCode: data.ideCode ? data.ideCode : data.language === 'typescript' ? data.tsCode : data.jsCode,
      language: data.language,
      parentId: previewUrl,
      type: 'CustomScript' as const,
    };
    const { id, orderId } = await createScriptComponent(state.id, baseScript.name, baseScript);
    customScripts.push({ ...baseScript, id, orderId });
  }
  return { ...state, customScripts };
};
