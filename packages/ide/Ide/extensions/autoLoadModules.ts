import { monaco } from 'react-monaco-editor';
import { IExtensionsManager } from '.';
import { ITabState } from '@webIde/store';
import { loadModel } from '../hooks/useResource';
import TabManager from '../TabManager';

const loadingState: Record<string, boolean> = {};

function registerCompletion(language: 'javascript' | 'typescript') {
  monaco.languages.registerCompletionItemProvider(language, {
    provideCompletionItems: function (model, position) {
      const { lineNumber, column } = position;
      const lineContent = model.getLineContent(lineNumber);
      const range = {
        startLineNumber: lineNumber,
        endLineNumber: lineNumber,
        startColumn: column,
        endColumn: column,
      };

      const completionMatch = lineContent.match(/^(import)\s[\s\S]*\s?from\s['"]\.\/['"]/);
      if (!completionMatch) {
        return { suggestions: [] };
      }

      return Promise.resolve().then(() => {
        const tabLists = Object.values(TabManager.getAllTabs());

        if (completionMatch) {
          return {
            suggestions: tabLists
              .filter(tab => {
                return tab.name.slice(0, -3) !== model.uri.path.slice(1, -3);
              })
              .map((tab: ITabState) => {
                const insertText = tab.name.slice(0, -3);
                return {
                  label: insertText,
                  kind: monaco.languages.CompletionItemKind.File,
                  insertText: insertText,
                  range,
                };
              }),
          };
        }
      });
    },
    triggerCharacters: [`/`],
  });
}

export default function install(): ReturnType<IExtensionsManager['setupList'][number]> {
  registerCompletion('typescript');
  registerCompletion('javascript');
  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

  return {
    activationEvents: ['onMarkersUpdate'],
    task: (model, result) => {
      const cantFindModuleMakers = monaco.editor
        .getModelMarkers({ resource: model.uri })
        .filter(marker => marker.code === '2307');
      const tabDict: Record<string, ITabState> = {};

      const tabs = TabManager.getAllTabs();
      Object.values(tabs).forEach(tab => {
        tabDict[tab.name.slice(0, -3)] = tab;
      });

      cantFindModuleMakers.forEach(marker => {
        const { startColumn, endColumn, startLineNumber, endLineNumber } = marker;
        const relativePath = model
          .getValueInRange({
            startColumn,
            endColumn,
            startLineNumber,
            endLineNumber,
          })
          .slice(1, -1);
        if (relativePath.startsWith('./')) {
          const filename = relativePath.slice(2);
          if (tabDict[filename] && !loadingState[tabDict[filename].id]) {
            loadingState[tabDict[filename].id] = true;
            loadModel(tabDict[filename])
              .then(() => {
                loadingState[tabDict[filename].id] = false;
              })
              .catch(err => {
                console.error(err.message);
              });
          }
        }
      });
      return Promise.resolve(result);
    },
  };
}
