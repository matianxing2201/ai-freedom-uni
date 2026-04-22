<script setup lang="ts">
defineOptions({ name: 'Home' })

definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
})

const heroPoster = '/static/images/home/free_xfgz.png'

const heroVideoMeta = [
  { title: '空房设计', sub: '一键生成效果图' },
  { title: '现房改造', sub: '定制我的百变风格' },
  { title: '软装换搭', sub: '精选家居随心换' },
]

const heroTextVisible = ref(true)

const heroVideoPaths = [
  '2026/2/b50d0444-jimeng-2026-02-05-6267-请基于我提供的首帧（毛坯客厅）和尾帧（装修效果图），生成一段时长5秒、帧率24f....mp4',
  '2026/2/d42a4b35-jimeng-2026-01-14-5394-请基于我提供的首帧（毛坯客厅）和尾帧（装修效果图），生成一段时长5秒、帧率24f....mp4',
  '2026/2/094647e9-jimeng-2026-02-06-2026-制作一个5秒的静镜头动画，展示北欧客厅从首帧到尾帧的软装变换过程。  关键指令：....mp4',
]

const heroVideoIndex = ref(0)
const heroVideoReady = ref(false)
const heroVideoErrorCount = ref(0)

const heroTitle = computed(() => heroVideoMeta[heroVideoIndex.value]?.title ?? '')
const heroSub = computed(() => heroVideoMeta[heroVideoIndex.value]?.sub ?? '')

const heroVideoUrl = ''

onLoad(async () => {
  console.log('首页已加载')
  // await checkAndLogin()
})

onUnmounted(() => {
  heroVideoReady.value = false
  heroVideoErrorCount.value = 0
})

function onTryClick() {
  // uni.showToast({ title: '功能待接入', icon: 'none' })
}

function onSettingClick() {
  uni.showToast({ title: '设置功能待接入', icon: 'none' })
}

function onCardClick(name: string) {
  uni.showToast({ title: `${name}功能待接入`, icon: 'none' })
}

function onHeroVideoLoaded() {
  heroVideoReady.value = true
  heroVideoErrorCount.value = 0
}

function onHeroVideoEnded() {
  heroVideoReady.value = false
  heroTextVisible.value = false
  setTimeout(() => {
    heroVideoIndex.value = (heroVideoIndex.value + 1) % heroVideoPaths.length
    heroTextVisible.value = true
  }, 280)
}

function onHeroVideoError() {
  heroVideoReady.value = false
  heroVideoErrorCount.value += 1
  if (heroVideoErrorCount.value >= heroVideoPaths.length) {
    return
  }
  heroVideoIndex.value = (heroVideoIndex.value + 1) % heroVideoPaths.length
}
</script>

