import request from '@/utils/request'
import type { LoginForm, LoginResponseData, ResponseData, UserInfoResponseData } from './type'

const API = {
  LOGIN_URL: '/user/login',
  USERINFO_URL: '/user/info',
  LOGOUT_URL: '/user/logout',
} as const

export const reqLogin = (data: LoginForm) =>
  request.post<LoginResponseData, LoginResponseData, LoginForm>(API.LOGIN_URL, data)

export const reqUserInfo = () =>
  request.get<UserInfoResponseData, UserInfoResponseData>(API.USERINFO_URL)

export const reqLogout = () => request.post<ResponseData, ResponseData>(API.LOGOUT_URL)
