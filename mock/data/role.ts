export type MockRole = {
  id: number
  roleName: string
  remark: string
  createTime: string
}

const initialRoleList: MockRole[] = [
  {
    id: 1,
    roleName: '超级管理员',
    remark: '拥有系统全部权限',
    createTime: '2026-06-01 10:00:00',
  },
  {
    id: 2,
    roleName: '系统管理员',
    remark: '负责系统日常管理',
    createTime: '2026-06-02 11:30:00',
  },
  {
    id: 3,
    roleName: '运营人员',
    remark: '负责商品和内容运营',
    createTime: '2026-06-03 15:20:00',
  },
]

type RoleState = {
  roleList: MockRole[]
}

const globalStore = globalThis as typeof globalThis & {
  __BACKSTAGE_ROLE_STATE__?: RoleState
}

globalStore.__BACKSTAGE_ROLE_STATE__ ||= {
  roleList: initialRoleList,
}

export const roleList = globalStore.__BACKSTAGE_ROLE_STATE__.roleList
