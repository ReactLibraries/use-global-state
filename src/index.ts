import {
  createContext,
  createElement,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type CacheType = { [key: string]: unknown };
type UpdateType = (newValue: CacheType, oldValue: CacheType) => void;
type Render<T = unknown> = Dispatch<SetStateAction<T | undefined>>;
export type ContextType = {
  renderMap: Map<string, Set<Render>>;
  initialKeys: Set<string>;
  initialDatas: Map<string, unknown>;
  updateEvents: Set<UpdateType>;
  cache: CacheType;
};

const context = createContext<ContextType>(undefined as never);
export const Provider = ({
  value,
  onUpdate,
  children,
}: {
  value?: CacheType;
  onUpdate?: UpdateType;
  children?: React.ReactNode;
}) => {
  const c = useContext<ContextType>(context);
  const v = c || createContextValue(value);
  if (onUpdate) {
    v.updateEvents.add(onUpdate);
  }
  useEffect(() => {
    return () => {
      onUpdate && v.updateEvents.delete(onUpdate);
    };
  }, [onUpdate]);

  if (value) v.cache = { ...v.cache, ...value };
  Object.entries(v.cache).forEach(([key]) => {
    v.initialKeys!.add(key);
  });
  return createElement<{ value: ContextType }>(
    context.Provider,
    { value: v as ContextType },
    children
  );
};
const NormalizeKey = (keys: string | string[]) =>
  (Array.isArray(keys) ? keys : [keys]).reduce((a, b) => `${a}${encodeURIComponent(b)}/`, '');

const createContextValue = (cache: CacheType = {}) => {
  const context = {
    renderMap: new Map<string, Set<Render>>(),
    initialKeys: new Set<string>(),
    initialDatas: new Map<string, unknown>(),
    updateEvents: new Set<UpdateType>(),
    cache,
  };
  Object.entries(cache).forEach(([key, value]) => {
    context.initialKeys.add(key);
    context.initialDatas.set(key, value);
  });
  return context;
};
const globalContext = createContextValue();

export const reset = (context: ContextType = globalContext) => {
  const { renderMap, initialKeys, cache } = context;
  renderMap.clear();
  initialKeys.clear();
  Object.keys(cache).forEach((key) => delete cache[key]);
};

export const clearCache = (keys: string | string[], context: ContextType = globalContext) => {
  const { renderMap, initialKeys, initialDatas, cache } = context;
  const key = NormalizeKey(keys);
  Object.keys(cache)
    .filter((k) => k.indexOf(key) === 0)
    .forEach((key) => {
      initialKeys.delete(key);
      delete cache[key];
      renderMap.get(key)?.forEach((render) => render(initialDatas.get(key)));
    });
};

export const getCache = <T = unknown>(
  keys: string | string[],
  cache: CacheType = globalContext.cache
) => {
  const key = NormalizeKey(keys);
  const result: { [key: string]: T } = {};
  Object.entries(cache)
    .filter(([k]) => k.indexOf(key) === 0)
    .forEach(([key, value]) => (result[key] = value as T));
  return result;
};
export const setCache = <T = unknown>(src: CacheType, context: ContextType = globalContext) => {
  const { initialKeys, cache } = context;
  Object.entries(src).forEach(([key, value]) => {
    cache[key] = value as T;
    initialKeys.add(key);
  });
};

export const createContextCache = (values: ReadonlyArray<readonly [string | string[], unknown]>) =>
  Object.fromEntries(values.map(([key, value]) => [NormalizeKey(key), value]));

export const query = <T = unknown>(keys: string | string[], context: ContextType = globalContext) =>
  context.cache[NormalizeKey(keys)] as T;

export const mutate = <T = Object>(
  keys: string | string[],
  data: T | Promise<T> | ((data: T) => T | Promise<T>),
  context: ContextType = globalContext
) => {
  const { renderMap, initialKeys, updateEvents, cache } = context;
  const key = NormalizeKey(keys);
  const value =
    typeof data === 'function' ? (data as (data: T) => T | Promise<T>)(cache[key] as T) : data;
  const old = { ...cache };
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
  updateEvents.forEach((update) => update(cache, old));
};

export const useQuery = () => {
  const c = useContext<ContextType>(context) || globalContext;
  return <T = unknown>(keys: string | string[]) => query<T>(keys, c);
};

export const useMutation = () => {
  const c = useContext<ContextType>(context) || globalContext;
  return <T>(keys: string | string[], state: T | Promise<T> | ((data: T) => T | Promise<T>)) =>
    mutate<T>(keys, state, c);
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
  const key = useMemo(() => NormalizeKey(keys), Array.isArray(keys) ? keys : [keys]);
  const property = useRef<{ keyName: string }>({ keyName: key }).current;
  const con = useContext<ContextType>(context) || globalContext;
  const { renderMap, initialKeys, initialDatas, updateEvents, cache } = con;

  type RenderMap = Map<string, Set<Render<T>>>;
  const [state, render] = useState<T | undefined>(
    cache[key] === undefined ? initialData : (cache[key] as T)
  );
  const dispatch = useCallback(
    (data: T | ((data: T) => T)) => {
      mutate(keys, data, con);
    },
    [key, con]
  );
  let init = false;
  useEffect(() => {
    const renders = renderMap.get(key)!;
    init && renders.forEach((r) => r(cache[key]));
    return () => {
      init = false;
      (renderMap as RenderMap).get(key)?.delete(render);
    };
  }, [key]);
  if (initialData !== undefined && !initialKeys.has(key)) {
    const value = typeof initialData === 'function' ? (initialData as () => T)() : initialData;
    initialKeys.add(key);
    initialDatas.set(key, value);
    const old = { ...cache };
    cache[key] = value;
    updateEvents.forEach((update) => update(cache, old));
    init = true;
  }
  const renders = (renderMap as RenderMap).get(key)!;
  if (renders) renders.add(render);
  else (renderMap as RenderMap).set(key, new Set<Render<T>>().add(render));
  if (property.keyName !== key) {
    property.keyName = key;
    const value = cache[key] === undefined ? initialData : (cache[key] as T);
    render(value);
    return [value, dispatch] as const;
  }
  return [state, dispatch] as const;
};
