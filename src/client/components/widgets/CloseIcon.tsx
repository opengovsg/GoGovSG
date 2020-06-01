import React, { FunctionComponent } from 'react'

type CloseIconProps = {
  size: number
  color?: string
}

const CloseIcon: FunctionComponent<CloseIconProps> = ({
  size,
  color = '#BBB',
}) => {
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
        d="M19.293 3.293L12 10.586 4.707 3.293 3.293 4.707 10.586 12l-7.293 7.293 1.414 1.414L12 13.414l7.293 7.293 1.414-1.414L13.414 12l7.293-7.293-1.414-1.414z"
      />
    </svg>
  )
}

export default CloseIcon
