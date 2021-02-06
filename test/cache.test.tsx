import React, { useEffect } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { reset, useGlobalState, getCache, setCache } from '../src/index';

let container: HTMLElement;
beforeEach(() => {
  reset();
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
});

it('cache-test', () => {
  const Component01 = () => {
    const [value] = useGlobalState(['DATA', 'Key1']);
    return <>{value ?? 'undefined'}</>;
  };
  const Component02 = () => {
    const [value, setValue] = useGlobalState(['DATA', 'Key1'], 1);
    useEffect(() => {
      setValue(3);
    }, []);
    return <>{value ?? 'undefined'}</>;
  };
  const Component03 = () => {
    const [value, setValue] = useGlobalState<unknown>(['DATA2', 'Key1'], 2);
    useEffect(() => {
      //Last setValue
      setValue('Effect');
    }, []);
    return <>{value ?? 'undefined'}</>;
  };

  act(() => {
    render(
      <>
        <Component01 />
        <Component02 />
        <Component03 />
      </>,
      container
    );
  });
  expect(container.childNodes).toMatchSnapshot();

  const cache1 = getCache(['DATA']);
  expect(cache1).toMatchSnapshot();
  reset();
  const cache2 = getCache(['DATA']);
  expect(cache2).toMatchSnapshot();
  setCache(cache1);
  const cache3 = getCache(['DATA']);
  expect(cache3).toMatchSnapshot();
  const cache4 = getCache('D');
  expect(Object.keys(cache4).length).toBe(0);
});
