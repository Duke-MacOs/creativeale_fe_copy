export enum MaterialTagStatus {
  Enabled = 1,
  Deleted = 2,
  Disable = 3,
}
export enum MaterialTagLevel {
  First = 1,
  Second = 2,
  Third = 3,
}
export enum MaterialTagSource {
  Platform = 1,
  Cloud = 2,
}

export interface IMaterialTag {
  id?: string;
  name?: string;
  description?: string;
  materialCount?: number;
  deleted?: number;
  status?: MaterialTagStatus;
  category?: MaterialTagCategory;
  level?: MaterialTagLevel;
  source?: MaterialTagSource;
  path?: string;
  onPlatform?: boolean;
  onCloud?: boolean;
  children?: IMaterialTag[];
  createdAt?: string;
  updatedAt?: string;
}
export interface IFormatedMaterialTag extends IMaterialTag {
  disabled?: boolean;
  first: string;
  second: string;
  third: string;
  levelPath: string[];
  _scenes: string;
}

export enum MaterialTagCategory {
  CreativeIdea = 1,
  // Technology = 2,
  Aesthetics = 3,
  Audio = 4,
  // Video = 5,
  Image = 6,
  // Game = 7,
  Marketing = 8,
}
export interface ITagTreeItem extends IMaterialTag {
  id?: string;
  label: string;
  value: string;
  selectable?: boolean;
  disabled?: boolean;
  children?: ITagTreeItem[];
}

export const TagCategories = [
  {
    label: '创意思路',
    value: MaterialTagCategory.CreativeIdea,
  },
  {
    label: '美学',
    value: MaterialTagCategory.Aesthetics,
  },
  {
    label: '音频',
    value: MaterialTagCategory.Audio,
  },
  {
    label: '图片',
    value: MaterialTagCategory.Image,
  },
  {
    label: '营销卖点',
    value: MaterialTagCategory.Marketing,
  },
];

function getFormatedTags(originTags: IMaterialTag[]) {
  const tagCategoryMap = TagCategories.reduce((map, { label, value }) => ({ ...map, [value]: label }), {});
  return originTags.map((tag: any) => {
    const pathTags = tag?.path?.split('#');
    return {
      ...tag,
      levelPath: [(tagCategoryMap as any)[tag.category] || '', ...pathTags],
      first: pathTags[0],
      second: pathTags[1],
      third: pathTags[2],
      _scenes:
        [tag.onPlatform && '平台资源', tag.onCloud && '云端资源'].filter(Boolean).join('、') || '尚未设置分发场景',
    } as IFormatedMaterialTag;
  });
}

function covertTagsToTree(
  tags: IFormatedMaterialTag[],
  options?: {
    disableEnabledTag: boolean;
  }
) {
  const { disableEnabledTag } = options || {};

  const getChildren = (parentName: string, childLevel: number) => {
    const children = tags.filter(t => {
      return t?.path?.startsWith(parentName);
    });

    if (children.length === 0) {
      return [];
    }

    const childTags = Object.values(
      children.reduce((obj: any, t) => {
        const name = t.levelPath[childLevel];
        const targetPath = [parentName, t.levelPath[childLevel]].join('#');

        if (!obj[targetPath]) {
          if (childLevel === t.levelPath.length - 1) {
            obj[targetPath] = {
              ...t,
              label: t.name,
              value: t.id,
              disabled: disableEnabledTag ? t.status === MaterialTagStatus.Enabled : false,
            };
          } else {
            const children = getChildren(targetPath, childLevel + 1);
            obj[targetPath] = {
              label: name,
              value: name,
              children,
              disabled: children.length === 0,
            };
          }
        }
        return obj;
      }, {})
    );
    return childTags.filter((t: any) => !t.disabled);
  };

  const rootTags: ITagTreeItem[] = Object.values(
    tags.reduce((obj: any, tag) => {
      if (!obj[tag.first]) {
        const children = getChildren(tag.first, 2);
        obj[tag.first] = {
          label: tag.first,
          value: tag.first,
          children,
          category: tag.category,
          disabled: children.length === 0,
        };
      }
      return obj;
    }, {})
  );

  return TagCategories.map(t => {
    const children = rootTags.filter(tag => !tag.disabled && tag.category === t.value);
    return {
      id: `categoty_${t.value}`,
      value: String(t.value),
      label: t.label,
      children,
      selectable: false,
      checkable: false,
      disabled: children.length === 0,
    } as ITagTreeItem;
  }).filter(c => !c.disabled);
}
const getTreeData = (tagList: IMaterialTag[]) => covertTagsToTree(getFormatedTags(tagList));
export default getTreeData;
