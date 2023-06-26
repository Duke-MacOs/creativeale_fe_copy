import JSZip from 'jszip';
import { relativeUrl } from '@shared/utils';
import { newID } from '@editor/utils';
import { isNil, isArray, isNumber } from 'lodash';
import { createResource, createResourceAutoCompress } from '@shared/api';
import { INodeData, IScriptData } from '@byted/riko';
import { IRikoModelResponse } from './index';
import { ResourceType } from '../accepted';

export const toNodeState = (node: INodeData, rootId: number) => {
  const nodes = node.nodes ?? [];
  const scripts = node.scripts ?? [];
  if (node.type == 'Scene3D') {
    node.id = rootId;
  } else {
    node.id = isNumber(node.id) ? rootId + node.id : newID();
  }
  // bones、rootBone
  if (!isNil(node.props) && isArray(node.props.bones)) {
    node.props.bones = node.props.bones.map(id => id + rootId);
  }
  if (!isNil(node.props) && isNumber(node.props.rootBone)) {
    node.props.rootBone += rootId;
  }
  return {
    id: node.id,
    type: node.type,
    props: node.props,
    editor: node.editor ?? {},
    nodes: nodes.reduce((list, node) => {
      list.push(toNodeState(node, rootId));
      return list;
    }, [] as INodeData[]),
    scripts: scripts.reduce((list, script) => {
      list.push(toScriptState(script, rootId));
      return list;
    }, [] as IScriptData[]),
  };
};

const toScriptState = (script: IScriptData, rootId: number) => {
  script.id = newID();
  const props = {
    ...script.props,
  };
  if (props.scripts) {
    props.scripts = props.scripts.reduce((list, script) => {
      list.push(toScriptState(script, rootId));
      return list;
    }, [] as IScriptData[]);
  }
  return {
    id: script.id,
    type: script.type,
    props,
  };
};

const getAssetsPath = (url: string, prefix?: string) => {
  const paths = url.split('/');
  if (prefix === undefined) {
    return paths.pop() ?? '';
  } else {
    const idx = paths.lastIndexOf(prefix);
    const assetsPath = paths.reduce((path, item, index) => {
      if (index >= idx) {
        path += `${item}`;
        if (index < paths.length - 1) {
          path += '/';
        }
      }
      return path;
    }, '');
    return assetsPath;
  }
};

const replaceUrl = (content: string, files: Array<string[][]>, prefix?: string) => {
  files.forEach(list => {
    list.forEach(file => {
      content = content.replaceAll(getAssetsPath(file[0], prefix), file[1]);
    });
  });
  return content;
};

const uploadTree = async (
  zip: JSZip,
  entryFiles: [string, JSZip.JSZipObject, string][],
  files: [string, JSZip.JSZipObject, string][],
  type: number | string[],
  options: { projectId: number; distinct: boolean },
  errors: string[],
  replacePrefix?: string
) => {
  const levels: Record<string, [string, JSZip.JSZipObject, string][]> = {
    '0': entryFiles,
  };
  let level = 0;
  const done: string[] = [];
  let curCount = -1;
  while (done.length < files.length && curCount != 0) {
    const list: [string, JSZip.JSZipObject, string][] = [];
    curCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!done.includes(file[0])) {
        for (let j = 0; j < levels[level].length; j++) {
          const content = await levels[level][j][1].async('string');
          if (content.indexOf(getAssetsPath(file[0])) != -1) {
            list.push(file);
            done.push(file[0]);
            curCount++;
          }
        }
      }
    }
    level += 1;
    levels[`${level}`] = list;
  }
  for (let i = level; i > 0; i--) {
    const files = levels[`${i}`];
    const uploads = await uploadFiles(
      files,
      Array.isArray(type) ? ResourceType[type[i - 1] as keyof typeof ResourceType] || 28 : type,
      options,
      errors
    );
    if (i > 1) {
      const preFiles = levels[`${i - 1}`];
      for (let j = 0; j < preFiles.length; j++) {
        let content = await preFiles[j][1].async('string');
        content = replaceUrl(content, [uploads], replacePrefix);
        zip.file(preFiles[j][0], content); // 更新
        preFiles[j][1] = (await zip.file(preFiles[j][0])) as JSZip.JSZipObject;
      }
    } else {
      return uploads;
    }
  }

  return [];
};

