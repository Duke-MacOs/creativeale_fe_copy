import { monaco } from 'react-monaco-editor';
import { getNodeModulePath, getFilePath } from './path';

class ExtraLibManager {
  protected dict: Record<string, { jsLib: monaco.IDisposable; tsLib: monaco.IDisposable }> = {};

  add(name: string, libContent: string, isNodeModule = false) {
    const path = isNodeModule ? getNodeModulePath(name) : getFilePath(name);
    const jsLib = monaco.languages.typescript.javascriptDefaults.addExtraLib(libContent, path);
    const tsLib = monaco.languages.typescript.typescriptDefaults.addExtraLib(libContent, path);
    this.dict[path] = { jsLib, tsLib };
  }
  remove(name: string) {
    const path = getFilePath(name);
    if (this.dict[path]) {
      const { jsLib, tsLib } = this.dict[path];
      jsLib.dispose();
      tsLib.dispose();
      delete this.dict[path];
    }
  }
}

export const extraLib = new ExtraLibManager();
