## 1. 创建 HeroCarousel 组件

- [x] 1.1 新建 `src/components/HeroCarousel.vue`，定义 `items` props（含 videoUrl、poster、title、sub）和 `try` emit
- [x] 1.2 使用 `<swiper>` 渲染轮播结构，为每个 item 渲染 `<swiper-item>`
- [x] 1.3 每个 `<swiper-item>` 内放置 `<image>`（海报）和 `<video>`，视频加载完成后显示视频、隐藏海报
- [x] 1.4 实现视频播完自动切到下一项（循环）的逻辑
- [x] 1.5 实现视频加载失败时继续显示海报的降级逻辑
- [x] 1.6 监听 `<swiper>` 的 `@change` 事件，同步更新 `currentIndex`，并 pause 非当前项视频

## 2. 文字区域与动画

- [x] 2.1 在组件内实现标题/副标题的淡出 → 更新内容 → 淡入动画（复用现有 `hero-text--hidden` 方案）
- [x] 2.2 切换时先隐藏文字、延迟约 280ms 后更新内容并显示

## 3. 底部指示点

- [x] 3.1 渲染与 `items.length` 数量相同的指示点
- [x] 3.2 当前激活项对应指示点放大并加深颜色，添加 `transition` 过渡

## 4. CTA 按钮

- [x] 4.1 每个轮播项内渲染「去试试」按钮
- [x] 4.2 点击时 emit `try` 事件，携带 `{ index: currentIndex }`

## 5. 集成到首页

- [x] 5.1 在 `src/pages/index/index.vue` 中引入并使用 `<HeroCarousel>`
- [x] 5.2 定义 `carouselItems` 数组（含 3 项视频 URL、海报、标题、副标题）
- [x] 5.3 移除首页内联的 `heroVideoIndex / heroVideoReady / heroVideoErrorCount` refs 及相关回调
- [x] 5.4 将 `onTryClick` 处理函数传递给组件 `@try` 事件

## 6. 样式调整

- [x] 6.1 将原 `.hero` scoped 样式（渐变遮罩、海报、视频等）迁移到 `HeroCarousel.vue` 内
- [x] 6.2 确认指示点样式与整体暖色调（`#f8f5f0` 背景）协调
- [x] 6.3 验证 `home-shell` 高度（100vh - safe-area-inset-bottom）在添加组件后无溢出
