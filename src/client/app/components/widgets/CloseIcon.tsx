import React, { FunctionComponent } from 'react'

type CloseIconProps = {
  size?: number
  color?: string
}

const CloseIcon: FunctionComponent<CloseIconProps> = ({
  size = 24,
  color = '#BBB',
}: CloseIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      style={{
        height: `${size}px`,
        width: `${size}px`,
      }}
      viewBox="0 0 24 24"
    >
      <path
        fill={color}
        d="M19.293 3.293L12 10.586 4.707 3.293 3.293 4.707 10.586 12l-7.293 7.293 1.414 1.414L12 13.414l7.293 7.293 1.414-1.414L13.414 12l7.293-7.293-1.414-1.414z"
      />
    </svg>
  )
}

export default CloseIcon
