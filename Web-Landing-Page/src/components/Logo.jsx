

// @ts-check
import './../App.css'
import React from 'react'
import { Link } from "react-router-dom"
import logo from './../assets/AtSight_logo.png'




export function Logo({ height = 30 }) {
    return (
        <img
            src={logo}
            style={{ height: height }}
            alt="atSight logo"
        />
    )
}
