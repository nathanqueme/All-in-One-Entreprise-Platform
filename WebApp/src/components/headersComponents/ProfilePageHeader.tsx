import React from 'react'
import Colors from '../../assets/Colors'
import TextStyles from '../../styles/TextStyles'
import { HeaderCloseButton } from '../Buttons'




interface ProfilePageHeaderInterface {
    username: string
    onClose: any
}
export function ProfilePageHeader({ username, onClose }: ProfilePageHeaderInterface) {
    return (
        <div className='flex items-center justify-between' style={{ height: 44.5, paddingLeft: 20, paddingRight: 20 }}>
            <div className='flex items-center justify-center'>
                <HeaderCloseButton
                    onClose={() => { onClose() }}
                    closeButtonType={"chevronLeft"}
                />
                <p style={Object.assign({}, TextStyles.bold19, {
                    color: Colors.black,
                    paddingLeft: 14,
                    marginTop: -4
                })}>{username}</p>
            </div>

            {/* May have buttons here in futur versions*/}

        </div>
    )
}



