## ADDED Requirements

### Requirement: 轮播数据驱动渲染
Hero 区 SHALL 接收一个 `items` 数组作为输入，每项包含 `videoUrl`、`poster`、`title`、`sub` 字段，并为每项渲染对应的轮播幻灯片。

#### Scenario: 正常渲染三项轮播
- **WHEN** 传入包含 3 个 item 的数组
- **THEN** Hero 区显示 3 个可切换的幻灯片，每项各自展示对应的标题和副标题

### Requirement: 视频自动播放与播完切换
当前激活的轮播项 SHALL 自动播放其视频，视频播完后 MUST 自动切换到下一项（循环）。

#### Scenario: 视频播完自动切换
- **WHEN** 当前项视频触发 `ended` 事件
- **THEN** 轮播切换至下一项（到最后一项后回到第一项）

### Requirement: 手动滑动切换
用户 SHALL 能通过左右滑动手势在轮播项之间切换。

#### Scenario: 向左滑动切换到下一项
- **WHEN** 用户在 Hero 区向左滑动
- **THEN** 轮播切换至下一项

#### Scenario: 向右滑动切换到上一项
- **WHEN** 用户在 Hero 区向右滑动
- **THEN** 轮播切换至上一项

### Requirement: 视频加载失败降级
若视频加载失败，Hero 区 MUST 显示该项的静态海报图片，且不影响其他轮播项。

#### Scenario: 视频加载失败展示海报
- **WHEN** 当前项视频触发 `error` 事件
- **THEN** 该项显示 `poster` 字段对应的静态图片，轮播继续可切换

### Requirement: 底部指示点
Hero 区 SHALL 在底部展示与轮播项数量相同的指示点，当前激活项对应的指示点 MUST 高亮显示。

#### Scenario: 切换后指示点同步高亮
- **WHEN** 用户切换到第 N 项
- **THEN** 第 N 个指示点高亮，其余指示点恢复默认样式

### Requirement: 文字区域切换动画
轮播切换时，文字区域（标题、副标题）MUST 执行淡出 → 更新内容 → 淡入动画。

#### Scenario: 切换时文字淡出再淡入
- **WHEN** 轮播切换到新的项
- **THEN** 旧文字先淡出（opacity 0 + translateY），内容更新后新文字淡入（opacity 1）

### Requirement: CTA 按钮点击事件
Hero 区 SHALL 在每个轮播项中提供「去试试」CTA 按钮，点击时 MUST 向父组件 emit `try` 事件，携带当前项的 index。

#### Scenario: 点击 CTA 按钮
- **WHEN** 用户点击「去试试」按钮
- **THEN** 组件 emit `try` 事件，payload 为当前轮播项的 index
