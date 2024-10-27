import React, { useState, useEffect } from "react"



export const WindowWidth = () => {

    // States
    const [width, setWidth] = useState(window.innerWidth)
  
  
    function handleResize() {
      setWidth(window.innerWidth)
      // console.log("Window Width changed")
    }
  
    // Initialization
    useEffect(() => {
  
      handleResize()
      // Tracks updates 
      window.addEventListener("resize", handleResize)
  
      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }, [setWidth])
  
  
    return width
  }