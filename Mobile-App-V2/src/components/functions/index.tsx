

// Actions
export { call as call } from './Actions'
export { sendMessage as sendMessage } from './Actions'
export { writeEmail as writeEmail } from './Actions'
export { openLinkWithInAppWeb as openLinkWithInAppWeb } from './Actions'


// Address related
export { openAddressInMaps as openAddressInMaps } from './AddressRelated'
export { copyString as copyString } from './AddressRelated'
export { shareAddress as shareAddress } from './AddressRelated'
export { getAddressDescription as getAddressDescription } from './AddressRelated'
export { simpleAddressDescription as simpleAddressDescription } from './AddressRelated'
export { getGeohash as getGeohash } from './AddressRelated'
export { getGoogleMapsAddressUrl as getGoogleMapsAddressUrl } from './AddressRelated'
export { getAppleMapsAddressUrl as getAppleMapsAddressUrl } from './AddressRelated'
export { convertAddressToUtf8 as convertAddressToUtf8 } from './AddressRelated'


// Checks 
export { isAnEmail as isAnEmail } from './Checks'
export { checkUsernameValidity as checkUsernameValidity } from './Checks'
export { checkPhoneValidity as checkPhoneValidity } from './Checks'
export { checkLinkValidity as checkLinkValidity } from './Checks'
export { arrayEquals as arrayEquals } from './Checks'


// Content related
export { loadImage as loadImage } from './ContentRelated'
export { loadImageBase64 as loadImageBase64 } from './ContentRelated'
export { getBase64 as getBase64 } from './ContentRelated'
export { getImageDimensionRatio as getImageDimensionRatio } from './ContentRelated'
export { getImageDimension as getImageDimension } from './ContentRelated'


// Conversions, generations and obtentions
export { FileNameType as FileNameType } from './ConvertionsGenerationsObtentions'
export { getFileName as getFileName } from './ConvertionsGenerationsObtentions'
export { getLocalizedTextText as getLocalizedTextText } from './ConvertionsGenerationsObtentions'
export { getLocalizedTextLocale as getLocalizedTextLocale } from './ConvertionsGenerationsObtentions'
export { generateID as generateID } from './ConvertionsGenerationsObtentions'
export { getPhoneNumberDescription as getPhoneNumberDescription } from './ConvertionsGenerationsObtentions'
export { capitalize as capitalize } from './ConvertionsGenerationsObtentions'
export { animateNonAnimatableValue as animateNonAnimatableValue } from './ConvertionsGenerationsObtentions'
export { animateAnimatableValue as animateAnimatableValue } from './ConvertionsGenerationsObtentions'
export { awaitXMilliSeconds as awaitXMilliSeconds } from './ConvertionsGenerationsObtentions'
export { getDummyPostCategories as getDummyPostCategories } from './ConvertionsGenerationsObtentions'
export { getDummyRelatedItems as getDummyRelatedItems } from './ConvertionsGenerationsObtentions'
export { sanitizeString as sanitizeString } from './ConvertionsGenerationsObtentions'
export { getYearMonthDate as getYearMonthDate } from './ConvertionsGenerationsObtentions'

// For content editors 
export { generateSimplifiedTextLocalization as generateSimplifiedTextLocalization } from './ForContentEditors'
export { generateSimplifiedLocalizedText as generateSimplifiedLocalizedText } from './ForContentEditors'
export { geolocationWasChangedChecker as geolocationWasChangedChecker } from './ForContentEditors'
export { allPhoneNumberWasChangedChecker as allPhoneNumberWasChangedChecker } from './ForContentEditors'
export { phoneNumberWasChangedChecker as phoneNumberWasChangedChecker } from './ForContentEditors'
export { descriptionWasChangedChecker as descriptionWasChangedChecker } from './ForContentEditors'
export { descriptionLocalizationWasChangedChecker as descriptionLocalizationWasChangedChecker } from './ForContentEditors'
export { linkWasChangedChecker as linkWasChangedChecker } from './ForContentEditors'
export { timetablesWereChangedChecker as timetablesWereChangedChecker } from './ForContentEditors'
export { textHasEmojis as textHasEmojis } from './ForContentEditors'
export { handleTextAndPreventEmojis as handleTextAndPreventEmojis } from './ForContentEditors'


// For developpment
export { logBatchTranslationInDevelopment as logBatchTranslationInDevelopment } from './ForDeveloppment'
export { logStaticImageBase64 as logStaticImageBase64 } from './ForDeveloppment'


// Search related
export { stringWithoutAccents as stringWithoutAccents } from './SearchRelated'
export { stringInSearchQueryFormat as stringInSearchQueryFormat } from './SearchRelated'


// Time related
export { getCurrentDay as getCurrentDay } from './TimeRelated'
export { getDailyTimetablesOfGivenDay as getDailyTimetablesOfGivenDay } from './TimeRelated'
export { timeToDate as timeToDate } from './TimeRelated'
export { dateToTime as dateToTime } from './TimeRelated'
export { localizedTimeString as localizedTimeString } from './TimeRelated'
export { getDayName as getDayName } from './TimeRelated'
export { getDailyTimetableDescription as getDailyTimetableDescription } from './TimeRelated'
export { generateDefaultDailyTimetables as generateDefaultDailyTimetables } from './TimeRelated'
export { getTemporaryTimeDescriptiveText as getTemporaryTimeDescriptiveText } from './TimeRelated'
export { TimeIntervalType as TimeIntervalType } from './TimeRelated'
export { IsInTimeIntervalOutput as IsInTimeIntervalOutput } from './TimeRelated'
export { IsInTimeIntervalOutputObj as IsInTimeIntervalOutputObj } from './TimeRelated'
export { checkIfIsInTimeInterval as checkIfIsInTimeInterval } from './TimeRelated'
export { getIsOpenOrAvailableText as getIsOpenOrAvailableText } from './TimeRelated'
export { getHourSliceDescription as getHourSliceDescription } from './TimeRelated'
export { getPreviousMonthDate as getPreviousMonthDate } from './TimeRelated'
export { getNextMonthDate as getNextMonthDate } from './TimeRelated'
export { getHourSlice as getHourSlice } from './TimeRelated'
export { isDST as isDST } from './TimeRelated'
export { dateWithoutDST as dateWithoutDST } from './TimeRelated'


// Url related
export { getSegmentsFromUrl as getSegmentsFromUrl } from './UrlRelated'
export { getParamsFromUrl as getParamsFromUrl } from './UrlRelated'
export { getTopLevelDomain as getTopLevelDomain } from './UrlRelated'







