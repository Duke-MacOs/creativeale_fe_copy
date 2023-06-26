import { IUserInfo } from '@shared/types';

let SHIFT = 0;

export const MatchStatus = {
  // 项目分类
  TypeProject: 1 << SHIFT++,
  TypeTemplate: 1 << SHIFT++,
  TypeExample: 1 << SHIFT++,

  // 管理分组
  MenuMy: 1 << SHIFT++,
  MenuAdmin: 1 << SHIFT++,
  MenuSuper: 1 << SHIFT++,
  MenuPub: 1 << SHIFT++,

  // 用户角色
  RoleMember: 1 << SHIFT++,
  RoleManager: 1 << SHIFT++,
  RoleSuperMember: 1 << SHIFT++,
  RoleSuperManager: 1 << SHIFT++,
  // 团队类型
  TeamUser: 1 << SHIFT++,
  TeamMany: 1 << SHIFT++,
  TeamSuper: 1 << SHIFT++,
};

export const matchFor = ({ teamRoles, teamId, teams }: IUserInfo) => {
  let match = 0;
  if (teamRoles & 0b01) {
    match += MatchStatus.RoleMember;
  }
  if (teamRoles & 0b10) {
    match += MatchStatus.RoleManager;
  }
  if (teamRoles & (0b01 << 8)) {
    match += MatchStatus.RoleSuperMember;
  }
  if (teamRoles & (0b10 << 8)) {
    match += MatchStatus.RoleSuperManager;
  }
  const { type } = teams.find(({ id }) => id === teamId)!;
  switch (type) {
    case 0:
      match += MatchStatus.TeamUser;
      break;
    case 1:
      match += MatchStatus.TeamSuper;
      break;
    default:
      match += MatchStatus.TeamMany;
      break;
  }
  return match;
};

export const matcher =
  (...flags: Array<number | ((_: typeof MatchStatus) => number)>) =>
  (match: number) =>
    flags.every(flag => (typeof flag === 'number' ? flag : flag(MatchStatus)) & match);
