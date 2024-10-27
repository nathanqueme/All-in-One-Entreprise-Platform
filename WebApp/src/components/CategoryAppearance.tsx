import React, { useState, useEffect } from 'react'
import colors from '../assets/Colors'
import TextStyles from '../styles/TextStyles'
import { Link } from 'react-router-dom'
import { ChevronRightFatIcon } from './Icons'
import { isMobileHook } from './functions'


const isMobile = isMobileHook()


interface CategoryAppearanceInterface {
    title: string
    itemsCount?: number
    loadingAppearance?: boolean
    children: any
    subtitle?: string
    categoryId: string
    hideItemsCountButton?: boolean
    wasCreated?: boolean
    username: string
}
/**
 * Used in combination with an horizontal scrollview to display a title and subtitle a its top left corner. 
*/
export default function CategoryAppearance({ title, itemsCount = 0, loadingAppearance = false, children, subtitle = "", categoryId, hideItemsCountButton = false, wasCreated = false, username }: CategoryAppearanceInterface) {


    // States
    const [wasCreatedAppearance, setWasCreatedAppearance] = useState(false)


    // Values 
    const paddingOnDevices = isMobile ? 20 : 0


    useEffect(() => {

        if (wasCreated) {
            setWasCreatedAppearance(true)
            setTimeout(() => {
                setWasCreatedAppearance(false)
            }, 950)
        }

    }, [wasCreated])



    // UI 
    let ui =
        <div
            className='flex items-center justify-between w-full' style={{
                paddingBottom: 13, // Originaly 8
                paddingTop: 13, // Originaly 8
                paddingLeft: paddingOnDevices,
                paddingRight: paddingOnDevices,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>

            {/* Name + description */}
            <div className='flex flex-col items-start justify-center'>
                <p className='line-clamp-1' style={Object.assign({}, TextStyles.medium15, {
                    color: loadingAppearance ? colors.clear : colors.black,
                    backgroundColor: loadingAppearance ? colors.softGray : colors.clear
                })}>{title}</p>
                <p className='line-clamp-1' style={{
                    fontSize: 12,
                    paddingTop: 2, // NEW
                    color: loadingAppearance ? colors.clear : colors.smallGrayText
                }}>{subtitle}</p>
            </div>

            {/* Post count */}
            {(!loadingAppearance && !hideItemsCountButton) &&
                <CounterCapsule itemsCount={itemsCount} />
            }

        </div>


    return (
        <div
            className='flex flex-col justify-start items-center w-max pb-8'
            style={{
                width: '100%',
                backgroundColor: wasCreatedAppearance ? colors.newItemBlue : colors.clear,
            }}
        >
            {/* Top : info */}
            {loadingAppearance ?
                ui
                :
                <Link
                    to={`/p?c=${categoryId}/`}
                    className='flex items-center justify-between w-full'
                >
                    {ui}
                </Link>
            }

            {/* Content */}
            {children}
        </div >
    )
}






interface CounterCapsuleInterface {
    itemsCount: number
    displayChevron?: boolean
}
/**
 * A gray capsule that displays a number in black and optionally a chevron.
 */
function CounterCapsule({ itemsCount, displayChevron = true }: CounterCapsuleInterface) {
    return (
        <div className={`flex items-center justify-center ${!isMobile && "active:brightness-95"}`} style={{
            backgroundColor: colors.softGray,
            padding: 3,
            paddingLeft: 7,
            paddingRight: 7,
            borderRadius: 4.5
        }}>
            <p className='text-black ' style={TextStyles.medium15}>{itemsCount}</p>

            {displayChevron &&
                <div style={{
                    // <-- Removes unwanted padding of the icon for that size.
                    marginLeft: -5,
                    marginRight: -5,
                    marginTop: -2.5,
                    marginBottom: -2.5,
                    // -->
                    paddingLeft: 4,
                    paddingTop: 1 // align it properly
                }}>
                    <ChevronRightFatIcon color={colors.black} fontSize={18} />
                </div>
            }
        </div>
    )
}





