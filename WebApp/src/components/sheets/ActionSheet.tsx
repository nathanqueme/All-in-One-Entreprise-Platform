import React from 'react'
import '../../styles/TextStyles.css'
import Divider from '../Divider'
import TextStyles from '../../styles/TextStyles'
import { isMobileHook } from '../functions'



const isMobile = isMobileHook()



interface ActionSheetInterface {
  options: string[]
  show: boolean
  onClickHide: () => any
  handleClick: (index: number) => any
  description?: string
}
/**
 * A list of tappable options in a white rounded cell that overlays the content and displays a black background.
 */
export default function ActionSheet({ options, show, onClickHide, handleClick, description }: ActionSheetInterface) {
  if (show) {
    return (
      <div className='fixed inset-0 flex justify-center items-center z-50'>

        {/* Black background */}
        <div className='flex w-full h-full absolute z-30 bg-black bg-opacity-70' onClick={() => { onClickHide() }} />


        {/* Alert */}
        <div className="bg-white rounded-xl bg-clip-content z-50"
        >

          {((description ?? "") !== "") &&
            <>
              <div className='flex w-full items-center justify-center' style={{ height: 60 }} >
                <p style={Object.assign({}, TextStyles.gray13Text, { paddingHorizontal: 20 })}>{description}</p>
              </div>
              <Divider />
            </>
          }

          <ul>
            {options.map((e, index) => {
              return (
                <li>
                  {((index !== e.length - 1) && (index !== 0)) &&
                    <Divider />
                  }
                  <ActionSheetButton
                    key={index}
                    option={e}
                    index={index}
                    actionSheetPress={(index) => { handleClick(index) }}
                    isFirstItem={index === 0}
                    isLastItem={index === options.length - 1}
                  />
                </li>
              )
            })}
          </ul>

        </div >


      </div >
    )
  } else {
    return (null)
  }
}





interface ActionSheetButtonInterface {
  option: string
  index: number
  actionSheetPress: (index: number) => any
  isFirstItem: boolean
  isLastItem: boolean
}
/**
 * A text centered with some padding and that is tappable.
 */
function ActionSheetButton({ option, index, actionSheetPress, isFirstItem, isLastItem }: ActionSheetButtonInterface) {
  return (
    <button
      className={`h-12 ${isMobile ? "w-64" : "w-96"} ${isFirstItem ? "rounded-tl-xl rounded-tr-xl" : undefined} ${isLastItem ? "rounded-bl-xl rounded-br-xl" : undefined} active:bg-gray-100`}
      onClick={() => {
        actionSheetPress(index)
      }}><p className='black15' >{option}</p></button>
  )
}



