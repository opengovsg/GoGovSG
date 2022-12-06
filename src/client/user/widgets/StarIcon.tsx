import React from 'react'

type StarIconProps = {
  color?: string
}

export default ({ color = '#6D9067' }: StarIconProps) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={color}
        d="M19.947 7.179C19.818 6.801 19.477 6.534 19.079 6.503L13.378 6.05L10.911 0.589C10.75 0.23 10.393 0 9.99998 0C9.60698 0 9.24998 0.23 9.08898 0.588L6.62198 6.05L0.920979 6.503C0.529979 6.534 0.192979 6.791 0.0599788 7.16C-0.0730212 7.529 0.0209789 7.942 0.301979 8.216L4.51498 12.323L3.02498 18.775C2.93298 19.174 3.09398 19.589 3.43098 19.822C3.60298 19.94 3.80098 20 3.99998 20C4.19298 20 4.38698 19.944 4.55498 19.832L9.99998 16.202L15.445 19.832C15.793 20.064 16.25 20.055 16.59 19.808C16.928 19.561 17.077 19.128 16.962 18.726L15.133 12.326L19.669 8.244C19.966 7.976 20.075 7.558 19.947 7.179Z"
      />
    </svg>
  )
}
