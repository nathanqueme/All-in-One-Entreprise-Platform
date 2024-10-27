import React from "react"
import Colors from "../assets/Colors"
import { IconContext } from "react-icons"
import { IoSearch, IoCloseOutline, IoArrowBack, IoImageOutline, IoChevronDown, IoEyeOutline, IoEyeOffOutline, IoCheckmarkCircleOutline, IoCloseCircle, IoEllipsisHorizontalSharp, IoChevronDownCircleSharp, IoLanguage, IoCopyOutline, IoCheckmark } from "react-icons/io5"
import { RiArrowUpDownLine } from "react-icons/ri"
import { MdPersonOutline, MdOutlineQrCode, MdOutlineMap, MdLanguage, MdShortText, MdOutlineEmail, MdShowChart } from "react-icons/md"
import { FiFileText, FiPlus, FiPlusSquare, FiWifiOff, FiSettings, FiInfo, FiCamera } from "react-icons/fi"
import { AiOutlineExclamation, AiOutlineExclamationCircle } from "react-icons/ai"
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineChevronDown, HiBadgeCheck, HiChevronRight, HiOutlinePhone, HiOutlineClock, HiOutlineExclamation } from 'react-icons/hi'
import { ImArrowRight, ImArrowRight2, ImArrowUpRight2 } from 'react-icons/im'
import { BsBoxArrowRight } from 'react-icons/bs'
import { TbFileText } from 'react-icons/tb'
import { BiArrowFromBottom, BiArrowToBottom, BiArrowToTop, BiMap, BiPencil } from 'react-icons/bi'




interface IconInterface {
  color?: string
  size?: string
}


interface Icon2Interface {
  color?: string
  fontSize?: number
}





/**
 * A cross. Used as a clear icon as well as a go back icon.
 */
export function XMarkIcon({ color = Colors.black, size = "1.3em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

      <IoCloseOutline />

    </IconContext.Provider>
  )
}





/**
 * An arrow pointing to the top right.
 */
export function ArrowUpRightIcon({ color = Colors.black, size = "1.3em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

      <ImArrowUpRight2 />

    </IconContext.Provider>
  )
}










/**
 * A foldable map in paper.
 */
export function MapIcon({ color = Colors.black, size = "1.3em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

      <MdOutlineMap />

    </IconContext.Provider>
  )
}









/**
 * A file or paper with text lines icon.
 */
export function FileIcon({ color = Colors.black, size = "1.3em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

      <TbFileText />

    </IconContext.Provider>
  )
}






/**
 * A checkmark on circle with little waves.
*/
export function CertificationBadgeIcon({ color = Colors.darkBlue, size = "1.3em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

      <HiBadgeCheck />

    </IconContext.Provider>
  )
}





/**
  * A QrCode.
*/
export function QrcodeIcon({ color = Colors.black, size = "1.3em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

      {/* IoQrCode (is good as well) */}
      <MdOutlineQrCode />

    </IconContext.Provider>
  )
}



/**
  * A box with an arrow coming out of it and pointing to the right.
*/
export function LogOutIcon({ color = Colors.black, size = "1.3em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

      <BsBoxArrowRight />

    </IconContext.Provider>
  )
}


/**
 * A gear. Used for doing a reference to settings.
*/
export function SettingsIcon({ color = Colors.black, size = "1.3em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

      <FiSettings />

    </IconContext.Provider>
  )
}





/**
 * An arrow with a line pointing to the left.
 */
export function ArrowBackIcon({ color = Colors.black, size = "1.3em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

      <IoArrowBack />

    </IconContext.Provider>
  )
}




/**
 * An arrow with a line pointing to the top and on to the bottom.
 */
export function ArrowUpDownIcon({ color = Colors.black, size = "1.3em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

      <RiArrowUpDownLine />

    </IconContext.Provider>
  )
}


/**
 *  A cross in a circle.
 */
export function XMarkCircleIcon({ color = Colors.black, size = "1.3em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

      <IoCloseCircle />

    </IconContext.Provider>
  )
}




