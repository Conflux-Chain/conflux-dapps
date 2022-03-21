import * as React from 'react'

function SvgFluent(props) {
  return (
    <svg
      width={64}
      height={64}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <mask
        id="fluent_svg__a"
        style={{
          maskType: 'alpha',
        }}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={64}
        height={64}
      >
        <path fill="#fff" d="M0 0h64v64H0z" />
      </mask>
      <g mask="url(#fluent_svg__a)">
        <path
          d="M60 4v9.01c0 10.37-8.33 18.796-18.669 18.964l-.314.002H32v9.032C32 51.678 23.53 60 13.094 60H4v-9.277-20.169C4 15.889 15.9 4 30.577 4H60z"
          fill="#fff"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M47.979 4H60v9.008C60 23.678 51.53 32 41.094 32H32v-9.27C32 13.278 38.922 5.44 47.979 4z"
          fill="#242265"
          fillOpacity={0.8}
        />
        <path
          d="M60 4v9.01c0 10.37-8.33 18.796-18.669 18.964l-.314.002H32v9.032C32 51.678 23.53 60 13.094 60H4v-9.277-20.169C4 15.889 15.9 4 30.577 4H60z"
          fill="#616EE1"
          fillOpacity={0.8}
        />
      </g>
    </svg>
  )
}

export default SvgFluent
