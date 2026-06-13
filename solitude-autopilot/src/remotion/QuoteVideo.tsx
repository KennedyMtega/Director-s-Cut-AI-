'use client'

import React from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig, Video } from '@remotion/core'

export interface QuoteVideoProps {
  hook: string
  body: string
  watermark: string
  backgroundVideo: string
  style: string
}

const STYLE_ACCENT: Record<string, string> = {
  A: '#c084fc',
  B: '#f87171',
  C: '#60a5fa',
  D: '#facc15',
  E: '#34d399',
}

export const QuoteVideo: React.FC<QuoteVideoProps> = ({
  hook,
  body,
  watermark,
  backgroundVideo,
  style,
}) => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const accent = STYLE_ACCENT[style] ?? '#ffffff'

  const hookSlide = spring({ frame, fps, from: 60, to: 0, config: { damping: 14, mass: 0.8 } })
  const hookOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })

  const bodyOpacity = interpolate(frame, [18, 32], [0, 1], { extrapolateRight: 'clamp' })
  const bodyY = interpolate(frame, [18, 35], [30, 0], { extrapolateRight: 'clamp' })

  const watermarkOpacity = interpolate(frame, [30, 45], [0, 0.7], { extrapolateRight: 'clamp' })
  const dotScale = spring({ frame: frame - 8, fps, from: 0, to: 1, config: { damping: 10 } })
  const bounce = Math.abs(Math.sin((frame / fps) * Math.PI * 2.2)) * 18

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  const bodyLines = body.split('\n').filter(Boolean)

  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: '#000', fontFamily: "'Playfair Display', Georgia, serif" }}>
      {/* Background video */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Video
          src={backgroundVideo}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(6px) brightness(0.55) saturate(1.2)' }}
          loop
          muted
        />
      </div>

      {/* Dark vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%)',
        opacity: fadeOut,
      }} />

      {/* Accent glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 110%, ${accent}22 0%, transparent 60%)`,
        opacity: fadeOut,
      }} />

      {/* Bouncing dot */}
      <div style={{
        position: 'absolute',
        top: '12%',
        left: '50%',
        transform: `translateX(-50%) translateY(${-bounce}px) scale(${dotScale})`,
        width: 14,
        height: 14,
        borderRadius: '50%',
        backgroundColor: accent,
        boxShadow: `0 0 24px ${accent}`,
        opacity: fadeOut,
      }} />

      {/* Hook */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '28%',
        paddingLeft: 56,
        paddingRight: 56,
        opacity: hookOpacity * fadeOut,
        transform: `translateY(${hookSlide}px)`,
      }}>
        <div style={{
          color: '#ffffff',
          fontSize: 68,
          fontWeight: 800,
          lineHeight: 1.15,
          textAlign: 'center',
          textShadow: '0 2px 24px rgba(0,0,0,0.8)',
          letterSpacing: '-0.5px',
        }}>
          {hook}
        </div>
      </div>

      {/* Body */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '60%',
        paddingLeft: 64,
        paddingRight: 64,
        opacity: bodyOpacity * fadeOut,
        transform: `translateY(${bodyY}px)`,
      }}>
        <div style={{ width: '100%', height: 2, backgroundColor: accent, marginBottom: 28, opacity: 0.8 }} />
        {bodyLines.map((line, i) => (
          <div key={i} style={{
            color: '#e8e8e8',
            fontSize: 40,
            fontWeight: 400,
            lineHeight: 1.6,
            textAlign: 'center',
            textShadow: '0 1px 12px rgba(0,0,0,0.7)',
            fontFamily: "'Inter', Arial, sans-serif",
            marginBottom: 4,
          }}>
            {line}
          </div>
        ))}
      </div>

      {/* Watermark */}
      <div style={{
        position: 'absolute',
        bottom: 64,
        right: 48,
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 600,
        fontFamily: "'Inter', Arial, sans-serif",
        letterSpacing: 1,
        opacity: watermarkOpacity * fadeOut,
        textShadow: '0 1px 8px rgba(0,0,0,0.6)',
      }}>
        {watermark}
      </div>
    </div>
  )
}
