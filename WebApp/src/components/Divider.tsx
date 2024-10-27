import React from 'react'



interface DividerInterface {
  marginLeft?: number
  marginRight?: number
  marginTop?: number
  marginBottom?: number
}
export default function Divider({ marginLeft = 0, marginRight = 0, marginTop = 0, marginBottom = 0 }: DividerInterface) {
  return (
    <div className='w-full'>
      <hr
        className={`border-spacing-3`}
        style={{
          marginLeft: marginLeft,
          marginRight: marginRight,
          marginTop: marginTop,
          marginBottom: marginBottom
        }} />
    </div>
  )
}


