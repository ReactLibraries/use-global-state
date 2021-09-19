import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
type Render<T = unknown> = Dispatch<SetStateAction<T | undefined>>
const renderMap = new Map<string, Set<Render>>()
const initialKyes = new Set<string>()
export const cache: { [key: string]: unknown } = {}

const NormalizeKey = (keys: string | string[]) =>
  (Array.isArray(keys) ? keys : [keys]).reduce((a, b) => `${a}[${b}]`, '')

export const reset = () => {
  renderMap.clear()
  initialKyes.clear()
  Object.keys(cache).forEach((key) => delete cache[key])
}

export const getCache = <T = unknown>(keys: string | string[]) => {
  const key = NormalizeKey(keys)
  const result: { [key: string]: T } = {}
  Object.entries(cache)
    .filter(([k]) => k.indexOf(key) === 0)
    .forEach(([key, value]) => (result[key] = value as T))
  return result
}
export const setCache = <T = unknown>(src: { [key: string]: T }) => {
  Object.entries(src).forEach(([key, value]) => (cache[key] = value as T))
}

export const query = <T = unknown>(keys: string | string[]) => cache[NormalizeKey(keys)] as T

export const mutate = <T = Object>(
  keys: string | string[],
  data: T | Promise<T> | ((data: T) => T | Promise<T>)
) => {
  const key = NormalizeKey(keys)
  const value =
    typeof data === 'function' ? (data as (data: T) => T | Promise<T>)(cache[key] as T) : data
  if (value instanceof Promise) {
    value.then((data) => {
      cache[key] = data
      renderMap.get(key)?.forEach((render) => render(data))
      initialKyes.add(key)
    })
  } else {
    cache[key] = data
    renderMap.get(key)?.forEach((render) => render(data))
    initialKyes.add(key)
  }
}

export const useGlobalState: {
  <T = unknown>(keys: string | string[]): readonly [
    T | undefined,
    (data: T | ((data: T) => T)) => void
  ]
  <T>(keys: string | string[], initialData: T | (() => T)): readonly [
    T,
    (data: T | ((data: T) => T)) => void
  ]
} = <T>(keys: string | string[], initialData?: T | (() => T)) => {
  type RenderMap = Map<string, Set<Render<T>>>
  const key = useMemo(() => NormalizeKey(keys), Array.isArray(keys) ? keys : [keys])
  const [state, render] = useState<T | undefined>((cache[key] as T) || initialData)
  const dispatch = useCallback(
    (data: T | ((data: T) => T)) => {
      mutate(keys, data)
    },
    [key]
  )
  let init = false
  useEffect(() => {
    const renders = renderMap.get(key)!
    init && renders.forEach((r) => r(cache[key]))
    return () => {
      ;(renderMap as RenderMap).get(key)?.delete(render)
    }
  }, [])
  if (initialData !== undefined && !initialKyes.has(key)) {
    cache[key] = typeof initialData === 'function' ? (initialData as () => T)() : initialData
    initialKyes.add(key)
    init = true
  }
  const renders = (renderMap as RenderMap).get(key)!
  if (renders) renders.add(render)
  else (renderMap as RenderMap).set(key, new Set<Render<T>>().add(render))

  return [state, dispatch] as const
}
