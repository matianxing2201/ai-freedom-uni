<script lang="ts" setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  bindMail,
  bindMobile,
  loginByMobileCode,
  registerByMobileCode,
  sendBindMsgCode,
  sendLoginCode,
  toAuthLoginRes,
  toUserInfoRes,
  updateUserInfo,
} from '@/api/me'
import { useTokenStore, useUserStore } from '@/store'

type AuthMode = 'login' | 'register'

interface WorkCardItem {
  key: string
  title: string
  icon: string
  bg: string
  accent: string
  count: number
}

interface ServiceItem {
  key: 'settings' | 'feedback' | 'about'
  title: string
  icon: string
}

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '我的',
  },
})

const tokenStore = useTokenStore()
const userStore = useUserStore()

const defaultAvatar = '/static/images/default-avatar.png'

const authSheetVisible = ref(false)
const authMode = ref<AuthMode>('login')
const mobile = ref('')
const captcha = ref('')
const countdown = ref(0)
const isSendingCode = ref(false)
const isSubmitting = ref(false)

let countdownTimer: ReturnType<typeof setInterval> | null = null

const isLoggedIn = computed(() => true)
const profileName = computed(() => userStore.userInfo.nickname || userStore.userInfo.username || 'AI 自由家用户')
const profileSub = computed(() => userStore.userInfo.mobile || userStore.userInfo.account || '点击完善个人资料')
const profileAvatar = computed(() => userStore.userInfo.avatar || defaultAvatar)
const authSheetTitle = computed(() => authMode.value === 'login' ? '手机号登录' : '手机号注册')
const authPrimaryText = computed(() => authMode.value === 'login' ? '登录并进入个人中心' : '注册并进入个人中心')
const canSendCode = computed(() => /^1\d{10}$/.test(mobile.value) && countdown.value === 0 && !isSendingCode.value)

const workCards = computed<WorkCardItem[]>(() => {
  const taskCreateNums = Array.isArray(userStore.userInfo.taskCreateNums) ? userStore.userInfo.taskCreateNums : []
  const getCountByTaskType = (taskType: number, fallback: number) => {
    const matched = taskCreateNums.find((item: { taskType?: number, nums?: number }) => item.taskType === taskType)
    return matched?.nums ?? fallback
  }

  return [
    {
      key: 'empty',
      title: '空房设计',
      icon: '/static/images/mine/icon_kfsj.png',
      bg: 'linear-gradient(135deg, #dbf9ea 0%, #c5f3e5 100%)',
      accent: '#43b46c',
      count: getCountByTaskType(0, 1),
    },
    {
      key: 'existing',
      title: '现房改造',
      icon: '/static/images/mine/icon_xfgz.png',
      bg: 'linear-gradient(135deg, #d9efff 0%, #c3e3fb 100%)',
      accent: '#2f7ac5',
      count: getCountByTaskType(1, 0),
    },
    {
      key: 'soft',
      title: '软装换搭',
      icon: '/static/images/mine/icon_rzhd.png',
      bg: 'linear-gradient(135deg, #e9e7fb 0%, #dddaf8 100%)',
      accent: '#6e63c8',
      count: getCountByTaskType(2, 0),
    },
    {
      key: 'mine-soft',
      title: '我的软装',
      icon: '/static/images/mine/icon_wdrz.png',
      bg: 'linear-gradient(135deg, #fff0de 0%, #ffe7c8 100%)',
      accent: '#d88b2e',
      count: 0,
    },
  ]
})

const serviceItems: ServiceItem[] = [
  { key: 'settings', title: '账号设置', icon: '/static/images/mine/icon_set.png' },
  { key: 'feedback', title: '帮助反馈', icon: '/static/images/mine/icon_help.png' },
  { key: 'about', title: '关于我们', icon: '/static/images/mine/icon_us.png' },
]

function syncLoginState() {
  tokenStore.updateNowTime()
}

