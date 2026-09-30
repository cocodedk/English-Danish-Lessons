import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { getLesson } from './catalog'
import { DoneRoute } from './pages/Done'
import { Home } from './pages/Home'
import { LessonRoute } from './pages/Lesson'
import { Me } from './pages/Me'
import { NotFound } from './pages/NotFound'
import { Sounds } from './pages/Sounds'
import { usePrefs, useProgress } from './storage/hooks'
import { firstUnlit } from './storage/stores'
import { describeTool } from './webmcp/describe'
import { useWebMcp } from './webmcp/helper'

function LessonRedirect() {
  const lesson = getLesson(useParams().lessonId)
  const progress = useProgress()
  if (!lesson) return <NotFound />
  const position = firstUnlit(progress, lesson.id)?.position ?? 1
  return <Navigate replace to={`/lesson/${lesson.id}/${position}`} />
}

/** The routes and the shell around them: `describe`, and focus on the `h1` after every navigation. */
export function AppRoutes() {
  const { pathname } = useLocation()
  const previous = useRef<string | null>(null)
  const { colorMode } = usePrefs()
  useWebMcp([describeTool])

  // The stored mode on every page, so a change made in another tab applies at once. The same
  // `data-theme` attribute the pre-paint script sets: removed for auto.
  useEffect(() => {
    if (colorMode === 'auto') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', colorMode)
  }, [colorMode])

  useEffect(() => {
    if (previous.current !== null && previous.current !== pathname) {
      document.querySelector<HTMLElement>('h1')?.focus()
    }
    previous.current = pathname
  }, [pathname])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lesson/:lessonId" element={<LessonRedirect />} />
      <Route path="/lesson/:lessonId/done" element={<DoneRoute />} />
      <Route path="/lesson/:lessonId/:position" element={<LessonRoute />} />
      <Route path="/sounds" element={<Sounds />} />
      <Route path="/me" element={<Me />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
