import React from 'react';

import type { ColumnType, ColumnsType } from 'antd/es/table';
import { IMyProjectParams, IProjectFromServer, ProjectStatus } from '../api';
import { WithPathReturn } from '@main/routes/withPath';
import { IUserInfo } from '@shared/types';

import { coverAndPreview } from './coverAndPreview';
import { industryColumn } from './industryColumn';
import { projectAction } from './projectAction';
import { versionGroup } from './versionGroup';
import { editorColumn } from './editorColumn';
import { auditAction } from './auditAction';
import { transition } from './transition';
import { userColumn } from './userColumn';
import { teamColumn } from './teamColumn';
import { createdAt } from './createdAt';
import { nameAndId } from './nameAndId';
import { updatedAt } from './updatedAt';

export type GetProjectColumn = (_: MutateProject) => ColumnType<IProjectFromServer>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface MutateProject extends Pick<IMyProjectParams, 'userId' | 'teamId' | 'match'> {
  userInfo: IUserInfo;
  onPreviewProject: (
    reason: string,
    preview: () => Promise<{ previewUrl: string; typeOfPlay: number }>
  ) => Promise<void>;
  onUpdateProject: (reason: string, update: () => Promise<PartialPick<IProjectFromServer, 'id'>>) => Promise<void>;
  onRemoveProject: (reason: string, remove: () => Promise<IProjectFromServer['id']>) => Promise<void>;
  onCreateProject: (reason: string, create: () => Promise<IProjectFromServer>) => Promise<void>;
  onGotoProject: (
    message: string,
    go: (routes: WithPathReturn<IMyProjectParams>[], project: WithPathReturn<IMyProjectParams>) => string | void
  ) => void;
  onQueryProject: (params: Partial<IMyProjectParams>) => void;
  renderReactNode: (modal: React.ReactNode) => void;
}

const columns = {
  exampleAction: auditAction('案例', {
    Approving: ProjectStatus.ExampleApproving,
    Approved: ProjectStatus.ExampleApproved,
    Rejected: ProjectStatus.ExampleRejected,
    Removed: ProjectStatus.ExampleRemoved,
  }),
  templateAction: auditAction('模板', {
    Approving: ProjectStatus.Approving,
    Approved: ProjectStatus.Approved,
    Rejected: ProjectStatus.Rejected,
    Removed: ProjectStatus.Removed,
  }),
  coverAndPreview,
  industryColumn,
  projectAction,
  versionGroup,
  editorColumn,
  transition,
  userColumn,
  teamColumn,
  nameAndId,
  createdAt,
  updatedAt,
};

export const getProjectColumns = (
  setter: (_: typeof columns) => Array<false | '' | 0 | null | undefined | ColumnType<IProjectFromServer>>
): ColumnsType<IProjectFromServer> => {
  return setter(columns).filter(Boolean) as ColumnsType<IProjectFromServer>;
};
