## Why

首页轮播当前使用的是代码里硬编码的本地视频路径，无法动态更新内容。`/app/ai-renovation/index-material` 接口已提供完整的轮播素材列表（含视频 URL、图片 URL、三个功能入口教程视频），现在需要将首页接入该接口，实现内容由服务端驱动，同时解决视频 URL 动态替换时出现空白帧的体验问题。

## What Changes

- 新增 `src/api/index-material.ts`，封装 `/app/ai-renovation/index-material` GET 接口及其 TypeScript 类型
- 首页 `onLoad` 时请求接口，获取 `carouselList`（轮播素材列表）
- 进入页面时立即展示静态默认海报图，接口返回后切换到接口数据
- 对 `carouselList` 中类型为视频（`fileType === 1`）的条目实现预加载（通过隐藏 `<video>` 提前加载下一项），防止视频 URL 切换时出现空白帧
- 接口返回的图片条目（`fileType === 0`）直接作为海报展示，不走视频播放逻辑
- 请求失败时静默降级，保留当前硬编码素材作为兜底

## Capabilities

### New Capabilities

- `index-material-api`: 封装首页轮播素材接口，定义 `Carousel` 与 `IndexMaterialResponse` 类型，提供 `getIndexMaterial()` 方法
- `carousel-preload`: 在视频切换前预加载下一条视频，避免 URL 替换瞬间出现空白帧的体验问题

### Modified Capabilities

（无）

## Impact

- 新增 `src/api/index-material.ts`
- 修改 `src/pages/index/index.vue`：`onLoad` 调用接口，将 `heroVideoPaths` / `heroPoster` 改为接口数据驱动，新增预加载 `<video>` 节点
- 不新增第三方依赖
- 依赖现有 `src/http/http.ts` 请求工具
