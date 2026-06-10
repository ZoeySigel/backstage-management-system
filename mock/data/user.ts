import Mock from 'mockjs'

export type MockUser = {
  userId: number
  username: string
  password: string
  token: string
  roleId: number
  avatar: string
  name: string
  status: boolean
  createTime: string
}

const initialUserList: MockUser[] = [
  {
    userId: 1,
    username: 'admin',
    password: '111111',
    token: 'Admin Token',
    roleId: 1,
    avatar: Mock.Random.image('100x100', '#409eff', '#ffffff', 'Admin'),
    name: '管理员',
    status: true,
    createTime: '2026-06-01 10:30:00',
  },
  {
    userId: 2,
    username: 'system',
    password: '111111',
    token: 'System Token',
    roleId: 2,
    avatar: Mock.Random.image('100x100', '#67c23a', '#ffffff', 'User'),
    name: '系统用户',
    status: true,
    createTime: '2026-06-02 14:20:00',
  },
  {
    userId: 3,
    username: 'editor',
    password: '111111',
    token: 'Editor Token',
    roleId: 3,
    avatar: Mock.Random.image('100x100', '#e6a23c', '#ffffff', 'Editor'),
    name: '运营编辑',
    status: false,
    createTime: '2026-06-03 09:15:00',
  },
]

type UserState = {
  userList: MockUser[]
}

const globalStore = globalThis as typeof globalThis & {
  __BACKSTAGE_USER_STATE__?: UserState
}

globalStore.__BACKSTAGE_USER_STATE__ ||= {
  userList: initialUserList,
}

export const userList = globalStore.__BACKSTAGE_USER_STATE__.userList
