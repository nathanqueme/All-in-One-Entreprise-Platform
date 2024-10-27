//
//  storageRelated.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/09/22
//

import { ResourceType, ContentType } from "../types"


export function getFileName(resource_type: ResourceType, short_id: string, item_id = "", isMenuPdf = true) {
    switch (resource_type) {
        case 'profile_photo': return `p_p/${short_id}.jpeg`
        case 'search_photo': return `s_p/${short_id}.jpeg`
        case 'post': return `p/${short_id}/${item_id}.jpeg`
        case 'related_item': return `r_i/${short_id}/${item_id}.jpeg`
        case 'pdf': return `pdf/${short_id}/${isMenuPdf ? "menu" : "map"}.pdf`
    }
}

export function getContentType(resource_type: ResourceType): ContentType {
    switch (resource_type) {
        case 'pdf': return "application/pdf"
        case 'profile_photo':
        case 'search_photo':
        case 'post':
        case 'related_item':
        default: return "image/jpeg"
    }
}