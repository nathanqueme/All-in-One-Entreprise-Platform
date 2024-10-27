

// @ts-check
import './../App.css'
import React from 'react'
import { Link } from "react-router-dom"



export function BackButton() {
    return (
        <Link to={"/"}>
            <p style={{ fontSize: 18, fontWeight: "500", color: "#17A6FF", textDecoration: "underline" }}>{"Go back home"}</p>
        </Link>
    )
}