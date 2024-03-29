import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { reset, useGlobalState, query, clearCache, getCache, mutate } from '../src/index';

let container: HTMLElement;
beforeEach(() => {
  reset();
  container = document.createElement('div');
  document.body.appendChild(container);
  global.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  container.remove();
});

it('query', () => {
  const Component01 = () => {
    const [value] = useGlobalState(['DATA', 'Key1']);
    return <>{value ?? 'undefined'}</>;
  };
  const Component02 = () => {
    const [value] = useGlobalState(['DATA2', 'Key1'], 1);
    return <>{value ?? 'undefined'}</>;
  };
  const Component03 = () => {
    const [value] = useGlobalState(['DATA', 'Key1'], 2);
    return <>{value ?? 'undefined'}</>;
  };
  const Component04 = () => {
    const value01 = query(['DATA', 'Key1']);
    const value02 = query(['DATA2', 'Key1']);
    return (
      <>
        {value01 || 'undefined'},{value02 || 'undefined'}
      </>
    );
  };
  const root = createRoot(container);
  act(() => {
    root.render(
      <>
        <Component04 />
        <Component01 />
        <Component02 />
        <Component03 />
        <Component04 />
      </>
    );
  });
  expect(container.childNodes).toMatchSnapshot();
  act(() => {
    root.unmount();
  });
});

it('clear', () => {
  const Component01 = () => {
    const [value] = useGlobalState(['DATA', 'Key1']);
    return <>{value ?? 'undefined'}</>;
  };
  const Component02 = () => {
    const [value] = useGlobalState(['DATA2', 'Key1'], 1);
    return <>{value ?? 'undefined'}</>;
  };
  const Component03 = () => {
    const [value] = useGlobalState(['DATA', 'Key1'], 2);
    return <>{value ?? 'undefined'}</>;
  };
  const Component04 = () => {
    const value01 = query(['DATA', 'Key1']);
    const value02 = query(['DATA2', 'Key1']);
    useEffect(() => {
      clearCache('DATA');
    }, []);
    return (
      <>
        {value01 || 'undefined'},{value02 || 'undefined'}
      </>
    );
  };
  const root = createRoot(container);
  act(() => {
    root.render(
      <>
        <Component04 />
        <Component01 />
        <Component02 />
        <Component03 />
        <Component04 />
      </>
    );
  });
  expect(container.childNodes).toMatchSnapshot();
  act(() => {
    root.unmount();
  });
});

it('mutate & clear', () => {
  mutate('cache', 123);
  expect(getCache('cache')).toMatchSnapshot();
  clearCache('cache');
  expect(getCache('cache')).toMatchSnapshot();
});
