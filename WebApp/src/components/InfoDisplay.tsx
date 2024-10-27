import React, { useState } from 'react'
import Colors from '../assets/Colors'
import { PhoneNumber, Timetables } from '../Data'
import TextStyles from '../styles/TextStyles'
import { getInfoMetada, InformationMetada, InformationType } from '../Types'
import { checkIfIsInTimeInterval, getCurrentDay, getDailyTimetableDescription, getDailyTimetablesOfGivenDay, getDayName, getIsOpenOrAvailableText, getTemporaryTimeDescriptiveText } from './functions'
import { ChevronRight, ClockIcon, CopyIcon, EllipsisIcon, EmailIcon, MapPinIcon, PencilIcon, PersonIcon, PhoneIcon, TextIcon, WebsiteIcon } from './Icons'
import { getTimetablesDescriptiveText } from './TimetablesRelated'






interface InfoWithSymbolUIInterface {
  infoType: InformationType
  infoValue: any
  pressable: boolean
  customDisplayName?: string
  displayInBlue?: boolean
  displayNameInstead?: boolean
  displayChevron?: boolean
  setSelectedInfoType: (_: InformationType) => any
  setSelectedInfoValue: (_: any) => any
  backgroundColor?: string
  paddingLeft?: number
  paddingRight?: number
  isSelected?: boolean
  phoneNumber?: PhoneNumber
  displayInfoTypeName?: boolean
  blackAppearance?: boolean
}
/**
 *  An information in a row with its symbol at the left and its value at the rigth.
 * 
 * Supports displaying a "Translate text" button.
 */
export function InfoWithSymbolUI({ infoType, infoValue, pressable, customDisplayName = "", displayInBlue = false, displayNameInstead = false, displayChevron = false, setSelectedInfoType, setSelectedInfoValue, backgroundColor = Colors.whiteToGray2, paddingLeft = 12, paddingRight = 12, isSelected = false, phoneNumber, displayInfoTypeName = false, blackAppearance = false }: InfoWithSymbolUIInterface) {


  // Values 
  let brightness = blackAppearance ? "brightness-50" : "brightness-95"
  let infoMetada = getInfoMetada(infoType)
  let parentDivClassName = 'flex justify-between items-center'


  let ui =
    <div className={`flex justify-between items-center ${pressable ? `${isSelected ? brightness : ""} active:${brightness} cursor-pointer` : ""}`} style={{ paddingLeft: paddingLeft, paddingRight: paddingRight, paddingTop: 12, paddingBottom: 12, width: "100%", backgroundColor: backgroundColor }}
      onClick={() => {
        if (pressable) {
          setSelectedInfoType(infoType)
          setSelectedInfoValue(infoValue)
        }
      }}
    >
      <div className='flex justify-start items-center overflow-hidden'>
        <InfoSymbol infoType={infoType} color={blackAppearance ? "white" : undefined} />
        
        <div className='flex overflow-hidden' style={{ marginLeft: paddingLeft, marginRight: paddingRight + 10 }}>
          {infoType !== 'timetables' ?
            <DefaultInfoUi
              infoValue={infoValue}
              infoMetada={infoMetada}
              displayInBlue={displayInBlue}
              customDisplayName={customDisplayName}
              displayNameInstead={displayNameInstead}
              displayInfoTypeName={displayInfoTypeName}
            />
            :
            <TimetablesInfoUi
              timetables={infoValue}
              infoMetada={infoMetada}
              blackAppearance={blackAppearance}
            />
          }
        </div>
      </div>

      {displayChevron &&
        <ChevronRight />
      }

    </div>




  if ((infoMetada?.type === "website_link") || (infoMetada?.type === "link")) {
    return (
      <a href={infoValue} target="_blank" className={parentDivClassName} style={{ width: "100%" }}>
        {ui}
      </a>
    )
  } else if (infoMetada.type === "email") {
    return (
      <a href={`mailto:${infoValue}`} className={parentDivClassName} style={{ width: "100%" }}>
        {ui}
      </a>
    )
  } else if (infoMetada.type === "phoneNumber") {

    // Values
    let callUrl = `tel:+` + (phoneNumber?.calling_code ?? "") + (phoneNumber?.number.replace("0", "") ?? "")

    return (
      <a href={callUrl} className={parentDivClassName} style={{ width: "100%" }}>
        {ui}
      </a>
    )
  }
  else return (
    ui
  )
}








interface InfoSymbolInterface {
  infoType: InformationType
  color?: string
}
/**
 * Displays the correct info symbol based on the provided infoType.
*/
export function InfoSymbol({ infoType, color }: InfoSymbolInterface) {
  return (
    <div className='flex items-center justify-center' style={{ width: 24, height: 24 }}>
      {
        (() => {
          switch (infoType as InformationType) {
            case 'location_in_place':
            case 'geolocation': return <MapPinIcon fontSize={26} color={color} />
            case 'phoneNumber': return <PhoneIcon fontSize={24} color={color} />
            case 'link':
            case 'website_link': return <WebsiteIcon fontSize={23} color={color} />
            // Deprecated
            // case 'twitter_link': return <Image style={styles.imageStyle} source={require(icons_folder + '/twitter.png')} />
            // case 'youtube_link': return <Image style={styles.imageStyle} source={require(icons_folder + '/youtube.png')} />
            // 
            case 'account_name': return <TextIcon fontSize={24} color={color} />
            case 'email': return <EmailIcon fontSize={24} color={color} />
            case 'username': return <PersonIcon fontSize={25} color={color} />
            case 'timetables': return <ClockIcon fontSize={24} color={color} />
            case 'options': return <EllipsisIcon fontSize={22} color={color} />
            case 'category': return <CopyIcon color={color} fontSize={22} />
            default: return <PencilIcon fontSize={24} color={color} />
          }
        })()
      }
    </div>
  )
}