<template>
  <!-- #ifdef MP-WEIXIN -->
  <page-meta page-style="overflow: hidden;" />
  <!-- #endif -->

  <!-- 整页容器 -->
  <view class="h-screen flex flex-col overflow-hidden bg-[#f8f5f0]">
    <!-- ===== Hero ===== -->
    <view class="hero relative overflow-hidden">
      <image :src="heroPoster" mode="aspectFill" class="hero-poster absolute left-0 top-0 h-full w-full" :class="{ 'hero-poster--hidden': heroVideoReady }" />

      <video
        :key="heroVideoUrl"
        :src="heroVideoUrl"
        class="hero-video absolute left-0 top-0 h-full w-full"
        :class="{ 'hero-video--ready': heroVideoReady }"
        muted
        autoplay
        playsinline
        webkit-playsinline
        :show-center-play-btn="false"
        :controls="false"
        object-fit="cover"
        @loadedmetadata="onHeroVideoLoaded"
        @ended="onHeroVideoEnded"
        @error="onHeroVideoError"
      />

      <!-- 渐变遮罩 -->
      <view class="hero-mask absolute left-0 top-0 h-full w-full" />
      <view class="hero-bottom-fade absolute bottom-0 left-0 right-0 z-[4]" />
      <view class="hero-bottom-halo absolute bottom-[18rpx] left-1/2 z-[4] h-[420rpx] w-[420rpx] -translate-x-1/2" />

      <!-- 设置按钮：left-top 玻璃态，hover 缩放 -->
      <view
        class="setting-btn"
        hover-class="setting-btn--press"
        :hover-stay-time="120"
        @click="onSettingClick"
      >
        <text class="text-[26rpx] text-[#4a3820] leading-none">⚙</text>
        <text class="text-[26rpx] text-[#2a1e0e] font-medium tracking-[1rpx]">设置</text>
      </view>

      <!-- 主标题区 -->
      <view
        class="hero-text-wrap absolute bottom-0 left-0 right-0 z-[5] flex flex-col items-center px-[48rpx] pb-[148rpx]"
        :class="{ 'hero-text--hidden': !heroTextVisible }"
      >
        <text class="hero-title text-center text-[76rpx] font-extrabold leading-[1.1] tracking-[8rpx]">
          {{ heroTitle }}
        </text>
        <text class="hero-sub mt-[16rpx] text-center text-[30rpx] tracking-[2rpx]">
          {{ heroSub }}
        </text>
        <view
          class="hero-cta"
          hover-class="hero-cta--press"
          :hover-stay-time="120"
          @click="onTryClick"
        >
          <text class="text-[30rpx]">✨</text>
          <text class="text-[34rpx] text-white font-semibold tracking-[2rpx]">去试试</text>
        </view>
      </view>
    </view>

    <!-- ===== 功能卡片 ===== -->
    <view class="cards relative z-[6] mt-[-6rpx] min-h-0 flex flex-1 gap-[14rpx] bg-[#f8f5f0] px-[20rpx] pt-[8rpx]">
      <view class="cards-surface pointer-events-none absolute left-0 right-0 top-0" />

      <!-- 左侧大卡：空房设计 -->
      <view
        class="card relative z-[1] flex-[1.05] overflow-hidden rounded-[22rpx] bg-[#e6dfd4]"
        hover-class="card--press"
        :hover-stay-time="120"
        @click="onCardClick('空房设计')"
      >
        <image src="/static/images/home/free_kfsj.png" mode="aspectFill" class="absolute left-0 top-0 h-full w-full" />
        <view class="card-overlay card-overlay--roomy absolute left-0 top-0 h-full w-full flex flex-col justify-between px-[20rpx]">
          <view class="flex flex-col gap-[6rpx]">
            <text class="card-title text-[34rpx] font-bold leading-[1.2]">空房设计</text>
            <text class="card-sub mt-2 text-[22rpx] leading-[1.45]">一键生成效果图</text>
          </view>
          <view class="card-go h-[46rpx] flex items-center self-start rounded-full px-[18rpx]">
            <text class="text-[22rpx] text-[#1c1208] font-bold tracking-[1rpx]">GO</text>
            <text class="text-[22rpx] text-[#5a3e1e]"> →</text>
          </view>
        </view>
      </view>

      <!-- 右侧双卡列 -->
      <view class="relative z-[1] flex flex-1 flex-col gap-[14rpx]">
        <!-- 现房改造 -->
        <view
          class="card relative min-h-0 flex-1 overflow-hidden rounded-[22rpx] bg-[#e6dfd4]"
          hover-class="card--press"
          :hover-stay-time="120"
          @click="onCardClick('现房改造')"
        >
          <image src="/static/images/home/free_xfgz.png" mode="aspectFill" class="absolute left-0 top-0 h-full w-full" />
          <view class="card-overlay card-overlay--light card-overlay--compact absolute left-0 top-0 h-full w-full flex flex-col justify-between px-[20rpx]">
            <view class="flex flex-col gap-[6rpx]">
              <text class="card-title card-title--dark text-[34rpx] font-bold leading-[1.2]">现房改造</text>
              <text class="card-sub card-sub--dark text-[22rpx] leading-[1.45]">定制我的百变风格</text>
            </view>
            <view class="card-go h-[46rpx] flex items-center self-start rounded-full px-[18rpx]">
              <text class="text-[22rpx] text-[#1c1208] font-bold tracking-[1rpx]">GO</text>
              <text class="text-[22rpx] text-[#5a3e1e]"> →</text>
            </view>
          </view>
        </view>

        <!-- 软装换搭 -->
        <view
          class="card relative min-h-0 flex-1 overflow-hidden rounded-[22rpx] bg-[#e6dfd4]"
          hover-class="card--press"
          :hover-stay-time="120"
          @click="onCardClick('软装换搭')"
        >
          <image src="/static/images/home/free_rzhd.png" mode="aspectFill" class="absolute left-0 top-0 h-full w-full" />
          <view class="card-overlay card-overlay--light card-overlay--compact absolute left-0 top-0 h-full w-full flex flex-col justify-between px-[20rpx]">
            <view class="flex flex-col gap-[6rpx]">
              <text class="card-title card-title--dark text-[34rpx] font-bold leading-[1.2]">软装换搭</text>
              <text class="card-sub card-sub--dark text-[22rpx] leading-[1.45]">精选家具随心换</text>
            </view>
            <view class="card-go h-[46rpx] flex items-center self-start rounded-full px-[18rpx]">
              <text class="text-[22rpx] text-[#1c1208] font-bold tracking-[1rpx]">GO</text>
              <text class="text-[22rpx] text-[#5a3e1e]"> →</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
