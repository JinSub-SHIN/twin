export type RoomPhotoCategory =
  | '거실'
  | '방'
  | '주방'
  | '화장실'
  | '현관'
  | '기타'

export type RoomPhotoInput = {
  url: string
  category?: RoomPhotoCategory | null
}

export type RoomPhotoRecord = {
  id: string
  url: string
  category: string | null
  sort_order: number
}

export type RoomAddPhotosBody = {
  photos: RoomPhotoInput[]
}

export type RoomAddPhotosResponse = {
  success: boolean
  photos: RoomPhotoRecord[]
}
