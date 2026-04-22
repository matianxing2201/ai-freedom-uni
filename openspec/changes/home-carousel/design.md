## Context

首页 Hero 区目前通过 `heroVideoIndex` ref 手动在 3 个视频 URL 之间切换，切换逻辑散落在 `onHeroVideoEnded` / `onHeroVideoError` 回调里，没有统一的轮播抽象。项目使用 uni-app（Vue 3 + script setup）针对微信小程序构建，原生支持 `<swiper>` 组件，无需引入第三方滑动库。

## Goals / Non-Goals

**Goals:**

- 将 Hero 区封装为独立的 `HeroCarousel.vue` 组件
- 支持视频播完自动切到下一项（沿用现有行为）
- 支持用户手动左右滑动切换（借助 `<swiper>`）
- 每个轮播项独立管理自身的视频状态（ready / error）
- 新增底部指示点（dots），随当前索引高亮
- 视频加载失败降级为静态海报

**Non-Goals:**

- 不做无限循环预加载（视频流量控制）
- 不支持纵向滑动
- 不做视频缓存/预加载优化（可后续迭代）

## Decisions

### 1. 使用 uni-app `<swiper>` 而非自定义 touch 手势

`<swiper>` 在微信小程序原生渲染，无需额外代码处理 touch 边界、惯性动画等细节，且与 `<video>` 同层渲染不冲突。  
替代方案（自定义 touchstart/touchend）复杂度高，兼容性差，放弃。

### 2. 每个 `<swiper-item>` 内独立放置 `<video>`，通过 `current` 控制播放

`<swiper>` 切换时，非当前项的 video 不可见但仍存在 DOM。通过监听 `current` 变化，手动 pause 非当前项（如有必要），激活当前项 autoplay。微信小程序中 `<video>` 有唯一 id，用 `uni.createVideoContext` 控制播放/暂停。

### 3. HeroCarousel 为受控组件，父页面保持最小状态

父页面（index.vue）只传入 `items` 数组（含 videoUrl、poster、title、sub）并响应 `@try` 事件，其余轮播状态（currentIndex、videoReady、errorCount）全部在组件内管理。

### 4. 指示点（dots）使用纯 CSS，不引入外部图标

3 个小圆点，当前项放大并加深颜色；过渡用 `transition: all 0.25s`。

## Risks / Trade-offs

- **微信小程序 `<video>` 同层渲染限制**：多个 `<swiper-item>` 内同时存在多个 `<video>` 时，非活跃 video 可能占用解码资源。  
  → 缓解：在 `@change` 回调里 pause 非当前项的 video context。

- **`autoplay` 在小程序首次加载需用户交互才能触发**：  
  → 缓解：首帧展示静态海报，用户任意滑动后再触发视频播放（已有行为保留）。

- **swiper 动画与视频切换动画叠加**：视频淡入淡出 + swiper 滑动可能视觉上冲突。  
  → 缓解：将 swiper `duration` 设为 300ms，视频淡入 transition 设为 350ms，使两者错开。

## Migration Plan

1. 在 `src/components/HeroCarousel.vue` 新建组件
2. 修改 `src/pages/index/index.vue`，移除内联 Hero 逻辑，改为 `<HeroCarousel :items="carouselItems" @try="onTryClick" />`
3. 原有 `heroVideoIndex / heroVideoReady / heroVideoErrorCount` 相关 ref 和方法随之删除
4. 本地运行微信开发者工具验证切换与降级行为

回滚：git revert 即可，无数据库/接口变更。

## Open Questions

- 视频 URL 是否需要接入 CDN 鉴权签名？（当前 hardcode，后续接口化时再考虑）
- 是否需要支持从外部动态下发轮播配置（CMS 接口）？（本次不做）
