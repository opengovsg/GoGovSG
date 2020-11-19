import React, { FunctionComponent } from 'react'

type RedirectIconProps = {
  color?: string
  className?: string
}

const RedirectIcon: FunctionComponent<RedirectIconProps> = ({
  className = '',
  color = '#384A51'
}) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      fill="none"
      viewBox={'0 0 16 16'}
    >
      <path d="M8.66665 2L10.862 4.19533L6.19531 8.862L7.13798 9.80467L11.8046 5.138L14 7.33333V2H8.66665Z" 
            fill={color}/>
      <path d="M12.6667 12.6667H3.33333V3.33333H8L6.66667 2H3.33333C2.598 2 2 2.598 2 3.33333V12.6667C2 13.402 2.598 14 3.33333 14H12.6667C13.402 14 14 13.402 14 12.6667V9.33333L12.6667 8V12.6667Z" 
            fill={color}/>

    </svg>
  )
}

export default RedirectIcon
