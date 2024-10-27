import React, { useState, useEffect } from "react"



export const WindowHeight = () => {

    // States
    const [height, setHeight] = useState(window.innerHeight)
  
  
    function handleResize() {
      setHeight(window.innerHeight)
      // console.log("Window Height changed")
    }
  
    // Initialization
    useEffect(() => {
  
      handleResize()
      // Tracks updates 
      window.addEventListener("resize", handleResize)
  
      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }, [setHeight])
  
  
    return height
  }