page {
  overflow: hidden;
  background: #f8f5f0;
}
</style>

<style lang="scss" scoped>
/* Hero 高度（flex shorthand 无法用工具类精确表达） */
.hero {
  flex: 0 0 70vh;
  background: #c4b09a;
}

.hero-video {
  opacity: 0;
  transition: opacity 0.35s ease;
}

.hero-video-preload {
  position: absolute;
  top: -9999rpx;
  left: -9999rpx;
  width: 1rpx;
  height: 1rpx;
  opacity: 0;
  pointer-events: none;
}

.hero-video--ready {
  opacity: 1;
}

.hero-poster {
  transition: opacity 0.4s ease;
}

.hero-poster--hidden {
  opacity: 0;
}

/* 多段渐变遮罩 */
.hero-mask {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%);
}

.hero-bottom-fade {
  height: 210rpx;
  background: linear-gradient(
    to bottom,
    rgba(248, 245, 240, 0) 0%,
    rgba(248, 245, 240, 0.08) 26%,
    rgba(248, 245, 240, 0.34) 54%,
    rgba(248, 245, 240, 0.82) 84%,
    #f8f5f0 100%
  );
}

.hero-bottom-halo {
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.92) 0%,
    rgba(248, 245, 240, 0.58) 42%,
    rgba(248, 245, 240, 0) 100%
  );
  filter: blur(12rpx);
}

/* 设置按钮：玻璃态 + 悬停 */
.setting-btn {
  position: absolute;
  top: 80rpx;
  left: 24rpx;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 20rpx;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8rpx);
  border-radius: 28rpx;
  box-shadow: 0 4rpx 14rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.setting-btn--press {
  transform: scale(0.96);
}

/* 主标题区切换过渡 */
.hero-text-wrap {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.hero-text--hidden {
  opacity: 0;
  transform: translateY(12rpx);
}

/* 主标题样式 */
.hero-title {
  color: #1a1208;
  text-shadow: 0 2rpx 8rpx rgba(255, 255, 255, 0.6);
}

.hero-sub {
  color: rgba(30, 20, 10, 0.82);
  text-shadow: 0 1rpx 4rpx rgba(255, 255, 255, 0.5);
}

/* CTA 按钮 */
.hero-cta {
  margin-top: 48rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 52rpx;
  background: linear-gradient(135deg, #d4a574 0%, #b88a5e 100%);
  border-radius: 44rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.25);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.hero-cta--press {
  transform: scale(0.96);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

/* 卡片区域 */
.cards {
  overflow: visible;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.cards-surface {
  top: -56rpx;
  height: 64rpx;
  background: linear-gradient(
    to bottom,
    rgba(248, 245, 240, 0) 0%,
    rgba(248, 245, 240, 0.22) 40%,
    rgba(248, 245, 240, 0.72) 72%,
    #f8f5f0 100%
  );
}

/* 卡片通用样式 */
.card {
  position: relative;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.card--press {
  transform: scale(0.98);
}

/* 卡片遮罩 */
.card-overlay {
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.85) 0%,
    rgba(255, 255, 255, 0.4) 60%,
    rgba(255, 255, 255, 0) 100%
  );
}

.card-overlay--roomy {
  padding-top: 22rpx;
  padding-bottom: 36rpx;
}

.card-overlay--compact {
  padding-top: 20rpx;
  padding-bottom: 30rpx;
}

.card-overlay--light {
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0.1) 100%
  );
}

/* 卡片文字 */
.card-title {
  color: #2a1e0e;
  text-shadow: 0 2rpx 4rpx rgba(255, 255, 255, 0.8);
}

.card-title--dark {
  color: #1c1208;
}

.card-sub {
  color: #5a4a3a;
}

.card-sub--dark {
  color: #4a3a2a;
}

/* GO 按钮 */
.card-go {
  margin-top: auto;
  transform: translateY(-38rpx);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4rpx);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}
</style>
