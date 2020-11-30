import React, { FunctionComponent } from 'react'

type DirectoryUrlIconProps = {
  color?: string
  className?: string
}

const DirectoryUrlIcon: FunctionComponent<DirectoryUrlIconProps> = ({
  className = '',
  color = '#384A51',
}) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M1.81434 12.185C2.46434 12.835 3.31768 13.1597 4.17101 13.1597C5.02501 13.159 5.87901 12.835 6.52834 12.185L8.41368 10.299L7.47101 9.35634L5.58568 11.2423C4.80634 12.0203 3.53768 12.0217 2.75701 11.2423C1.97768 10.4623 1.97768 9.19368 2.75701 8.41368L4.64301 6.52834L3.70034 5.58568L1.81434 7.47101C0.51501 8.77034 0.51501 10.8857 1.81434 12.185ZM12.185 6.52834C13.4837 5.22901 13.4837 3.11368 12.185 1.81434C10.885 0.514344 8.76968 0.515677 7.47101 1.81434L5.58568 3.70034L6.52834 4.64301L8.41368 2.75701C9.19368 1.97901 10.4623 1.97768 11.2423 2.75701C12.0217 3.53701 12.0217 4.80568 11.2423 5.58568L9.35634 7.47101L10.299 8.41368L12.185 6.52834Z"
        fill={color}
      />
      <path
        d="M4.64258 10.3008L3.69979 9.35796L9.35721 3.70073L10.3 4.64355L4.64258 10.3008Z"
        fill={color}
      />
    </svg>
  )
}

export default DirectoryUrlIcon
