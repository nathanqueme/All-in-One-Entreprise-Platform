import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Page, RelatedItem } from '../../../Data'
import { ScreenViewTracker } from '../../../analytics'
import { RelatedItemsGrid, RelatedItemsPreviewList } from '../../../components/relatedItemsRelated'
import { getDummyRelatedItems, getSegmentsFromUrl, isMobileHook } from '../../../components/functions'
import { appendRelatedItems, getRelatedItems, selectPagesRelatedItems } from '../../../state/slices/relatedItemsSlice'



const isMobile = isMobileHook()



interface RelatedItemsTabInterface {
  page: Page
  account_name: string
  moreItemsCanBeLoaded: boolean
  showLoadingIndicator: boolean
  onEndReached: () => any
}
/**
 * (LARGE & THIN DEVICES)
 * 
 * The tab that displays a preview of all the related items.
 * 
 * - On large devices is a 3X3 grid with item's photo (mid size square) and name (on overlay at the bottom left).
 * - On thin devices is a list with item's photo (small square) and name (at right / center).
 * 
 */
export default function RelatedItemsTab({ page, account_name, moreItemsCanBeLoaded, showLoadingIndicator, onEndReached }: RelatedItemsTabInterface) {


  // States 
  const [isLoading, setIsLoading] = useState(false)
  const [noConnection, setNoConnection] = useState(false)


  // Values 
  const dispatch = useDispatch()
  const location = useLocation()
  const username = getSegmentsFromUrl(new URL(window.location.href))[0]


  // Global data 
  const pageRelatedItems = useSelector(selectPagesRelatedItems).find(e => { return e.page.username === username })
  let relatedItems = pageRelatedItems?.related_items?.slice()
    // Sorted by most recently created
    .sort(function (a, b) {
      if (a.created_date > b.created_date) { return -1 }
      if (a.created_date < b.created_date) { return 1 }
      return 0
    }) ?? []


  // Values for loading
  const dummyIsUserAccount = false
  let relatedItemsLoaded = ((pageRelatedItems?.page.account_id ?? "") !== "")
  let dummyRelatedItems = getDummyRelatedItems()


  // LOADING CONTENT______________________________________
  async function loadFirstRelatedItems() {

    let relatedItems: RelatedItem[] = []
    try {

      setIsLoading(true)
      relatedItems = await getRelatedItems(page, isMobile ? 12 : 9, undefined, dummyIsUserAccount === false)
      setIsLoading(false)

    } catch (error) {

      setNoConnection(true)
      setIsLoading(false)
      return
    }
    dispatch(appendRelatedItems({ page: page, relatedItems: relatedItems }))

  }
  useEffect(() => {

    if ((page.short_id === "") || isLoading || relatedItemsLoaded) return
    loadFirstRelatedItems()

  }, [page.short_id, location])
  //_______________________________________________________





  return (
    <div>

      {!isMobile && <ScreenViewTracker screen_name={"related_items"} />}

      {/* List or Grid */}
      {isMobile ?
        <RelatedItemsPreviewList
          relatedItems={relatedItemsLoaded ? relatedItems : dummyRelatedItems}
          loadingAppearance={!relatedItemsLoaded}
          short_id={page.short_id}
          account_name={account_name}
          username={username}
          moreItemsCanBeLoaded={moreItemsCanBeLoaded}
          showLoadingIndicator={showLoadingIndicator}
          onEndReached={() => { onEndReached() }}
        />
        :
        <RelatedItemsGrid
          relatedItems={relatedItemsLoaded ? relatedItems : dummyRelatedItems}
          loadingAppearance={!relatedItemsLoaded}
          short_id={page.short_id}
          account_name={account_name}
          username={username}
          showLoadingIndicator={showLoadingIndicator}
          onEndReached={() => {
            onEndReached()
          }}
        />
      }
    </div>
  )
}


