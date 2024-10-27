
// @ts-check
import React from "react"




export function Section({ title, text , paddingTop = 0 }) {
    return (
        <div style={{ paddingTop: paddingTop }}>
            <MainSectionTitle text={title} />

            <PlainText text={text} />
        </div>
    )
}





export function MainSectionTitle({ text }) {
    return (
        <p style={{
            color: "black",
            fontSize: 22,
            fontWeight: "700",
        }}>{text}</p>
    )
}




export function PlainText({ text }) {
    return (
        <p style={{
            fontSize: 18,
            fontWeight: "500",
            color: "black",
        }}
        >{text}</p>
    )
}




export function GrayDescription({ text }) {
    return (
        <p style={{
            fontSize: 18,
            fontWeight: "500",
            color: "gray",
            fontStyle: 'italic'
        }}
        >{text}</p>
    )
}