interface TimetablesInfoUiInterface {
  timetables: Timetables
  infoMetada: InformationMetada
  blackAppearance?: boolean
}
/**
 - A view that displays the open or available (#) state, the current day's name and day number and 'See more' text at the bottom.
 - When timetables are undefined displays a 'EmptyInfoUi'.
 - (#) : 'Open' / 'Closed' or 'Available'/'Not available'
*/
export function TimetablesInfoUi({ timetables, infoMetada, blackAppearance = false }: TimetablesInfoUiInterface) {


  // Values 
  const text_color = blackAppearance ? "white" : Colors.black
  let hasTimetables = (timetables !== undefined) && ((timetables?.daily_timetables?.length ?? 0) > 0)
  let currentDay = getCurrentDay()
  let yesterdayDailyTimetables = hasTimetables ? getDailyTimetablesOfGivenDay(currentDay === 0 ? 6 : currentDay - 1, timetables.daily_timetables) : undefined
  let currentDayDailyTimetables = hasTimetables ? getDailyTimetablesOfGivenDay(currentDay, timetables.daily_timetables) : undefined



  // -> today's dailyTimetables may be like 17H00 - 18H00 but yesterday's dailyTimetable may be like 17H00 - 05H00 so if it is currently 04H00 "isOpenOrAvailableTodayWithOtherDay" is true.
  let isOpenOrAvailableTodayWithOtherDay = hasTimetables ? yesterdayDailyTimetables?.map(e => {
    let output = checkIfIsInTimeInterval(e)
    return output.isInTimeInterval && output.type === "until_time_in_today_and_in_tomorrow"
  })?.includes(true) : undefined
  let isOpenOrAvailableToday = hasTimetables ? currentDayDailyTimetables?.map(e => { return checkIfIsInTimeInterval(e).isInTimeInterval })?.includes(true) : undefined
  let isOpenOrAvailable = isOpenOrAvailableTodayWithOtherDay || isOpenOrAvailableToday
  let isOpenOrAvailableText = hasTimetables ? getIsOpenOrAvailableText(isOpenOrAvailable ?? false, timetables.type) : undefined



  return (
    <div className='flex flex-col justify-start items-start'>
      {/* Special type or Open/Close (Day, Hour - Hour) */}
      {!hasTimetables ?
        <EmptyInfoUi placeholder={infoMetada?.placeholder ?? 'Value'} />
        :
        (timetables?.temporary_time ?? "") !== "" ?
          /* Temporarily closed */
          <p className='line-clamp-1 text-start' style={Object.assign({}, TextStyles.medium15, { color: Colors.red })}>{getTemporaryTimeDescriptiveText(timetables?.temporary_time ?? "off", timetables.type)}</p>
          :
          /* Open • Monday, 06:00 - 22:00 */
          <p className='line-clamp-1 text-start'
            style={Object.assign({}, TextStyles.medium15, { color: text_color })}
          ><span style={{ color: isOpenOrAvailable ? Colors.darkBlue : 'orange' }}>{isOpenOrAvailableText}</span>{' (' + getDayName(getCurrentDay()) + ', ' + currentDayDailyTimetables?.map(e => { return getDailyTimetableDescription(e, timetables.type) }).join(", ") + ')'}</p>
      }

      {/* Timetables type */}
      <p className='line-clamp-1 text-start' style={Object.assign({}, TextStyles.gray13Text)}>{getTimetablesDescriptiveText(timetables?.type ?? "opening_hours", timetables?.subject ?? "")}</p>
    </div >
  )
}














interface DefaultInfoUiInterface {
  infoValue: string
  infoMetada: InformationMetada
  displayInBlue: boolean
  customDisplayName: string
  displayNameInstead: boolean
  displayInfoTypeName?: boolean
}
/**
 * - Displays the text of the info.
 * - When the infoValue is undefined displays a 'EmptyInfoUi'. 
*/
function DefaultInfoUi({ infoValue, infoMetada, displayInBlue, customDisplayName, displayNameInstead, displayInfoTypeName = false }: DefaultInfoUiInterface) {


  if (infoValue === "") {
    return <EmptyInfoUi placeholder={infoMetada?.placeholder ?? 'Value'} />
  } else {
    return (
      <div className='flex flex-col justify-start items-start'>
        <p
          className='text-start line-clamp-1 wordWrap'
          style={Object.assign({},
            TextStyles.medium15, {
            color: displayInBlue ? Colors.darkBlue : Colors.black
          }
          )}>{customDisplayName ? customDisplayName : displayNameInstead ? infoMetada.name : infoValue}</p>
        {displayInfoTypeName &&
          <p className='line-clamp-1 text-start' style={Object.assign({}, TextStyles.gray13Text)}>{infoMetada.name}</p>
        }
      </div>
    )
  }
}











interface EmptyInfoUiInterface {
  placeholder: string
}
/**
 * A gray text of the provided placeholder.
 */
export function EmptyInfoUi({ placeholder }: EmptyInfoUiInterface) {
  return (
    <p className='text-start line-clamp-1 wordWrap' style={Object.assign({}, TextStyles.medium15, { color: 'rgba(192, 192, 192, 1)' })}>{placeholder}</p>
  )
}
