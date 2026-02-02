import React, { FunctionComponent } from 'react'

type CopyIconProps = {
  size: number
  color?: string
}

const CopyIcon: FunctionComponent<CopyIconProps> = ({
  size,
  color = '#384A51',
}: CopyIconProps) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <path
        d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
        fill={color}
      />
    </svg>
  )
}

export default CopyIcon