async function loadUserInfo() {
  syncLoginState()
  if (!tokenStore.hasLogin)
    return

  try {
    await userStore.fetchUserInfo()
  }
  catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

onShow(() => {
  loadUserInfo()
})

function startCountdown() {
  if (countdownTimer)
    clearInterval(countdownTimer)
  countdown.value = 60
  countdownTimer = setInterval(() => {
    if (countdown.value <= 1) {
      countdown.value = 0
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
      return
    }
    countdown.value -= 1
  }, 1000)
}

function openAuthSheet(mode: AuthMode) {
  authMode.value = mode
  authSheetVisible.value = true
}

function handleMobileInput(event: { detail: { value: string } }) {
  mobile.value = event.detail.value.replace(/\D/g, '').slice(0, 11)
}

function handleCaptchaInput(event: { detail: { value: string } }) {
  captcha.value = event.detail.value.replace(/\D/g, '').slice(0, 6)
}

function closeAuthSheet() {
  authSheetVisible.value = false
  captcha.value = ''
}

async function handleSendCode() {
  if (!canSendCode.value) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }

  isSendingCode.value = true
  try {
    await sendLoginCode({
      mobile: mobile.value,
      verifyType: 1,
      countryCode: '+86',
    })
    uni.showToast({ title: '验证码已发送', icon: 'none' })
    startCountdown()
  }
  catch (error) {
    console.error('发送验证码失败:', error)
  }
  finally {
    isSendingCode.value = false
  }
}

async function handleMobileAuthSubmit() {
  if (!/^1\d{10}$/.test(mobile.value)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }

  if (!captcha.value.trim()) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      countryCode: '+86',
      mobile: mobile.value,
      captcha: captcha.value,
      loginType: 1 as const,
    }
    const result = authMode.value === 'login'
      ? await loginByMobileCode(payload)
      : await registerByMobileCode(payload)

    tokenStore.setTokenInfo(toAuthLoginRes(result))
    userStore.setUserInfo(toUserInfoRes(result))
    tokenStore.updateNowTime()

    closeAuthSheet()
    uni.showToast({
      title: authMode.value === 'register' && result.newUserFlag ? '注册成功' : '登录成功',
      icon: 'success',
    })
  }
  catch (error) {
    console.error('手机号认证失败:', error)
  }
  finally {
    isSubmitting.value = false
  }
}

async function handleWeChatLogin() {
  try {
    await tokenStore.wxLogin()
    syncLoginState()
  }
  catch (error) {
    console.error('微信登录失败:', error)
  }
}

function handleBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
    return
  }
  uni.switchTab({ url: '/pages/index/index' })
}

function handleWorkCardClick(item: WorkCardItem) {
  uni.showToast({ title: `${item.title}功能待接入`, icon: 'none' })
}

function handleServiceClick(item: ServiceItem) {
  if (item.key === 'about') {
    uni.navigateTo({ url: '/pages/about/about' })
    return
  }
  uni.showToast({ title: `${item.title}待实现`, icon: 'none' })
}

function handleEditProfile() {
  uni.showToast({ title: '资料编辑流程待接入', icon: 'none' })
}

async function handleUpdateProfile(payload: { nickname?: string, avatar?: string }) {
  await updateUserInfo(payload)
}

async function handleBindMobile(payload: { mobile: string, captcha: string }) {
  await bindMobile({ countryCode: '+86', ...payload })
}

async function handleBindEmail(payload: { email: string, captcha: string }) {
  await bindMail(payload)
}

async function handleSendBindCode(payload: { mobile?: string, email?: string }) {
  if (payload.mobile) {
    await sendBindMsgCode({ verifyType: 1, mobile: payload.mobile, countryCode: '+86' })
    return
  }
  if (payload.email) {
    await sendBindMsgCode({ verifyType: 2, email: payload.email })
  }
}

defineExpose({
  handleUpdateProfile,
  handleBindMobile,
  handleBindEmail,
  handleSendBindCode,
})

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

