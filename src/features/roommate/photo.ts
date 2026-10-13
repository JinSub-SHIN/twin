const MAX_EDGE = 1280
const QUALITY = 0.8

export const MAX_PHOTOS = 10

export function readPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('not-image'))
      return
    }
    const src = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      const context = canvas.getContext('2d')
      URL.revokeObjectURL(src)
      if (!context) {
        reject(new Error('no-canvas'))
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', QUALITY))
    }
    image.onerror = () => {
      URL.revokeObjectURL(src)
      reject(new Error('decode-failed'))
    }
    image.src = src
  })
}
