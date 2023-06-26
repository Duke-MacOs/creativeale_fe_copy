import { monaco } from 'react-monaco-editor';
import installComplier from './compiler';
import installModuleLoader from './autoLoadModules';
export type EventTaskResult = Record<string, unknown> | null | Error;

export type EventTaskItem = {
  (model: monaco.editor.ITextModel, result: Record<string, unknown> | null): Promise<EventTaskResult>;
};

type EventTypes = 'onSave' | 'onChange' | 'onMarkersUpdate';
export interface IExtensionsManager {
  setupList: Array<() => { activationEvents: Array<EventTypes>; task: EventTaskItem }>;
  eventTasks: {
    onSave: Array<EventTaskItem>;
    onChange: Array<EventTaskItem>;
    onMarkersUpdate: Array<EventTaskItem>;
  };
}

export const extensionsManager: IExtensionsManager = {
  setupList: [installComplier, installModuleLoader],
  eventTasks: {
    onSave: [],
    onChange: [],
    onMarkersUpdate: [],
  },
};

export function setupExtensions() {
  extensionsManager.setupList.forEach(installation => {
    const { activationEvents, task } = installation();
    activationEvents.forEach(eventName => {
      extensionsManager.eventTasks[eventName].push(task);
    });
  });
}

export async function emitEventTasks(
  model: monaco.editor.ITextModel | null,
  eventType: EventTypes,
  result: Record<string, unknown> | null
) {
  const tasks = extensionsManager.eventTasks[eventType];
  const taskLen = tasks.length;
  let i = 0;
  if (model) {
    while (i < taskLen) {
      (await tasks[i](model, result)) as typeof result;
      i++;
    }
  }
  return result;
}
