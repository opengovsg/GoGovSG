import React, { FunctionComponent } from 'react'

type ArrowDownIconProps = {
  className?: string
  width?: string
  height?: string
}

const ArrowDownIcon: FunctionComponent<ArrowDownIconProps> = ({
  className = '',
  width = '36',
  height = '36',
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.1516 7.55078L12 12.7024L6.84841 7.55078L5.15161 9.24758L12 16.096L18.8484 9.24758L17.1516 7.55078Z"
        fill="#384A51"
      />
    </svg>
  )
}

export default ArrowDownIcon
