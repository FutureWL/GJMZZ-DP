import { type ReactNode, useLayoutEffect, useState } from 'react'

function calcScale(designW: number, designH: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  return Math.min(vw / designW, vh / designH)
}

export function ScaleFit(props: { children: ReactNode; designWidth: number; designHeight: number }) {
  const [scale, setScale] = useState(() => calcScale(props.designWidth, props.designHeight))

  useLayoutEffect(() => {
    const onResize = () => setScale(calcScale(props.designWidth, props.designHeight))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [props.designHeight, props.designWidth])

  return (
    <div className="h-full w-full overflow-hidden bg-[var(--color-bg-page)]">
      <div className="flex h-full w-full items-center justify-center">
        <div
          style={{
            width: props.designWidth,
            height: props.designHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {props.children}
        </div>
      </div>
    </div>
  )
}
