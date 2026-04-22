<script setup lang="ts">
import { getCurrentInstance, nextTick, watch } from 'vue'

export interface CarouselItem {
  id?: number | string
  fileType: 0 | 1
  videoUrl: string
  poster: string
  title: string
  sub: string
}

const props = defineProps<{
  items: CarouselItem[]
}>()

const emit = defineEmits<{
  try: [index: number]
}>()

// 用于 uni.createVideoContext 的组件实例（微信小程序需要）
const instance = getCurrentInstance()

// swiper 当前位置（驱动轮播滑动）
const swiperCurrent = ref(0)
// 文字显示的内容索引（延迟更新，配合淡出动画）
const displayIndex = ref(0)
// 文字区域可见性（控制淡出/淡入动画）
const textVisible = ref(true)
// 每个轮播项的视频就绪状态
const videoReady = reactive<Record<number, boolean>>({})
// 每个轮播项的视频失败状态
const videoError = reactive<Record<number, boolean>>({})

let textTimer: ReturnType<typeof setTimeout> | null = null

const currentTitle = computed(() => props.items[displayIndex.value]?.title ?? '')
const currentSub = computed(() => props.items[displayIndex.value]?.sub ?? '')
const nextIndex = computed(() => props.items.length > 0 ? (swiperCurrent.value + 1) % props.items.length : 0)
const preloadItem = computed(() => props.items[nextIndex.value])

watch(
  () => props.items,
  () => {
    swiperCurrent.value = 0
    displayIndex.value = 0
    textVisible.value = true
  },
)

/** 暂停非当前项的视频（避免在后台继续播放） */
function pauseOtherVideos(currentIndex: number) {
  props.items.forEach((_, i) => {
    if (i !== currentIndex) {
      try {
        uni.createVideoContext(`hero-video-${i}`, instance?.proxy as any)?.pause()
      }
      catch {
        // ignore: 视频 context 可能尚未初始化
      }
    }
  })
}

/** 带淡出/淡入动画地切换到指定索引的文字 */
function animateTextTo(newIndex: number) {
  textVisible.value = false
  if (textTimer)
    clearTimeout(textTimer)
  textTimer = setTimeout(() => {
    displayIndex.value = newIndex
    textVisible.value = true
    textTimer = null
  }, 280)
}

/** 用户手动滑动 或 programmatic change 均触发此回调 */
function onSwiperChange(e: { detail: { current: number } }) {
  const newIndex = e.detail.current
  swiperCurrent.value = newIndex
  pauseOtherVideos(newIndex)
  animateTextTo(newIndex)
  nextTick(() => {
    if (props.items[newIndex]?.fileType === 1 && !videoError[newIndex]) {
      try {
        uni.createVideoContext(`hero-video-${newIndex}`, instance?.proxy as any)?.play()
      }
      catch {
        // ignore: 视频 context 可能尚未初始化
      }
    }
  })
}

/** 视频加载成功 */
function onVideoLoaded(index: number) {
  if (props.items[index]?.fileType !== 1)
    return
  videoReady[index] = true
  videoError[index] = false
}

/** 视频播完，自动切到下一项 */
function onVideoEnded(index: number) {
  if (props.items[index]?.fileType !== 1)
    return
  if (index !== swiperCurrent.value)
    return
  // 修改 swiperCurrent → swiper 动画 → @change 触发 → 文字动画
  swiperCurrent.value = (swiperCurrent.value + 1) % props.items.length
}

/** 视频加载失败，降级显示海报 */
function onVideoError(index: number) {
  if (props.items[index]?.fileType !== 1)
    return
  videoReady[index] = false
  videoError[index] = true
}

/** CTA 按钮点击 */
function onTryClick() {
  emit('try', swiperCurrent.value)
}

onUnmounted(() => {
  if (textTimer)
    clearTimeout(textTimer)
})
</script>

