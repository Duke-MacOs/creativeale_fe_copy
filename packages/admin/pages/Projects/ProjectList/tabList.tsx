import { DeleteTwoTone } from '@ant-design/icons';
import { matcher, MatchStatus } from './matcher';
import { ProjectStatus } from './api';

const { MenuMy, MenuAdmin, MenuSuper, TypeProject, TypeTemplate, TypeExample, TeamMany, TeamSuper } = MatchStatus;

export const PROJECT_TABS = [
  {
    name: '全部',
    value: '',
    match: matcher(MenuAdmin + MenuSuper, TypeProject),
  },
  {
    name: '草稿',
    value: 'draft',
    match: matcher(MenuMy + MenuAdmin + MenuSuper, TypeProject),
  },
  {
    name: '归档',
    value: 'archive',
    match: matcher(MenuMy + MenuAdmin + MenuSuper, TypeProject),
  },
  {
    name: '作品',
    value: 'product',
    match: matcher(MenuMy + MenuAdmin + MenuSuper, TypeProject),
  },
  { name: '协作', value: 'borrowed', match: matcher(MenuMy, TypeProject, TeamMany + TeamSuper) },
  {
    name: (
      <>
        回收站 <DeleteTwoTone style={{ marginRight: 0 }} />
      </>
    ),
    value: 'deleted',
    match: matcher(MenuMy + MenuAdmin + MenuSuper, TypeProject),
  },
  {
    name: '审核中',
    value: String(ProjectStatus.Approving),
    match: matcher(MenuMy + MenuAdmin + MenuSuper, TypeTemplate),
  },
  {
    name: '已通过',
    value: String(ProjectStatus.Approved),
    match: matcher(MenuMy + MenuAdmin + MenuSuper, TypeTemplate),
  },

  {
    name: '已拒绝',
    value: String(ProjectStatus.Rejected),
    match: matcher(MenuMy + MenuAdmin + MenuSuper, TypeTemplate),
  },
  {
    name: '已下架',
    value: String(ProjectStatus.Removed),
    match: matcher(MenuMy + MenuAdmin + MenuSuper, TypeTemplate),
  },
  {
    name: '审核中',
    value: String(ProjectStatus.ExampleApproving),
    match: matcher(MenuMy + MenuAdmin + MenuSuper, TypeExample),
  },
  {
    name: '已通过',
    value: String(ProjectStatus.ExampleApproved),
    match: matcher(MenuMy + MenuAdmin + MenuSuper, TypeExample),
  },

  {
    name: '已拒绝',
    value: String(ProjectStatus.ExampleRejected),
    match: matcher(MenuMy + MenuAdmin + MenuSuper, TypeExample),
  },
  {
    name: '已下架',
    value: String(ProjectStatus.ExampleRemoved),
    match: matcher(MenuMy + MenuAdmin + MenuSuper, TypeExample),
  },
];
