
import React from 'react'
import NoConnectionUi from '../ui/NoConnectionUi'
import { WindowHeight } from '../WindowHeight'



interface NoConnectionScreenInterface {
    onClick: () => any
}
/**
 * Displays a blank page with an icon, a short message and a button to try to load the page again.
*/
export default function NoConnectionScreen({ onClick }: NoConnectionScreenInterface) {
    

    // Values 
    const windowHeight = WindowHeight()
    
    
    return (
        <div className='flex flex-col items-center justify-center absolute z-50 top-0 bg-white w-screen overflow-hidden scrollbar-hide' style={{ height: windowHeight }}>
            <NoConnectionUi onClick={() => {
                onClick()
            }} />
        </div>

    )
}







