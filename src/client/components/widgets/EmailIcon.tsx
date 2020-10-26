import React, { FunctionComponent } from 'react'

type EmailIconProps = {
  size: number
  color?: string
}

const EmailIcon: FunctionComponent<EmailIconProps> = ({
  size,
  color = '#384A51',
}: EmailIconProps) => {
  return (
    <svg
      width="26"
      height="20"
      viewBox="0 0 26 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <path d="M23 0H3C1.62125 0 0.5 1.12125 0.5 2.5V17.5C0.5 18.8787 1.62125 20 3 20H23C24.3787 20 25.5 18.8787 25.5 17.5V2.5C25.5 1.12125 24.3787 0 23 0ZM23 2.5V3.13875L13 10.9175L3 3.14V2.5H23ZM3 17.5V6.305L12.2325 13.4862C12.4575 13.6625 12.7288 13.75 13 13.75C13.2712 13.75 13.5425 13.6625 13.7675 13.4862L23 6.305L23.0025 17.5H3Z" 
      fill={color}/>
    </svg>
  )
}

export default EmailIcon
