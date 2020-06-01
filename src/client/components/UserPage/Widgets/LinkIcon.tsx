import React from 'react'

type LinkIconProps = {
  color: string
  size: number
}

export default ({ color = '#384A51', size = 16 }: LinkIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox={`0 0 ${size} ${size}`}
    >
      <path
        fill={color}
        d="M2.815 13.185c.65.65 1.503.975 2.356.975.854 0 1.708-.325 2.358-.975L9.414 11.3l-.943-.942-1.885 1.886c-.78.778-2.048.779-2.829 0-.78-.78-.78-2.05 0-2.83L5.643 7.53l-.942-.943L2.815 8.47c-1.3 1.3-1.3 3.415 0 4.714zm10.37-5.656c1.299-1.3 1.299-3.415 0-4.714-1.3-1.3-3.415-1.3-4.714 0L6.586 4.7l.943.942 1.885-1.886c.78-.778 2.049-.78 2.829 0 .779.78.779 2.049 0 2.829L10.357 8.47l.942.943 1.886-1.885z"
      />
      <path
        fill={color}
        d="M5.643 11.3l-.943-.943L10.357 4.7l.943.943L5.643 11.3z"
      />
    </svg>
  )
}
