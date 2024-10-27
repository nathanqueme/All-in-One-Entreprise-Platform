
// convertionsgenerationsObtentions
export { generateID as generateID } from './convertionsGenerationsObtentions'
export { getIpAddress as getIpAddress } from './convertionsGenerationsObtentions'
export { containsOnlyNumbers as containsOnlyNumbers } from './convertionsGenerationsObtentions'
export { isDeviceIdValid as isDeviceIdValid } from './convertionsGenerationsObtentions'
export { IP_OBSCURIFICATION_KEY as IP_OBSCURIFICATION_KEY } from './convertionsGenerationsObtentions'
export { decryptIpInfo as decryptIpInfo } from './convertionsGenerationsObtentions'
export { setCookie as setCookie } from './convertionsGenerationsObtentions'

// databaseRelated
export { catchReservedWords as catchReservedWords } from './databaseRelated'
export { handleReservedWords as handleReservedWords } from './databaseRelated'
export { handleHumanLanguage as handleHumanLanguage } from './databaseRelated'
export { formatResponseToHandleHL as formatResponseToHandleHL } from './databaseRelated'
export { getOperationSign as getOperationSign } from './databaseRelated'

// encryption
export { encrypt as encrypt } from './encryption'
export { decrypt as decrypt } from './encryption'
export { getJwtTokenHashFromHeader as getJwtTokenHashFromHeader } from './encryption'

// errors
export { Error400Obj as Error400Obj } from './errors'
export { handleWriteActionErrors as handleWriteActionErrors } from './errors'
export { handleS3Errors as handleS3Errors } from './errors'
export { handleCognitoErrors as handleCognitoErrors } from './errors'

// searchRelated
export { stringWithoutAccents as stringWithoutAccents } from './searchRelated'
export { stringInSearchQueryFormat as stringInSearchQueryFormat } from './searchRelated'

// storageRelated
export { getFileName as getFileName } from './storageRelated'
export { getContentType as getContentType } from './storageRelated'

// urlRelated
export { getTopLevelDomain as getTopLevelDomain } from './urlRelated'
export { getMainDomain as getMainDomain } from './urlRelated'