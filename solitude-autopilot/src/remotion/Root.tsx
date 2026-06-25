/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Composition } from 'remotion'
import { QuoteVideo } from './QuoteVideo'

export const RemotionRoot: React.FC = () => {
  const C = Composition as any
  return (
    <C
      id="QuoteVideo"
      component={QuoteVideo}
      durationInFrames={240}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        hook: 'Kuna maumivu ambayo hayaonekani nje',
        body: 'Watu wanaona tabasamu lako\nlakini hawajui usiku wako unavyoonekana\nunabeba uzito ambao hata maneno hayawezi kueleza\nna bado unaamka na kutoa nguvu zako zote',
        watermark: '@solitude_script',
        backgroundVideo: '/backgrounds/default.mp4',
        style: 'A',
      }}
    />
  )
}
