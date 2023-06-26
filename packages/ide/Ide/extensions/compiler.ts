import { isString } from 'lodash';
import { monaco } from 'react-monaco-editor';
import { isArray, isNil } from 'lodash';
import { IExtensionsManager } from '.';
import { ITabState } from '@webIde/store';
import { createModel, getModel } from '../monacoUtils';
import TabManager from '../TabManager';
import { serverSideBundler } from '@shared/api/library';

type UnpackedContent = {
  entry: { name: string; content: string };
  deps: Array<{ name: string; content: string }>;
};

function setTsCompilerOptions() {
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2016,
    allowNonTsExtensions: true,
  });
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2016,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    allowNonTsExtensions: true,
    allowJs: true,
    removeComments: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
  });
}

function compileTs(model: monaco.editor.ITextModel): Promise<string | Error> {
  return new Promise((resolve, reject) => {
    monaco.languages.typescript.getTypeScriptWorker().then(worker => {
      worker(model.uri).then(client => {
        client
          .getEmitOutput(model.uri.toString())
          .then(function (res) {
            resolve(res.outputFiles[0].text);
          })
          .catch(() => {
            reject(new Error('typescript file compile error'));
          });
      });
    });
  });
}

function runCompiler(model: monaco.editor.ITextModel) {
  let needsDisposeTempModel = false;

  if (model.getModeId() !== 'typescript') {
    model = createModel(
      model.uri.path.slice(1, -3) + '_' + new Date().getTime() + '.ts',
      model.getValue(),
      'typescript'
    );
    needsDisposeTempModel = true;
  }
  return compileTs(model).then(compiledContent => {
    if (model.getValue() && !compiledContent) {
      throw new Error('编译出现错误，请保存重试');
    }
    if (needsDisposeTempModel) {
      model.dispose();
    }
    return compiledContent;
  });
}

function getDepModels(
  mainModel: monaco.editor.ITextModel,
  deps: Array<{
    uri: monaco.Uri;
    model: monaco.editor.ITextModel;
  }> = []
) {
  const reg = new RegExp(/import\s[\s\S]*\s?from\s['"]\.\/([\w\-]+)['"]/, 'i');
  const findRes = mainModel.findMatches(reg as any, false, true, false, null, true);
  const tabDict: Record<string, ITabState> = Object.fromEntries(
    Object.entries(TabManager.getAllTabs()).map(([_, tab]) => [tab.name.slice(0, -3), tab])
  );

  findRes.forEach(({ matches }) => {
    if (isArray(matches) && matches?.length === 2) {
      const filename = matches[1];
      if (tabDict[filename]) {
        const suffix = tabDict[filename].resourceLanguage === 'typescript' ? '.ts' : '.js';
        const depModel = getModel(filename + suffix);
        if (depModel && deps.every(dep => dep.uri !== depModel.uri)) {
          deps.push({
            uri: depModel.uri,
            model: depModel,
          });
          getDepModels(depModel, deps);
        }
      }
    }
  });
  return deps;
}

export default function install(): ReturnType<IExtensionsManager['setupList'][number]> {
  setTsCompilerOptions();
  return {
    activationEvents: ['onSave'],
    task: async (model, result) => {
      const deps = getDepModels(model)
        .filter(dep => dep.uri !== model.uri)
        .map(dep => dep.model);
      const unPackedContent: UnpackedContent = {
        entry: { name: model.uri.path.slice(1).replace(/\.ts$/, '.js'), content: '' },
        deps: [],
      };

      const entryContent = await runCompiler(model);
      if (isString(entryContent)) {
        unPackedContent.entry.content = entryContent;
      }
      for (const dep of deps) {
        const depContent = await runCompiler(dep);
        if (isString(depContent)) {
          unPackedContent.deps.push({
            name: dep.uri.path.slice(1).replace(/\.ts$/, '.js'),
            content: depContent,
          });
        }
      }
      try {
        const packedContent = await serverSideBundler(unPackedContent.entry, unPackedContent.deps);
        if (!isNil(result)) {
          result.jsCode = packedContent as string;
        }
        return result;
      } catch (error) {
        ON_WEBPACK_ERRORS.forEach(listener => listener(error.response.data));
        throw error;
      }
    },
  };
}

const ON_WEBPACK_ERRORS: Array<(error: any) => void> = [];

export const onWebpackErrors = (listener: (error: any) => void) => {
  ON_WEBPACK_ERRORS.push(listener);
  return () => {
    const index = ON_WEBPACK_ERRORS.findIndex(l => l === listener);
    if (index > -1) {
      ON_WEBPACK_ERRORS.splice(index, 1);
    }
  };
};
