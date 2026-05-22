import { cloudinary } from './client'

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options: { folder: string; resourceType?: 'image' | 'video' | 'auto'; publicId?: string }
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder,
      resource_type: options.resourceType ?? 'auto',
      public_id: options.publicId,
    } as const

    cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error('Upload failed'))
        return
      }
      resolve({ url: result.secure_url, publicId: result.public_id })
    }).end(fileBuffer)
  })
}

export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}
