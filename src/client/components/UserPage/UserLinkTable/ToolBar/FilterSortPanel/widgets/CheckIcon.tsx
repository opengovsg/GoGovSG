import React, { FunctionComponent } from 'react'

type CheckIconProps = {
  size: number
  color?: string
  className?: string
}

const CheckIcon: FunctionComponent<CheckIconProps> = ({
  size,
  color = '#000',
  className = '',
}) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox={`0 0 ${size} ${size}`}
    >
      <path
        fill={color}
        d="M10 15.586L6.707 12.293 5.293 13.707 10 18.414 19.707 8.707 18.293 7.293z"
      />
    </svg>
  )
}

export default CheckIcon
