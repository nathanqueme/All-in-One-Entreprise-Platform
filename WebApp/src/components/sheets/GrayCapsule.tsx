import React from "react"
import Colors from '../../assets/Colors'
import { XMarkCircleIcon } from "../Icons"



export default function GrayCapsule() {
    return (
        <div className='flex items-center justify-center' style={{ width: "100%" }}>
            <div style={{
                width: '11%',
                height: 4,
                backgroundColor: Colors.capsuleGray,
                marginTop: 12,
                marginBottom: 12,
                borderRadius: 200
            }} />
        </div>
    )
}


