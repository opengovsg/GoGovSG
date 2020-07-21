import React, { FunctionComponent } from 'react'

type SearchSortIconProps = {
  size: number
  color?: string
}

const SearchSortIcon: FunctionComponent<SearchSortIconProps> = ({
  size,
  color = '#384A51',
}: SearchSortIconProps) => {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <path
        d="M16.25 6.25H27.5V8.75H16.25V6.25ZM2.5 8.75H11.25V11.25H13.75V3.75H11.25V6.25H2.5V8.75ZM11.25 21.25H27.5V23.75H11.25V21.25ZM23.75 13.75H27.5V16.25H23.75V13.75ZM21.25 18.75V11.265H18.75V13.75H2.5V16.25H18.75V18.75H21.25ZM8.75 26.25V18.75H6.25V21.25H2.5V23.75H6.25V26.25H8.75Z"
        fill={color}
      />
    </svg>
  )
}

export default SearchSortIcon