const uploadFiles = async (
  files: [string, JSZip.JSZipObject, string][],
  type: number,
  options: { projectId: number; distinct: boolean },
  errors: string[],
  compress = 0
) => {
  const promise: Promise<any>[] = [];
  for (let i = 0; i < files.length; i++) {
    const content = await files[i][1].async('blob');
    if (files[i][0].endsWith('.json')) {
      promise.push(
        createResource({
          file: new File([content], files[i][0], {
            type: 'application/json',
          }),
          type,
          name: files[i][2],
          ...options,
        }).catch(err => err)
      );
    } else {
      const params = { file: new File([content], files[i][0]), name: files[i][2], type, ...options };
      promise.push(
        compress === 0 ? createResource(params).catch(err => err) : createResourceAutoCompress(params).catch(err => err)
      );
    }
  }
  if (promise.length > 0) {
    return (await Promise.all(promise)).reduce((list, res, idx) => {
      if (res) {
        if (res.url) {
          list.push([files[idx][0], relativeUrl(res.url)]);
        } else if (res.message) {
          errors.push(`${files[idx][0]} ${res.message}`);
        }
      }
      return list;
    }, []);
  }

  return [];
};

export const convertDataToZipObject = async (data: IRikoModelResponse) => {
  const zip = new JSZip();
  const assets = zip.folder('assets');
  for (const [path, file] of Object.entries(data.files)) {
    if (data.entry === path) {
      zip.file(path, file);
    } else {
      assets?.file(path, file);
    }
  }
  return zip;
};