<template>
  <view class="mine-page">
    <view class="mine-top-gradient">
      <view class="mine-header">
        <view class="mine-header__back" @click="handleBack">
          <text class="mine-header__icon">‹</text>
        </view>
        <text class="mine-header__title">个人中心</text>
        <view class="mine-header__back mine-header__back--ghost" />
      </view>

      <template v-if="isLoggedIn">
        <view class="profile-strip" @click="handleEditProfile">
          <image :src="profileAvatar" mode="aspectFill" class="profile-strip__avatar" />
          <view class="profile-strip__content">
            <text class="profile-strip__name">{{ profileName }}</text>
            <text class="profile-strip__sub">{{ profileSub }}</text>
          </view>
          <view class="profile-strip__edit">
            ✎
          </view>
          <text class="profile-strip__arrow">›</text>
        </view>
      </template>

      <template v-else>
        <view class="welcome-card">
          <view class="welcome-card__avatar-wrap">
            <image src="/static/images/default-avatar.png" mode="aspectFill" class="welcome-card__avatar" />
          </view>
          <text class="welcome-card__title">登录 AI 自由家</text>
          <text class="welcome-card__sub">同步你的作品、服务与账号信息</text>
          <view class="welcome-card__actions">
            <view class="welcome-card__btn welcome-card__btn--primary" @click="openAuthSheet('login')">
              <text class="welcome-card__btn-text">手机号登录</text>
            </view>
            <view class="welcome-card__btn welcome-card__btn--wechat" @click="handleWeChatLogin">
              <text class="welcome-card__btn-text welcome-card__btn-text--wechat">微信登录</text>
            </view>
          </view>
          <view class="welcome-card__register" @click="openAuthSheet('register')">
            <text class="welcome-card__register-text">还没有账号？立即注册</text>
          </view>
        </view>
      </template>
    </view>

    <view class="mine-body">
      <template v-if="isLoggedIn">
        <view class="panel panel--works">
          <text class="panel__title">我的作品</text>
          <view class="works-grid">
            <view
              v-for="item in workCards"
              :key="item.key"
              class="work-card"
              :style="{ background: item.bg }"
              @click="handleWorkCardClick(item)"
            >
              <text class="work-card__title" :style="{ color: item.accent }">{{ item.title }}</text>
              <text class="work-card__count">{{ item.count }}</text>
              <view class="work-card__icon-glow" :style="{ background: `${item.accent}14` }" />
              <image :src="item.icon" mode="aspectFit" class="work-card__icon" />
            </view>
          </view>
        </view>

        <view class="section-title">
          我的服务
        </view>
        <view class="panel panel--services">
          <view
            v-for="item in serviceItems"
            :key="item.key"
            class="service-row"
            @click="handleServiceClick(item)"
          >
            <view class="service-row__left">
              <image :src="item.icon" mode="aspectFit" class="service-row__icon" />
              <text class="service-row__text">{{ item.title }}</text>
            </view>
            <image src="/static/images/mine/right_raw.png" mode="aspectFit" class="service-row__arrow" />
          </view>
        </view>
      </template>

      <template v-else>
        <view class="panel panel--guest-services">
          <text class="panel__title">登录后可体验</text>
          <view class="guest-benefits">
            <view class="guest-benefit">
              <image src="/static/images/mine/icon_kfsj.png" mode="aspectFit" class="guest-benefit__icon" />
              <text class="guest-benefit__title">同步作品记录</text>
              <text class="guest-benefit__sub">查看你的空房、现房、软装作品</text>
            </view>
            <view class="guest-benefit">
              <image src="/static/images/mine/icon_set.png" mode="aspectFit" class="guest-benefit__icon" />
              <text class="guest-benefit__title">管理账号信息</text>
              <text class="guest-benefit__sub">绑定手机号邮箱，完善资料</text>
            </view>
            <view class="guest-benefit">
              <image src="/static/images/mine/icon_help.png" mode="aspectFit" class="guest-benefit__icon" />
              <text class="guest-benefit__title">获取专属服务</text>
              <text class="guest-benefit__sub">快速进入帮助反馈与关于我们</text>
            </view>
          </view>
        </view>
      </template>
    </view>

    <view v-if="authSheetVisible" class="auth-mask" @click="closeAuthSheet" />
    <view v-if="authSheetVisible" class="auth-sheet">
      <view class="auth-sheet__grabber" />
      <view class="auth-sheet__header">
        <text class="auth-sheet__title">{{ authSheetTitle }}</text>
        <text class="auth-sheet__close" @click="closeAuthSheet">×</text>
      </view>
      <view class="auth-sheet__form">
        <view class="field">
          <text class="field__label">手机号</text>
          <view class="field__input-wrap">
            <text class="field__prefix">+86</text>
            <input :value="mobile" type="text" :maxlength="11" class="field__input" placeholder="请输入手机号" @input="handleMobileInput">
          </view>
        </view>
        <view class="field">
          <text class="field__label">验证码</text>
          <view class="field__input-wrap field__input-wrap--captcha">
            <input :value="captcha" type="text" :maxlength="6" class="field__input" placeholder="请输入验证码" @input="handleCaptchaInput">
            <view class="field__code-btn" :class="{ 'field__code-btn--disabled': !canSendCode }" @click="handleSendCode">
              <text class="field__code-text">{{ countdown > 0 ? `${countdown}s` : '发送验证码' }}</text>
            </view>
          </view>
        </view>
        <view class="auth-sheet__submit" @click="handleMobileAuthSubmit">
          <text class="auth-sheet__submit-text">{{ isSubmitting ? '提交中...' : authPrimaryText }}</text>
        </view>
        <view class="auth-sheet__switch" @click="openAuthSheet(authMode === 'login' ? 'register' : 'login')">
          <text class="auth-sheet__switch-text">
            {{ authMode === 'login' ? '还没有账号？切换到注册' : '已有账号？切换到登录' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
page {
  background: #f4f5f7;
}
</style>

<style lang="scss" scoped>
.mine-page {
  min-height: 100vh;
  background: #f4f5f7;
  padding-bottom: calc(env(safe-area-inset-bottom) + 120rpx);
}

.mine-top-gradient {
  position: relative;
  overflow: hidden;
  padding: calc(env(safe-area-inset-top) + 26rpx) 30rpx 42rpx;
  background:
    radial-gradient(circle at 18% 22%, rgba(180, 244, 232, 0.95) 0%, rgba(180, 244, 232, 0) 28%),
    radial-gradient(circle at 78% 8%, rgba(225, 255, 170, 0.88) 0%, rgba(225, 255, 170, 0) 30%),
    linear-gradient(135deg, #d6fbf3 0%, #dff6cf 52%, #d1f5dc 100%);
  border-bottom-left-radius: 44rpx;
  border-bottom-right-radius: 44rpx;
}

.mine-header {
  display: grid;
  grid-template-columns: 72rpx 1fr 72rpx;
  align-items: center;
  margin-bottom: 34rpx;
}

.mine-header__back {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 72rpx;
}

.mine-header__back--ghost {
  opacity: 0;
}

.mine-header__icon {
  color: #18211f;
  font-size: 56rpx;
  line-height: 1;
}

.mine-header__title {
  text-align: center;
  color: #18211f;
  font-size: 52rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.profile-strip {
  display: grid;
  grid-template-columns: 144rpx 1fr 56rpx 36rpx;
  align-items: center;
  column-gap: 18rpx;
  padding: 8rpx 0 18rpx;
}

.profile-strip__avatar {
  width: 128rpx;
  height: 128rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.95);
  border-radius: 999rpx;
  background: #b6b4b6;
}

.profile-strip__content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.profile-strip__name {
  color: #212525;
  font-size: 38rpx;
  font-weight: 600;
}

.profile-strip__sub {
  color: rgba(33, 37, 37, 0.62);
  font-size: 24rpx;
}

.profile-strip__edit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  color: #5b6663;
  font-size: 26rpx;
}

.profile-strip__arrow {
  justify-self: end;
  color: #1e2c29;
  font-size: 54rpx;
  line-height: 1;
}

.welcome-card {
  margin-top: 10rpx;
  padding: 34rpx 28rpx 22rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 2rpx solid rgba(255, 255, 255, 0.48);
  border-radius: 34rpx;
  backdrop-filter: blur(10rpx);
  box-shadow: 0 18rpx 44rpx rgba(114, 154, 131, 0.12);
}

.welcome-card__avatar-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 18rpx;
}

.welcome-card__avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 999rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.9);
}

