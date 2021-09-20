import {
  createContext,
  createElement,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Render<T = unknown> = Dispatch<SetStateAction<T | undefined>>;
export type ContextType = {
  renderMap: Map<string, Set<Render>>;
  initialKeys: Set<string>;
  cache: { [key: string]: unknown };
};

const context = createContext<ContextType>(undefined as never);
export const Provider = ({
  value,
  children,
}: {
  value?: Partial<ContextType>;
  children?: React.ReactNode;
}) => {
  const v = value || {};
  v.renderMap = new Map<string, Set<Render>>();
  v.initialKeys = new Set<string>();
  v.cache = {};
  return createElement<{ value: ContextType }>(
    context.Provider,
    { value: v as ContextType },
    children
  );
};
const NormalizeKey = (keys: string | string[]) =>
  (Array.isArray(keys) ? keys : [keys]).reduce((a, b) => `${a}[${b}]`, '');

const globalContext = {
  renderMap: new Map<string, Set<Render>>(),
  initialKeys: new Set<string>(),
  cache: {},
};

export const reset = (context: ContextType = globalContext) => {
  const { renderMap, initialKeys, cache } = context;
  renderMap.clear();
  initialKeys.clear();
  Object.keys(cache).forEach((key) => delete cache[key]);
};

export const getCache = <T = unknown>(
  keys: string | string[],
  context: ContextType = globalContext
) => {
  const { cache } = context;
  const key = NormalizeKey(keys);
  const result: { [key: string]: T } = {};
  Object.entries(cache)
    .filter(([k]) => k.indexOf(key) === 0)
    .forEach(([key, value]) => (result[key] = value as T));
  return result;
};
export const setCache = <T = unknown>(
  src: { [key: string]: T },
  context: ContextType = globalContext
) => {
  const { initialKeys, cache } = context;
  Object.entries(src).forEach(([key, value]) => {
    cache[key] = value as T;
    initialKeys.add(key);
  });
};

export const query = <T = unknown>(keys: string | string[], context: ContextType = globalContext) =>
  context.cache[NormalizeKey(keys)] as T;

export const mutate = <T = Object>(
  keys: string | string[],
  data: T | Promise<T> | ((data: T) => T | Promise<T>),
  context: ContextType = globalContext
) => {
  const { renderMap, initialKeys, cache } = context;
  const key = NormalizeKey(keys);
  const value =
    typeof data === 'function' ? (data as (data: T) => T | Promise<T>)(cache[key] as T) : data;
  if (value instanceof Promise) {
    value.then((data) => {
      cache[key] = data;
      renderMap.get(key)?.forEach((render) => render(data));
      initialKeys.add(key);
    });
  } else {
    cache[key] = data;
    renderMap.get(key)?.forEach((render) => render(data));
    initialKeys.add(key);
  }
};

export const useGlobalState: {
  <T>(keys: string | string[], initialData: T | (() => T)): readonly [
    T,
    (data: T | ((data: T) => T)) => void
  ];
  <K = unknown, T = K | undefined>(keys: string | string[]): readonly [
    T,
    (data: T | ((data: T) => T)) => void
  ];
} = <T>(keys: string | string[], initialData?: T | (() => T)) => {
  const c = useContext<ContextType>(context) || globalContext;
  const { renderMap, initialKeys, cache } = c;

  type RenderMap = Map<string, Set<Render<T>>>;
  const key = useMemo(() => NormalizeKey(keys), Array.isArray(keys) ? keys : [keys]);
  const [state, render] = useState<T | undefined>((cache[key] as T) || initialData);
  const dispatch = useCallback(
    (data: T | ((data: T) => T)) => {
      mutate(keys, data, c);
    },
    [key]
  );
  let init = false;
  useEffect(() => {
    const renders = renderMap.get(key)!;
    init && renders.forEach((r) => r(cache[key]));
    return () => {
      (renderMap as RenderMap).get(key)?.delete(render);
    };
  }, []);
  if (initialData !== undefined && !initialKeys.has(key)) {
    cache[key] = typeof initialData === 'function' ? (initialData as () => T)() : initialData;
    initialKeys.add(key);
    init = true;
  }
  const renders = (renderMap as RenderMap).get(key)!;
  if (renders) renders.add(render);
  else (renderMap as RenderMap).set(key, new Set<Render<T>>().add(render));

  return [state, dispatch] as const;
};