/**
 * A "i" in a circle.
 */
export function InfoCircleIcon({ color = Colors.black, size = "1em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

      <FiInfo />

    </IconContext.Provider>
  )
}



/**
 * A photo
 */
export function PhotoIcon({ color = Colors.black, size = "1em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

      <IoImageOutline />

    </IconContext.Provider>
  )
}





/**
 * A document looking like a pdf
 */
export function PdfIcon({ color = Colors.black, size = "1em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>
        <FiFileText />
    </IconContext.Provider>
  )
}




/**
 * A plus.
 */
export function PlusIcon({ color = Colors.black, size = "1em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

        <FiPlus />
    
    </IconContext.Provider>
  )
}



/**
 * A plus in a rounded rectangle.
 */
export function PlusSquareIcon({ color = Colors.black, size = "1em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>
 
        <FiPlusSquare />
      
    </IconContext.Provider>
  )
}




/**
 * A chevron pointing toward the bottom.
 */
export function ChevronDownIcon({ color = Colors.black, size = "1em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

        <IoChevronDown />
   
    </IconContext.Provider>
  )
}





/**
 * A chevron pointing toward the left.
 */
export function ChevronLeftIcon({ color = Colors.black, size = "1em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

        <HiOutlineChevronLeft />

    </IconContext.Provider>
  )
}




/**
 * A chevron pointing toward the right.
 */
export function ChevronRightIcon({ color = Colors.black, size = "1em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

        <HiOutlineChevronRight />

    </IconContext.Provider>
  )
}









/**
 * A chevron pointing toward the bottom.
 */
export function ChevronBottomIcon({ color = Colors.black, size = "1em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>
        <HiOutlineChevronDown />
    </IconContext.Provider>
  )
}



/**
 * A chevron pointing toward the bottom in a circle that is filled.
 */
export function ChevronBottomFillIcon({ color = Colors.black, size = "1em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

        <IoChevronDownCircleSharp />
     
    </IconContext.Provider>
  )
}







/**
 * A eye or a striked eye icon 
 */
export function EyeIcon({ color = Colors.black, size = "1em", striked }: { color: string, size: string, striked: boolean }) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

        {striked ?
          <IoEyeOffOutline />
          :
          <IoEyeOutline />
        }

    </IconContext.Provider>
  )
}



/**
 * A checkmark in a circle
*/
export function CheckMarkCircle({ color = Colors.black, size = "1em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>
    
        <IoCheckmarkCircleOutline />

    </IconContext.Provider>
  )
}



/**
 * A wifi icon striked
*/
export function NoConnectionIcon({ color = Colors.black, size = "1em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>
 
        <FiWifiOff />
 
    </IconContext.Provider>
  )
}




/**
 * An exlamation circle icon
*/
export function ExclamationMarkCircleIcon({ color = Colors.black, size = "1em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>

        <AiOutlineExclamationCircle />

    </IconContext.Provider>
  )
}


/**
 * An exlamation mark.
*/
export function ExclamationMarkIcon({ color = Colors.black, size = "1em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>
        <AiOutlineExclamation />
    </IconContext.Provider>
  )
}



/**
 * A checkmark circle icon
*/
export function CheckMarkCircleIcon({ color = Colors.black, size = "1em" }: IconInterface) {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>
 
        <IoCheckmarkCircleOutline />
   
    </IconContext.Provider>
  )
}




















// Already styled icons 
// 
//
//
// 
/**
 * A small and gray chevron pointing to the right.
 */
export function ChevronRight() {
  return (
    <ChevronRightIcon size='1.2em' color={Colors.smallGrayText} />
  )
}


/**
 * A small and gray chevron pointing to the bottom.
 */
export function ChevronBottom() {
  return (
    <ChevronBottomIcon size='1.2em' color={Colors.smallGrayText} />
  )
}



























// With fontSize
// 
// 
/**
 * A magnifier
 */
export function SearchIcon({ color = Colors.smallGrayText, fontSize = 21 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
  
        <IoSearch />

    </IconContext.Provider>
  )
}

