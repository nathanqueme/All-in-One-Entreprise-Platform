import React from 'react'
import Colors from '../assets/Colors'



interface SelectedCircleInterface {
    isSelected: boolean
    colorWhenSelected?: string
}
export default function SelectedCircle({ isSelected, colorWhenSelected = Colors.darkBlue }: SelectedCircleInterface) {
    return (
        <div className='flex items-center justify-center'>
            <div className='rounded-full border-2'>
                <div className='w-4 h-4 rounded-full' style={{ backgroundColor: isSelected ? colorWhenSelected : Colors.clear, margin: 2 }}></div>
            </div>
        </div>
    )
}

