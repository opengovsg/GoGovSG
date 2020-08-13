import React from 'react'

type InfoIconProps = {
  color: string
}

export default ({ color = '#384A51' }: InfoIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        fill={color}
        d="M8 1.333c-3.676 0-6.667 2.99-6.667 6.667 0 3.676 2.99 6.667 6.667 6.667 3.676 0 6.667-2.991 6.667-6.667 0-3.676-2.991-6.667-6.667-6.667zm0 12c-2.94 0-5.333-2.392-5.333-5.333 0-2.94 2.392-5.333 5.333-5.333 2.94 0 5.333 2.392 5.333 5.333 0 2.94-2.392 5.333-5.333 5.333z"
      />
      <path
        fill={color}
        d="M7.333 7.333h1.334v4H7.333v-4zm0-2.666h1.334V6H7.333V4.667z"
      />
    </svg>
  )
}