/**
 * A fat chevron pointing toward the right.
 * Isses : as padding by default on the sides.
 */
export function ChevronRightFatIcon({ color = Colors.black, fontSize = 16 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ style: { fontSize: fontSize, color: color } }}>
  
        <HiChevronRight />
 
    </IconContext.Provider>
  )
}



/**
 * A pin. Used to indicate that the info is an address.
 */
export function MapPinIcon({ color = Colors.black, fontSize = 16 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
      <BiMap />
    </IconContext.Provider>
  )
}




/**
 * A phone.
 */
export function PhoneIcon({ color = Colors.black, fontSize = 16 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
      <HiOutlinePhone />
    </IconContext.Provider>
  )
}





/**
 * The earth.
 */
export function WebsiteIcon({ color = Colors.black, fontSize = 16 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
      <MdLanguage />
    </IconContext.Provider>
  )
}





/**
 * Lines that represent text.
 */
export function TextIcon({ color = Colors.black, fontSize = 16 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
      <MdShortText />
    </IconContext.Provider>
  )
}





/**
 * A postal card.
 */
export function EmailIcon({ color = Colors.black, fontSize = 16 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
      <MdOutlineEmail />
    </IconContext.Provider>
  )
}






/**
 * A person with its head and its neck.
 */
export function PersonIcon({ color = Colors.black, fontSize = 16 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
        <MdPersonOutline />
    </IconContext.Provider>
  )
}





/**
 * A clock.
 */
export function ClockIcon({ color = Colors.black, fontSize = 16 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
        <HiOutlineClock />
    </IconContext.Provider>
  )
}





/**
 * Three dots aligned horizontally.
 */
export function EllipsisIcon({ color = Colors.black, fontSize = 16 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
        <IoEllipsisHorizontalSharp />
    </IconContext.Provider>
  )
}




/**
 * A pencil.
 */
export function PencilIcon({ color = Colors.black, fontSize = 16 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
        <BiPencil />
    </IconContext.Provider>
  )
}


/**
 * An arrow that points to the top and which has a line under it.
 */
 export function ArrowTopIcon({ color = Colors.black, fontSize = 16 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
        <BiArrowFromBottom />
    </IconContext.Provider>
  )
}


/**
 * An exclamation mark in a triangle.
*/
export function ExclamationMarkTriangleIcon({ color = Colors.black, fontSize = 16 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
        <HiOutlineExclamation />
    </IconContext.Provider>
  )
}



/**
 * A camera.
*/
export function CameraIcon({ color = Colors.black, fontSize = 16 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
      <FiCamera />
    </IconContext.Provider>
  )
}



/**
 * An arrow pointing to the right and coming out a rectangle box.
 * Used with the 404 error page to indicate that the user can go back to AtSight's home screen.
 */
export function ArrowRightLeaveBoxIcon({ color = Colors.black, fontSize = 26 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
      <BsBoxArrowRight />
    </IconContext.Provider>
  )
}



/**
 * A chart line that goes up.
*/
export function AnalyticsIcon({ color = Colors.black, fontSize = 26 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
        <MdShowChart />
    </IconContext.Provider>
  )
}



/**
 * A chinese character and a "A" character.
*/
export function LanguageIcon({ color = Colors.black, fontSize = 26 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
      <IoLanguage />
    </IconContext.Provider>
  )
}


/**
 * Two rectangles on top of each other.
 * Used to represent categories.
*/
export function CopyIcon({ color = Colors.black, fontSize = 26 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
      <IoCopyOutline />
    </IconContext.Provider>
  )
}

/**
 * A checkmark
*/
export function CheckMark({color = Colors.black, fontSize = 26 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
        <IoCheckmark />
    </IconContext.Provider>
  )
}

/**
 * An arrow to the right.
 */
 export function ArrowRightIcon({ color = Colors.black, fontSize = 26 }: Icon2Interface) {
  return (
    <IconContext.Provider value={{ color: color, style: { fontSize: fontSize } }}>
      <ImArrowRight2 />
    </IconContext.Provider>
  )
}
