import React from 'react'
import { registerRoot, Composition } from 'remotion'
import { QuoteVideo } from './QuoteVideo'

const RemotionRoot: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        backgroundVideo: '',
        style: 'A',
      }}
    />
  )
}

registerRoot(RemotionRoot)
