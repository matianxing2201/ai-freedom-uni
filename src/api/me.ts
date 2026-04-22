import type { IAuthLoginRes, IUserInfoRes } from './types/login'
import { http } from '@/http/http'

export interface TaskCreateBean {
  taskType: number
  nums: number
}

export interface MeLoginResponse {
  accessToken: string
  avatar: string
  nickname: string
  profession: string
  uid: string
  account: string
  countryCode: string
  mobile: string
  email: string
  age: number
  currentRoleId: number
  thirdLoginVO: boolean
  expiresIn: number
  newUserFlag: boolean
  sex: number
  isNotice: number
  isPrivacy: number
  hasPwd: number
  validEnd: string
  tokenInfoVO?: Record<string, any>
  taskCreateNums?: TaskCreateBean[]
}

export interface MobileCodeLoginRequest {
  countryCode: string
  mobile: string
  captcha: string
  loginType: 1
}

export interface SendLoginCodeRequest {
  mobile: string
  verifyType: 1
  countryCode: string
}

export interface UpdateMeUserInfoRequest {
  avatar?: string
  nickname?: string
  age?: number
  profession?: string
  sex?: number
}

export interface BindMobileRequest {
  countryCode: string
  mobile: string
  captcha: string
}

export interface BindEmailRequest {
  email: string
  captcha: string
}

export type SendBindCodeRequest = {
  verifyType: 1
  mobile: string
  countryCode: string
} | {
  verifyType: 2
  email: string
}

export function loginByMobileCode(data: MobileCodeLoginRequest) {
  return http.post<MeLoginResponse>('/app/login/loginIn', data)
}

// 当前后端文档未提供独立注册接口，先复用验证码登录流作为注册承接。
export function registerByMobileCode(data: MobileCodeLoginRequest) {
  return loginByMobileCode(data)
}

export function sendLoginCode(data: SendLoginCodeRequest) {
  return http.post<void>('/app/login/sendLoginCode', data)
}

export function queryUserInfo() {
  return http.get<MeLoginResponse>('/app/base/userInfo/query')
}

export function updateUserInfo(data: UpdateMeUserInfoRequest) {
  return http.post<void>('/app/base/userInfo/update', data)
}

export function bindMobile(data: BindMobileRequest) {
  return http.post<void>('/app/base/bindMobile', data)
}

export function bindMail(data: BindEmailRequest) {
  return http.post<void>('/app/base/bindMail', data)
}

export function sendBindMsgCode(data: SendBindCodeRequest) {
  return http.post<void>('/app/base/sendBindMsgCode', data)
}

export function toAuthLoginRes(data: MeLoginResponse): IAuthLoginRes {
  return {
    token: data.accessToken,
    expiresIn: data.expiresIn,
  }
}

export function toUserInfoRes(data: MeLoginResponse): IUserInfoRes {
  return {
    userId: Number(data.uid) || -1,
    username: data.account || data.mobile || data.email || data.uid,
    nickname: data.nickname || data.account || 'AI 自由家用户',
    avatar: data.avatar,
    role: String(data.currentRoleId || ''),
    uid: data.uid,
    account: data.account,
    countryCode: data.countryCode,
    mobile: data.mobile,
    email: data.email,
    profession: data.profession,
    age: data.age,
    currentRoleId: data.currentRoleId,
    thirdLoginVO: data.thirdLoginVO,
    newUserFlag: data.newUserFlag,
    sex: data.sex,
    isNotice: data.isNotice,
    isPrivacy: data.isPrivacy,
    hasPwd: data.hasPwd,
    validEnd: data.validEnd,
    taskCreateNums: data.taskCreateNums || [],
  }
}