.welcome-card__title {
  display: block;
  text-align: center;
  color: #1e2522;
  font-size: 40rpx;
  font-weight: 600;
}

.welcome-card__sub {
  display: block;
  margin-top: 10rpx;
  text-align: center;
  color: rgba(30, 37, 34, 0.6);
  font-size: 24rpx;
}

.welcome-card__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-top: 28rpx;
}

.welcome-card__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  border-radius: 999rpx;
}

.welcome-card__btn--primary {
  background: linear-gradient(135deg, #202725 0%, #3a4842 100%);
}

.welcome-card__btn--wechat {
  background: rgba(255, 255, 255, 0.92);
  border: 2rpx solid rgba(104, 165, 113, 0.16);
}

.welcome-card__btn-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}

.welcome-card__btn-text--wechat {
  color: #2f8151;
}

.welcome-card__register {
  display: flex;
  justify-content: center;
  margin-top: 22rpx;
}

.welcome-card__register-text {
  color: #275f47;
  font-size: 24rpx;
}

.mine-body {
  margin-top: -10rpx;
  padding: 0 30rpx 40rpx;
}

.panel {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 34rpx;
  box-shadow: 0 20rpx 40rpx rgba(36, 53, 73, 0.06);
}

.panel--works {
  margin-top: -18rpx;
  padding: 30rpx;
}

