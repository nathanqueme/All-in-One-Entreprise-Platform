import React from 'react'
import Colors from '../../assets/Colors'
import TextStyles from '../../styles/TextStyles'
import ActivityIndicator from '../ActivityIndicator'
import { HeaderButton, HeaderCloseButton } from '../Buttons'




interface PostsPageHeaderInterface {
  onClose: any
  headertext: string
  percentageOfCategoryMainInfoHidden: any
  isUserAccount: boolean
  isDeleting: boolean
  onAddPostPress?: any
  onClick?: any
}
export default function PostsPageHeader({
  onClose,
  headertext,
  percentageOfCategoryMainInfoHidden,
  isUserAccount,
  isDeleting,
  onAddPostPress,
  onClick,
}: PostsPageHeaderInterface) {


  // Values 
  let textPadding = isUserAccount ? 90 : 55


  return (
    <div className='flex items-center justify-center sticky top-0 z-50' style={{ backgroundColor: Colors.whiteToGray2 }}>
      <div
        className='flex items-center justify-between w-full'
        style={{
          height: 44.5,
          marginLeft: 20,
          marginRight: 20
        }}>

        {/* ChevronLeft */}
        {isDeleting ?
          <div style={{ // Done so that the buttons at the right stay when the go back button disappears
            width: 10,
            height: 10,
            backgroundColor: Colors.clear
          }} />
          :
          <HeaderCloseButton
            onClose={onClose}
            closeButtonType={'chevronLeft'}
          />
        }



        {/* Add post + Ellipsis symbol */}
        {isUserAccount &&
          <div className='flex items-center justify-center'>
            
            <div style={{ paddingRight: 18 }}>
              <HeaderButton
                onClick={onAddPostPress}
                buttonType={'addSymbol'}
              />
            </div>
            
            <div>
              <div style={{ opacity: isDeleting ? 0 : 1 }}>
                <HeaderButton
                  onClick={onClick}
                  buttonType={'ellipsisSymbol'}
                  condition={isDeleting === false}
                />
              </div>
              <div
                className='pointer-events-none'
                style={{ opacity: isDeleting ? 1 : 0, position: "absolute" }}>
                <ActivityIndicator />
              </div>
            </div>

          </div>
        }

      </div>

      {/* Headertext */}
      <div className='absolute left-0 right-0 flex items-center justify-center pointer-events-none' style={{ paddingLeft: textPadding, paddingRight: textPadding, opacity: percentageOfCategoryMainInfoHidden, }}>
        <p className='line-clamp-1' style={TextStyles.headerTextFont}>{headertext}</p>
      </div>

    </div>
  )
}