export const handleResourceZip = async (zip: JSZip, projectId: number, replacePrefix?: string) => {
  const entries = Object.entries(zip.files);

  const options = { projectId, distinct: true };
  const errors: string[] = [];

  const rMatFiles: [string, JSZip.JSZipObject, string][] = [];
  const rMeshFiles: [string, JSZip.JSZipObject, string][] = [];
  const rAniFiles: [string, JSZip.JSZipObject, string][] = [];
  const rtcbFiles: [string, JSZip.JSZipObject, string][] = [];
  const imageFiles: [string, JSZip.JSZipObject, string][] = [];
  const rTexFiles: [string, JSZip.JSZipObject, string][] = [];
  // .json 格式的资源
  const jsonFiles: [string, JSZip.JSZipObject, string][] = [];
  // 入口文件
  const entryFiles: [string, JSZip.JSZipObject, string][] = [];

  const rootId = Math.floor(newID() / 1000);

  // 文件分类
  for (const [filename, itemFile] of entries) {
    const paths = filename.split('/');
    const name = paths[paths.length - 1];
    // 兼容 MAC 解压再压缩、非隐藏文件
    if (!filename.startsWith('__MACOSX/') && !itemFile.dir && !name.startsWith('.')) {
      let propName;
      try {
        propName = JSON.parse(await itemFile.async('string')).props?.name;
      } catch (e) {
        //
      }
      if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
        imageFiles.push([filename, itemFile, propName]);
      } else if (name.endsWith('.rmat')) {
        rMatFiles.push([filename, itemFile, propName]);
      } else if (name.endsWith('.rmesh')) {
        rMeshFiles.push([filename, itemFile, propName]);
      } else if (name.endsWith('.rani')) {
        rAniFiles.push([filename, itemFile, propName]);
      } else if (name.endsWith('.rtcb')) {
        rtcbFiles.push([filename, itemFile, propName]);
      } else if (name.endsWith('.rtex')) {
        rTexFiles.push([filename, itemFile, propName]);
      } else if (name.endsWith('.json')) {
        if (/assets\/[\d\D]+.json$/.test(filename)) {
          jsonFiles.push([filename, itemFile, propName]);
        } else {
          entryFiles.push([filename, itemFile, propName]);
        }
      }
    }
  }

  // 先上传图片
  const uploadImage: string[][] = await uploadFiles(imageFiles, 5, options, errors, 1);

  // 再上传 rmesh
  const uploadMesh: string[][] = await uploadFiles(rMeshFiles, 0, options, errors);

  // 再上传 rani
  const uploadAni: string[][] = await uploadFiles(rAniFiles, 0, options, errors);

  // 再上传 rtcb
  const uploadRtcb: string[][] = await uploadFiles(rtcbFiles, 0, options, errors);

  // 替换 rtex url
  for (let i = 0; i < rTexFiles.length; i++) {
    let content = await rTexFiles[i][1].async('string');
    content = replaceUrl(content, [uploadImage], replacePrefix);
    content = JSON.stringify(JSON.parse(content));
    zip.file(rTexFiles[i][0], content); // 更新
    rTexFiles[i][1] = (await zip.file(rTexFiles[i][0])) as JSZip.JSZipObject;
  }

  // 替换 rmat url
  for (let i = 0; i < rMatFiles.length; i++) {
    let content = await rMatFiles[i][1].async('string');
    content = replaceUrl(content, [uploadImage], replacePrefix);
    const contentObj = JSON.parse(content);
    // 上传 Texture2D
    for (let k = 0, entries = Object.entries(contentObj.props); k < entries.length; k++) {
      const [key, val] = entries[k];
      if (key.endsWith('Url')) {
        const file = rTexFiles.find(([fileName]) => fileName === val);
        if (file) {
          const content = await file[1].async('blob');
          const res = await createResource({
            file: new File([content], `${file[0]}`, {
              type: 'application/rtex',
            }),
            type: 0,
            name: `${file[2]}.rtex`,
            ...options,
          }).catch(err => err);
          contentObj.props[key] = relativeUrl(res.url);
        }
      }
    }
    content = JSON.stringify(contentObj);
    zip.file(rMatFiles[i][0], content); // 更新
    rMatFiles[i][1] = (await zip.file(rMatFiles[i][0])) as JSZip.JSZipObject;
  }

  // 上传 rmat
  const uploadMat: string[][] = await uploadFiles(rMatFiles, 28, options, errors);

  // 替换 Json 中的 url
  const recordJsonType: string[] = [];
  for (let i = 0; i < jsonFiles.length; i++) {
    let content = await jsonFiles[i][1].async('string');
    recordJsonType[i] = JSON.parse(content).type;
    content = replaceUrl(content, [uploadImage, uploadMat, uploadMesh, uploadAni, uploadRtcb], replacePrefix);
    const animation3d = toNodeState(JSON.parse(content), rootId);
    zip.file(jsonFiles[i][0], JSON.stringify(animation3d)); // 更新
    jsonFiles[i][1] = (await zip.file(jsonFiles[i][0])) as JSZip.JSZipObject;
  }

  // 上传 Json
  const uploadJsonFiles: string[][] = await uploadTree(
    zip,
    entryFiles,
    jsonFiles,
    recordJsonType,
    options,
    errors,
    replacePrefix
  );

  // 替换 json url
  const res = [];
  for (let i = 0; i < entryFiles.length; i++) {
    let content = await entryFiles[i][1].async('string');
    content = replaceUrl(
      content,
      [uploadImage, uploadMat, uploadMesh, uploadAni, uploadRtcb, uploadJsonFiles],
      replacePrefix
    );
    const model3D = toNodeState(JSON.parse(content), rootId);
    zip.file(entryFiles[i][0], JSON.stringify(model3D)); // 更新
    entryFiles[i][1] = (await zip.file(entryFiles[i][0])) as JSZip.JSZipObject;
    const blob = await entryFiles[i][1].async('blob');
    res.push({ node: model3D, blob });
  }

  return { res, errors };
};
