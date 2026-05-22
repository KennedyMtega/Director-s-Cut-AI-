import { cloudinary } from './client'

export function getVideoThumbnailUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    transformation: [{ width: 400, height: 711, crop: 'fill', format: 'jpg', quality: 'auto' }],
  })
}

export function getOptimizedImageUrl(publicId: string, width = 800): string {
  return cloudinary.url(publicId, {
    transformation: [{ width, crop: 'limit', format: 'auto', quality: 'auto' }],
  })
}
