import React from 'react'
import '../styles/TextStyles.css'




interface RedErrorInterface {
    error: string 
    textLeading?: boolean
    marginX?: number
    marginTop?: number
}
export default function RedError({ error, textLeading = false, marginX = 10, marginTop = 0 } : RedErrorInterface) {
  return (
    <p className={`redError ${textLeading ? "text-start":"text-center"} mx-${marginX} mt-${marginTop}`}>{error}</p>
  )
}

