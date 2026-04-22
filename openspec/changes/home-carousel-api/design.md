## Context

首页 Hero 区当前硬编码了 3 条视频路径（OSS 相对路径），不支持服务端下发动态内容。项目已有 `src/http/http.ts` 请求工具，API 基础地址为 `https://api.aifreedomhome.com/`。接口 `/app/ai-renovation/index-material` 返回 `carouselList`（含 `fileUrl`、`fileType`），以及三个功能入口的教程视频 URL。

## Goals / Non-Goals

**Goals:**

- 新建 `src/api/index-material.ts` 封装接口，定义完整 TS 类型
- 首页 `onLoad` 请求接口，接口完成前展示静态默认海报，完成后切换到接口数据
- 过滤 `fileType === 1`（视频）条目驱动轮播，`fileType === 0`（图片）条目跳过视频播放直接显示
- 在轮播切换前，通过隐藏 `<video>` 节点预加载下一条视频，防止空白帧
- 接口失败时静默降级到硬编码兜底数据

**Non-Goals:**

- 不实现接口缓存或 SWR 机制（可后续迭代）
- 不处理 `emptyRoomDesignUrl` / `existingRoomDesignUrl` / `softFurnishingStyingUrl`（功能入口教程视频，本次不接入）
- 不做分页，接口一次性返回全部轮播数据

## Decisions

### 1. 预加载策略：隐藏 `<video>` 节点 vs. 手动 `createVideoContext`

选择**隐藏 `<video>` 节点预加载**：在当前活跃项播放时，将下一项的 `<video>` 以 `opacity:0; position:absolute; pointer-events:none` 隐藏渲染，利用微信小程序原生 video 的缓冲机制静默预加载。  
替代方案（动态修改 src）会导致 video 节点销毁重建，仍出现空白帧，放弃。

### 2. 接口时序：onLoad 请求，先显示兜底海报

页面 `onLoad` 立即发起请求，在 `carouselItems` 为空时显示静态海报（`heroPoster` 常量）。接口返回后将 `carouselItems` 填充，触发响应式更新。  
不在 `onMounted` 之前阻塞渲染，保证首帧体验。

### 3. API 层：独立文件 `src/api/index-material.ts`

复用现有 `http.get()` 模式，与 `src/api/foo.ts` 保持一致风格。类型定义放在同文件，不单独拆 types 目录（仅 2 个接口，不值得）。

### 4. 降级策略：静默 fallback 到硬编码数据

接口失败（网络错误/非 `00000` code）时，`carouselItems` 保持为硬编码的兜底数组，用户无感知，不弹出错误 toast。

## Risks / Trade-offs

- **微信小程序同时渲染多个 `<video>` 节点的性能影响**：预加载节点与当前项同时存在 DOM，增加 GPU 内存占用。  
  → 缓解：同时最多保留 2 个 video 节点（当前项 + 下一项），其余 unmount。

- **接口冷启动延迟**：首次加载时接口可能需要 500ms~1s，期间显示静态海报，体验可接受。  
  → 缓解：接口无需 loading 状态展示，海报本身即是合理的初始态。

- **`fileType === 0` 图片条目混入视频轮播**：若接口返回图片类型，当前视频播放逻辑需跳过，防止空 video src。  
  → 缓解：在渲染层判断 `fileType`，图片条目只渲染 `<image>`，不渲染 `<video>`。

## Migration Plan

1. 新建 `src/api/index-material.ts`
2. 修改 `src/pages/index/index.vue`，替换硬编码 `heroVideoPaths` 为接口驱动的 `carouselItems`
3. 旧硬编码数据保留为 `FALLBACK_ITEMS` 常量，供接口失败时使用
4. 本地联调微信开发者工具，验证预加载行为及降级逻辑

回滚：`git revert` 即可，无 DB/接口变更。

## Open Questions

- `carouselList` 是否有排序字段 `sort`？接口响应类型已有 `sort: number`，按 `sort` 升序排列。
- 视频 URL 是否为完整 HTTPS URL 还是 OSS 相对路径？根据项目分析报告，`fileUrl` 为完整 URL，直接使用。
