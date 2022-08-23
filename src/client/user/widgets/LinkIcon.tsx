import React, { FunctionComponent } from 'react'

type LinkIconProps = {
  size: number
  color?: string
}

const LinkIcon: FunctionComponent<LinkIconProps> = ({
  size,
  color = '#384A51',
}: LinkIconProps) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <path
        d="M3.167 14.834c.73.73 1.69 1.096 2.65 1.096.962 0 1.922-.365 2.653-1.096l2.12-2.122-1.06-1.06-2.12 2.121c-.878.875-2.305.877-3.183 0-.877-.877-.877-2.305 0-3.182L6.349 8.47l-1.06-1.06-2.122 2.12c-1.462 1.462-1.462 3.842 0 5.304zM14.834 8.47c1.46-1.462 1.46-3.842 0-5.303-1.463-1.463-3.843-1.461-5.304 0L7.41 5.288l1.06 1.06 2.12-2.12c.878-.876 2.306-.878 3.183 0 .877.877.877 2.304 0 3.181L11.651 9.53l1.06 1.06 2.123-2.12z"
        fill={color}
      />
      <path
        d="M6.348 12.713l-1.06-1.06 6.364-6.365 1.06 1.06-6.364 6.365z"
        fill={color}
      />
    </svg>
  )
}

export default LinkIcon