<template>
  <view class="hero-carousel">
    <!-- ===== Swiper 轮播主体 ===== -->
    <swiper
      class="carousel-swiper"
      :current="swiperCurrent"
      :duration="300"
      :circular="true"
      @change="onSwiperChange"
    >
      <swiper-item v-for="(item, index) in items" :key="index" class="carousel-swiper-item">
        <!-- 海报（兜底图，视频就绪后淡出） -->
        <image
          :src="item.poster"
          mode="aspectFill"
          class="slide-poster absolute left-0 top-0 h-full w-full"
          :class="{ 'slide-poster--hidden': item.fileType === 1 && videoReady[index] && !videoError[index] }"
        />
        <!-- 视频 -->
        <video
          v-if="item.fileType === 1 && index === swiperCurrent && item.videoUrl"
          :id="`hero-video-${index}`"
          :src="item.videoUrl"
          class="slide-video absolute left-0 top-0 h-full w-full"
          :class="{ 'slide-video--ready': videoReady[index] && !videoError[index] }"
          muted
          autoplay
          playsinline
          webkit-playsinline
          :show-center-play-btn="false"
          :controls="false"
          object-fit="cover"
          @loadedmetadata="onVideoLoaded(index)"
          @ended="onVideoEnded(index)"
          @error="onVideoError(index)"
        />
      </swiper-item>
    </swiper>

    <!-- 预加载下一条视频，避免切换时白屏 -->
    <video
      v-if="preloadItem?.fileType === 1 && preloadItem.videoUrl && nextIndex !== swiperCurrent"
      :id="`hero-video-preload-${nextIndex}`"
      :src="preloadItem.videoUrl"
      class="hero-video-preload"
      muted
      playsinline
      webkit-playsinline
      :show-center-play-btn="false"
      :controls="false"
      object-fit="cover"
    />

    <!-- ===== 渐变遮罩层 ===== -->
    <view class="hero-mask absolute left-0 top-0 h-full w-full" />
    <view class="hero-bottom-fade absolute bottom-0 left-0 right-0 z-[4]" />
    <view class="hero-bottom-halo absolute bottom-[18rpx] left-1/2 z-[4] h-[420rpx] w-[420rpx] -translate-x-1/2" />

    <!-- ===== 主标题区（淡出/淡入动画） ===== -->
    <view
      class="hero-text-wrap absolute bottom-0 left-0 right-0 z-[5] flex flex-col items-center px-[48rpx] pb-[148rpx]"
      :class="{ 'hero-text--hidden': !textVisible }"
    >
      <text class="hero-title text-center text-[76rpx] font-extrabold leading-[1.1] tracking-[8rpx]">
        {{ currentTitle }}
      </text>
      <text class="hero-sub mt-[16rpx] text-center text-[30rpx] tracking-[2rpx]">
        {{ currentSub }}
      </text>
      <!-- CTA 按钮 -->
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

    <!-- ===== 底部指示点 ===== -->
    <view class="dots absolute bottom-[86rpx] left-0 right-0 z-[6] flex justify-center gap-[12rpx]">
      <view
        v-for="(_, index) in items"
        :key="index"
        class="dot"
        :class="{ 'dot--active': index === swiperCurrent }"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.hero-carousel {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: #c4b09a;
}

/* Swiper 填满容器 */
.carousel-swiper {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.carousel-swiper-item {
  width: 100%;
  height: 100%;
}

/* 海报 */
.slide-poster {
  transition: opacity 0.4s ease;
}

.slide-poster--hidden {
  opacity: 0;
}

/* 视频 */
.slide-video {
  opacity: 0;
  transition: opacity 0.35s ease;
}

.slide-video--ready {
  opacity: 1;
}

.hero-video-preload {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 1rpx;
  height: 1rpx;
  opacity: 0;
  pointer-events: none;
}

/* 多段渐变遮罩 */
.hero-mask {
  z-index: 2;
  pointer-events: none;
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
  transform: translateX(-50%);
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.92) 0%,
    rgba(248, 245, 240, 0.58) 42%,
    rgba(248, 245, 240, 0) 100%
  );
  filter: blur(12rpx);
}

/* 文字区域动画 */
.hero-text-wrap {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.hero-text--hidden {
  opacity: 0;
  transform: translateY(12rpx);
}

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

/* 指示点 */
.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 6rpx;
  background: rgba(255, 255, 255, 0.45);
  transition: all 0.25s ease;
}

.dot--active {
  width: 28rpx;
  background: rgba(255, 255, 255, 0.9);
}
</style>
