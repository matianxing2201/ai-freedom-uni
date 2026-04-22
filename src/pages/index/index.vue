<script setup lang="ts">
import { getIndexMaterial } from '@/api/index-material'
import HeroCarousel from '@/components/HeroCarousel.vue'

interface HomeCarouselItem {
  id?: number | string
  fileType: 0 | 1
  videoUrl: string
  poster: string
  title: string
  sub: string
}

defineOptions({ name: 'Home' })

definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
})

const FALLBACK_ITEMS: HomeCarouselItem[] = []

const carouselItems = ref<HomeCarouselItem[]>(FALLBACK_ITEMS)

function mapCarouselToItem(item: Awaited<ReturnType<typeof getIndexMaterial>>['carouselList'][number], index: number): HomeCarouselItem {
  return {
    id: item.id,
    fileType: item.fileType,
    videoUrl: item.fileType === 1 ? item.fileUrl : '',
    poster: item.fileType === 0 ? item.fileUrl : '/static/images/home/free_xfgz.png',
    title: FALLBACK_ITEMS[index]?.title ?? FALLBACK_ITEMS[index % FALLBACK_ITEMS.length]?.title ?? 'AI 自由家',
    sub: FALLBACK_ITEMS[index]?.sub ?? FALLBACK_ITEMS[index % FALLBACK_ITEMS.length]?.sub ?? '精选家居随心换',
  }
}

onLoad(async () => {
  console.log('首页已加载')
  // await checkAndLogin()

  try {
    const data = await getIndexMaterial()
    console.log(data)
    const sortedList = [...(data.carouselList ?? [])].sort((left, right) => left.sort - right.sort)
    if (sortedList.length > 0) {
      carouselItems.value = sortedList.map(mapCarouselToItem)
    }
  }
  catch {
    carouselItems.value = FALLBACK_ITEMS
  }
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
</script>

<template>
  <!-- #ifdef MP-WEIXIN -->
  <page-meta page-style="overflow: hidden;" />
  <!-- #endif -->

  <!-- 整页容器 -->
  <view class="home-shell flex flex-col overflow-hidden bg-[#f8f5f0]">
    <!-- ===== Hero ===== -->
    <view class="hero relative overflow-hidden">
      <!-- 轮播组件 -->
      <HeroCarousel
        :items="carouselItems"
        class="absolute left-0 top-0 h-full w-full"
        @try="onTryClick"
      />

      <!-- 设置按钮：叠加在轮播上方，left-top 玻璃态，hover 缩放 -->
      <view
        class="setting-btn"
        hover-class="setting-btn--press"
        :hover-stay-time="120"
        @click="onSettingClick"
      >
        <text class="text-[26rpx] text-[#4a3820] leading-none">⚙</text>
        <text class="text-[26rpx] text-[#2a1e0e] font-medium tracking-[1rpx]">设置</text>
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
.home-shell {
  height: calc(100vh - constant(safe-area-inset-bottom) - 50rpx);
  height: calc(100vh - env(safe-area-inset-bottom) - 50rpx);
  min-height: calc(100dvh - env(safe-area-inset-bottom) - 50rpx);
}

/* Hero 容器高度 */
.hero {
  flex: 0 0 67vh;
  background: #c4b09a;
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
