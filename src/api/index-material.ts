import { http } from '@/http/http'

export interface Carousel {
  createTime: string
  fileType: 0 | 1
  fileUrl: string
  id: number
  isDeleted: number
  materialType: number
  sort: number
  status: number
}

export interface IndexMaterialResponse {
  carouselList: Carousel[]
  emptyRoomDesignUrl: string
  existingRoomDesignUrl: string
  softFurnishingStyingUrl: string
}

export function getIndexMaterial() {
  return http.get<IndexMaterialResponse>('app/ai-renovation/index-material', undefined, undefined, {
    hideErrorToast: true,
  })
}
