interface VideoPreviewProps {
  url?: string | null
  textOverlay?: string
  status?: string
}

export function VideoPreview({ url, textOverlay, status }: VideoPreviewProps) {
  if (!url) {
    return (
      <div className="aspect-[9/16] max-w-[200px] bg-zinc-900 rounded-lg flex flex-col items-center justify-center border border-zinc-800">
        {textOverlay && (
          <p className="text-zinc-300 text-xs text-center px-4 leading-relaxed whitespace-pre-line">{textOverlay}</p>
        )}
        <p className="text-zinc-700 text-xs mt-2">{status === 'rendering' ? 'Rendering…' : 'No video yet'}</p>
      </div>
    )
  }

  return (
    <div className="aspect-[9/16] max-w-[200px] rounded-lg overflow-hidden bg-zinc-900">
      <video src={url} controls loop muted className="w-full h-full object-cover" />
    </div>
  )
}
