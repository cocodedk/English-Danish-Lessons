import { useSyncExternalStore } from 'react'
import { isPersistent, subscribe } from './core'
import { prefsStore, profileStore, progressStore } from './stores'

export const useProfile = () => useSyncExternalStore(subscribe, profileStore.get)
export const useProgress = () => useSyncExternalStore(subscribe, progressStore.get)
export const usePrefs = () => useSyncExternalStore(subscribe, prefsStore.get)
export const usePersistent = () => useSyncExternalStore(subscribe, isPersistent)