.panel__title {
  color: #232629;
  font-size: 54rpx;
  font-weight: 700;
}

.works-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-top: 28rpx;
}

.work-card {
  position: relative;
  overflow: hidden;
  min-height: 176rpx;
  padding: 24rpx;
  border-radius: 24rpx;
}

.work-card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
}

.work-card__count {
  display: block;
  margin-top: 34rpx;
  color: #2d3236;
  font-size: 60rpx;
  font-weight: 700;
}

.work-card__icon-glow {
  position: absolute;
  right: 18rpx;
  bottom: 16rpx;
  width: 120rpx;
  height: 120rpx;
  border-radius: 28rpx;
  transform: rotate(42deg);
}

.work-card__icon {
  position: absolute;
  right: 20rpx;
  bottom: 18rpx;
  width: 72rpx;
  height: 72rpx;
}

.section-title {
  margin: 46rpx 0 26rpx;
  color: #212529;
  font-size: 54rpx;
  font-weight: 700;
}

.panel--services {
  padding: 8rpx 0;
}

.service-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 28rpx;
}

.service-row + .service-row {
  border-top: 1rpx solid rgba(20, 28, 35, 0.05);
}

.service-row__left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.service-row__icon {
  width: 42rpx;
  height: 42rpx;
}

.service-row__text {
  color: #2b3136;
  font-size: 32rpx;
}

.service-row__arrow {
  width: 22rpx;
  height: 30rpx;
}

.panel--guest-services {
  margin-top: 26rpx;
  padding: 28rpx;
}

.guest-benefits {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  margin-top: 22rpx;
}

.guest-benefit {
  display: grid;
  grid-template-columns: 72rpx 1fr;
  grid-template-rows: auto auto;
  column-gap: 20rpx;
  row-gap: 6rpx;
  padding: 18rpx 10rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #f6faf7 0%, #edf4ef 100%);
}

.guest-benefit__icon {
  grid-row: 1 / span 2;
  width: 56rpx;
  height: 56rpx;
  align-self: center;
}

.guest-benefit__title {
  color: #22302b;
  font-size: 28rpx;
  font-weight: 600;
}

.guest-benefit__sub {
  color: rgba(34, 48, 43, 0.58);
  font-size: 22rpx;
}

.auth-mask {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(14, 22, 18, 0.34);
}

.auth-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 31;
  padding: 18rpx 28rpx calc(env(safe-area-inset-bottom) + 28rpx);
  background: #fff;
  border-top-left-radius: 34rpx;
  border-top-right-radius: 34rpx;
  box-shadow: 0 -12rpx 42rpx rgba(0, 0, 0, 0.08);
}

.auth-sheet__grabber {
  width: 84rpx;
  height: 8rpx;
  margin: 0 auto 18rpx;
  border-radius: 999rpx;
  background: rgba(26, 33, 30, 0.12);
}

.auth-sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.auth-sheet__title {
  color: #1d2321;
  font-size: 36rpx;
  font-weight: 700;
}

.auth-sheet__close {
  color: rgba(29, 35, 33, 0.5);
  font-size: 48rpx;
  line-height: 1;
}

.auth-sheet__form {
  margin-top: 18rpx;
}

.field {
  margin-top: 20rpx;
}

.field__label {
  display: block;
  margin-bottom: 12rpx;
  color: #28302d;
  font-size: 24rpx;
}

.field__input-wrap {
  display: flex;
  align-items: center;
  gap: 18rpx;
  min-height: 92rpx;
  padding: 0 24rpx;
  border-radius: 24rpx;
  background: #f4f6f5;
}

.field__input-wrap--captcha {
  justify-content: space-between;
}

.field__prefix {
  color: #2a3230;
  font-size: 28rpx;
  font-weight: 600;
}

.field__input {
  flex: 1;
  height: 92rpx;
  color: #222725;
  font-size: 28rpx;
}

.field__code-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 164rpx;
  height: 64rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: #2f4b3c;
}

.field__code-btn--disabled {
  background: #c6d0ca;
}

.field__code-text {
  color: #fff;
  font-size: 24rpx;
}

.auth-sheet__submit {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 96rpx;
  margin-top: 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #212725 0%, #3a4540 100%);
}

.auth-sheet__submit-text {
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}

.auth-sheet__switch {
  display: flex;
  justify-content: center;
  margin-top: 18rpx;
}

.auth-sheet__switch-text {
  color: #2f6b52;
  font-size: 24rpx;
}
</style>
