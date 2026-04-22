## ADDED Requirements

### Requirement: 首页轮播素材接口封装
系统 SHALL 提供 `getIndexMaterial()` 函数，调用 GET `/app/ai-renovation/index-material`，返回 `IndexMaterialResponse` 类型数据，包含 `carouselList`、`emptyRoomDesignUrl`、`existingRoomDesignUrl`、`softFurnishingStyingUrl`。`Carousel` 类型中 `fileType: 0` 表示图片，`fileType: 1` 表示视频。

#### Scenario: 接口请求成功
- **WHEN** 调用 `getIndexMaterial()` 且服务端返回 code `"00000"`
- **THEN** 返回包含 `carouselList` 数组的 `IndexMaterialResponse` 对象

#### Scenario: 接口请求失败
- **WHEN** 调用 `getIndexMaterial()` 且网络异常或服务端返回非成功 code
- **THEN** Promise reject，调用方捕获异常后执行降级逻辑
