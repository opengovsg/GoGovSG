import * as React from 'react'

type IconProps = {
  color: string
}

export default function BackIcon({ color }: IconProps) {
  const backSvg = (
    <svg role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="14">
      {/* Treat this as the 'alt' tag in img */}
      <title id="svg1Title">Back</title>
      <path
        fill={color}
        d="M15.5 6.16729H3.34503L7.75586 1.75646L6.57753 0.578125L0.155029 7.00062L6.57753 13.4231L7.75586 12.2448L3.34503 7.83396H15.5V6.16729Z"
      />
    </svg>
  )
  return backSvg
}
