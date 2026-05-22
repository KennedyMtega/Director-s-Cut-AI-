import { executeAction } from '@/lib/composio/client'

// Action names visible at app.composio.dev → Apps → Cloudinary → Actions
const ACTION_UPLOAD = 'CLOUDINARY_UPLOAD_MEDIA_ASSET'
const ACTION_DELETE = 'CLOUDINARY_DELETE_ASSETS'

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options: { folder: string; resourceType?: 'image' | 'video' | 'auto'; publicId?: string }
): Promise<{ url: string; publicId: string }> {
  const result = await executeAction(ACTION_UPLOAD, {
    file: fileBuffer.toString('base64'),
    folder: options.folder,
    resource_type: options.resourceType ?? 'auto',
    ...(options.publicId ? { public_id: options.publicId } : {}),
  })

  if (!result.successful) throw new Error(`Cloudinary upload failed: ${result.error}`)

  return {
    url: result.data.secure_url as string,
    publicId: result.data.public_id as string,
  }
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<void> {
  await executeAction(ACTION_DELETE, {
    public_ids: [publicId],
    resource_type: resourceType,
  })
}
