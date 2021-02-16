import React, { FunctionComponent } from 'react'

type CheckIconProps = {
  color?: string
  className?: string
}

const CheckIcon: FunctionComponent<CheckIconProps> = ({
  color = '#000',
  className = '',
}: CheckIconProps) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill={color}
        d="M10 15.586L6.707 12.293 5.293 13.707 10 18.414 19.707 8.707 18.293 7.293z"
      />
    </svg>
  )
}

export default CheckIcon
