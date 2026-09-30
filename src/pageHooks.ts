import { useEffect } from 'react'
import { APP_NAME } from './constants'
import { setCurrentPage, type PageKind } from './webmcp/describe'

export const HOME_TITLE = `${APP_NAME}. Danish for English speakers`

/** Sets the document title and tells `describe` which page is on screen. */
export function usePage(page: PageKind, title: string): void {
  useEffect(() => {
    document.title = title
    setCurrentPage(page)
  }, [page, title])
}
