## ADDED Requirements

### Requirement: 首屏显示默认海报
进入首页时，在接口数据返回之前，系统 MUST 显示静态兜底海报图片，不得出现空白区域。

#### Scenario: 接口数据未返回时显示海报
- **WHEN** 首页 `onLoad` 已触发但接口尚未响应
- **THEN** Hero 区显示静态默认海报图（`/static/images/home/free_xfgz.png`），不出现空白

### Requirement: 接口数据驱动轮播
接口返回后，系统 SHALL 使用 `carouselList`（按 `sort` 升序）替换硬编码素材，驱动 Hero 区轮播内容渲染。

#### Scenario: 接口成功后切换到接口数据
- **WHEN** `getIndexMaterial()` 成功返回且 `carouselList` 非空
- **THEN** Hero 区轮播内容切换为接口返回的素材列表

#### Scenario: 接口失败时保留兜底数据
- **WHEN** `getIndexMaterial()` 抛出异常
- **THEN** 首页继续使用硬编码 `FALLBACK_ITEMS` 数据，不弹出错误提示

### Requirement: fileType 区分图片与视频渲染
系统 MUST 根据 `Carousel.fileType` 字段区分渲染逻辑：`fileType === 0` 的条目只渲染 `<image>` 不渲染 `<video>`；`fileType === 1` 的条目渲染 `<video>` 并启用自动播放。

#### Scenario: 图片类型条目不触发视频播放
- **WHEN** 当前轮播项 `fileType === 0`
- **THEN** 只展示 `<image>`，不渲染 `<video>` 节点，不触发视频事件

#### Scenario: 视频类型条目正常播放
- **WHEN** 当前轮播项 `fileType === 1`
- **THEN** `<video>` 自动播放，播完后切换到下一项

### Requirement: 视频预加载防止空白帧
在当前视频播放期间，系统 SHALL 以不可见方式预加载下一条视频，确保切换时视频已缓冲，不出现空白帧。同时最多保留当前项与下一项两个 `<video>` 节点，其余不渲染。

#### Scenario: 切换时不出现空白帧
- **WHEN** 当前项视频播完，轮播切换到下一项
- **THEN** 下一项视频已预加载完成，切换后立即显示视频画面，无空白帧

#### Scenario: 预加载节点不可见且不可交互
- **WHEN** 预加载 `<video>` 节点存在于 DOM 中
- **THEN** 该节点 `opacity: 0`、`pointer-events: none`，用户不可见也不可触发交互
