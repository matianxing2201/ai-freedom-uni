## Why

首页 Hero 区当前使用单一背景海报 + 手动逻辑切换视频，没有真正的轮播交互——视频只是播完后静默循环，用户无法主动浏览各功能场景，导致首屏内容感弱、转化引导不足。现在需要把 Hero 区升级为支持自动播放 + 手动滑动的轮播组件，让三个核心功能（空房设计、现房改造、软装换搭）各自独立展示。

## What Changes

- 新增首页 Hero 轮播组件，替换当前的单一 `<video>` + `heroVideoIndex` 手动切换方案
- 每个轮播项包含：背景视频（或海报兜底）、标题、副标题、「去试试」CTA 按钮
- 支持自动播放（视频播完自动切下一项）和用户手动左右滑动切换
- 新增底部指示点（dots indicator），显示当前所在轮播项
- 视频加载失败时优雅降级为静态海报
- 过渡动画：切换时文字区域淡出/淡入，视频淡出/淡入

## Capabilities

### New Capabilities

- `hero-carousel`: 首页 Hero 区轮播能力，包含多项轮播数据定义、自动播放控制、手动滑动切换、视频/海报渲染、指示点展示

### Modified Capabilities

（无）

## Impact

- 修改 `src/pages/index/index.vue`：移除当前 `heroVideoIndex` / `heroVideoReady` / `heroVideoErrorCount` 分散逻辑，收敛到轮播组件内
- 新增 `src/components/HeroCarousel.vue` 组件
- 依赖 uni-app 内置 `<swiper>` 或自定义 touch 手势（微信小程序兼容）
- 不依赖新的第三方包
