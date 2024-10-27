import React from "react"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"


export default function App() {

    const location = useLocation()

    useEffect(( ) => {
alert(window.location.hash)
    }, [location])

 return (
     <p>app</p>
 )
}