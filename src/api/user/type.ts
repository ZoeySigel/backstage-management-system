export interface LoginForm {
  username: string
  password: string
}

export interface ResponseData<T = null> {
  code: number
  data: T
  message: string
}

export interface LoginData {
  token: string
}

export interface UserInfoData {
  userId: number
  username: string
  avatar: string
  roles: string[]
  buttons: string[]
  routes: string[]
}

export type LoginResponseData = ResponseData<LoginData | null>
export type UserInfoResponseData = ResponseData<UserInfoData | null>
