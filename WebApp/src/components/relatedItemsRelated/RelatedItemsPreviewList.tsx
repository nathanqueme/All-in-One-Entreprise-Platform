//
//  RelatedItemsPreviewList.tsx
//  atsight_web_version
//
//  Created by Nathan Queme the 11/09/22
//

import React, { useState } from 'react'
import TextStyles from '../../styles/TextStyles'
import localization from '../../utils/localizations'
import RelatedItemUiPreview from './RelatedItemUiPreview'
import { SimpleCenteredButton } from '../Buttons'
import { capitalize } from '../functions'
import { RelatedItem } from '../../Data'



interface RelatedItemsPreviewListInterface {
    relatedItems: RelatedItem[]
    loadingAppearance: boolean
    account_name: string
    short_id: string
    username: string
    moreItemsCanBeLoaded: boolean
    showLoadingIndicator: boolean
    onEndReached: () => any
  }
  /**
   * (THIN DEVICES ONLY)
   * 
   * - A list of the related items of the given account.
   * - Appearance : is a list with item's photo (small square) and it's name (at the right).
   */
export default function RelatedItemsPreviewList({ relatedItems, loadingAppearance, account_name, short_id, username, moreItemsCanBeLoaded, showLoadingIndicator, onEndReached }: RelatedItemsPreviewListInterface) {
  
  
    // Values 
    const screenWidth = window.screen.width
    const scalingRatio = screenWidth / 375
  
  
    return (
      <div className='flex flex-col items-start justify-start' style={{ marginTop: 10, marginBottom: 10 }}>
        {relatedItems.length === 0 ?
          <div style={{ paddingTop: 90, width: "100%" }}>
            <p style={TextStyles.noContentFont}>{localization.nothing_to_display}</p>
          </div>
          :
          <>
            {
              relatedItems.map((e: RelatedItem, index: number) => {
                return (
                  <RelatedItemUiPreview
                    key={e.item_id}
                    relatedItem={e}
                    scalingRatio={scalingRatio}
                    wasCreated={false}
                    short_id={short_id}
                    account_name={account_name}
                    username={username}
                    loadingAppearance={loadingAppearance}
                  />
                )
              })
            }
  
            {(moreItemsCanBeLoaded) &&
              <div style={{ marginBottom: 10, marginTop: 10 }}>
                <SimpleCenteredButton
                  text={capitalize(localization.see_more)}
                  onClick={() => {
  
                    onEndReached()
  
                  }}
                  isLoading={showLoadingIndicator}
                />
              </div>
            }
          </>
        }
      </div>
    )
  }
  
  