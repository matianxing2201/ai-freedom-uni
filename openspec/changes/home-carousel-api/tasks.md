## 1. 接口封装

- [x] 1.1 新建 `src/api/index-material.ts`，定义 `Carousel` 和 `IndexMaterialResponse` TypeScript 类型
- [x] 1.2 实现 `getIndexMaterial()` 函数，调用 `http.get<IndexMaterialResponse>('/app/ai-renovation/index-material')`
- [x] 1.3 验证类型定义与项目分析报告中的接口响应结构一致（carouselList、fileType、fileUrl、sort 等字段）

## 2. 首页接口集成

- [x] 2.1 在 `src/pages/index/index.vue` 中定义 `FALLBACK_ITEMS` 常量（含现有 3 条硬编码视频路径及对应 poster/title/sub）
- [x] 2.2 定义响应式 `carouselItems` ref（初始值为 `FALLBACK_ITEMS`），替换原有 `heroVideoPaths` 数组
- [x] 2.3 在 `onLoad` 中调用 `getIndexMaterial()`，将 `carouselList` 按 `sort` 升序排序后更新 `carouselItems`
- [x] 2.4 接口调用用 `try/catch` 包裹，失败时静默保留 `FALLBACK_ITEMS`，不显示错误提示

## 3. fileType 渲染区分

- [x] 3.1 在模板中根据当前项 `fileType` 条件渲染：`fileType === 0` 只显示 `<image>`，`fileType === 1` 显示 `<video>`
- [x] 3.2 `fileType === 0` 的图片项不触发 `onHeroVideoLoaded/Ended/Error`，视频事件回调中增加 `fileType` 守卫

## 4. 视频预加载

- [x] 4.1 计算 `nextIndex`（当前索引 + 1，循环取模），在模板中额外渲染一个隐藏的预加载 `<video>` 节点，src 指向下一项视频 URL
- [x] 4.2 为预加载节点添加样式：`opacity: 0; position: absolute; pointer-events: none; width: 1rpx; height: 1rpx`（不影响布局）
- [x] 4.3 预加载节点仅在下一项 `fileType === 1` 时渲染，图片项不渲染
- [x] 4.4 确认切换后不出现空白帧（在微信开发者工具中验证）

## 5. 首屏海报兜底

- [x] 5.1 确认 `carouselItems` 初始值为 `FALLBACK_ITEMS` 时，默认海报 `/static/images/home/free_xfgz.png` 正常显示
- [x] 5.2 接口返回后，若 `carouselList` 为空数组，保留 `FALLBACK_ITEMS` 不替换
