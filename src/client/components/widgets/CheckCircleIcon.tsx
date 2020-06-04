import React, { FunctionComponent } from 'react'

type CheckCircleIconProps = {
  color?: string
  className?: string
}

const CheckCircleIcon: FunctionComponent<CheckCircleIconProps> = ({
  color = '#384A51',
  className,
}) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 1.5C4.8645 1.5 1.5 4.8645 1.5 9C1.5 13.1355 4.8645 16.5 9 16.5C13.1355 16.5 16.5 13.1355 16.5 9C16.5 4.8645 13.1355 1.5 9 1.5ZM9 15C5.69175 15 3 12.3082 3 9C3 5.69175 5.69175 3 9 3C12.3082 3 15 5.69175 15 9C15 12.3082 12.3082 15 9 15Z"
        fill={color}
      />
      <path
        d="M7.49919 10.1902L5.77494 8.46898L4.71594 9.53098L7.50069 12.3097L12.5302 7.28023L11.4697 6.21973L7.49919 10.1902Z"
        fill={color}
      />
    </svg>
  )
}

export default CheckCircleIcon
