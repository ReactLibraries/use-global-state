import React, { useEffect } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import {
  reset,
  useGlobalState,
  mutate,
  useMutation,
  useQuery,
  setLocalStorage,
  Provider,
  storageName,
} from '../src/index';

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

it('mutate', async () => {
  const Component01 = () => {
    const [value] = useGlobalState(['DATA', 'Key1']);
    return <>{value ?? 'undefined'}</>;
  };
  const Component02 = () => {
    const [value] = useGlobalState(['DATA2', 'Key1'], 1);
    useEffect(() => {
      const e: StorageEvent = new StorageEvent('storage', {
        key: storageName,
        newValue: JSON.stringify({ 'DATA2/Key1/': 1, 'DATA/Key1/': 20 }),
      });
      dispatchEvent(e);
    }, []);
    return <>{value ?? 'undefined'}</>;
  };
  const Component03 = () => {
    const [value] = useGlobalState(['DATA', 'Key1'], 2);
    return <>{value ?? 'undefined'}</>;
  };
  const Component04 = () => {
    useEffect(() => {
      mutate(['DATA', 'Key1'], 100);
      mutate(['DATA'], 100);
      mutate(['DATA2', 'Key1'], async () => 200);
      mutate(['DATA'], async () => 200);
    }, []);

    return null;
  };
  const Component05 = () => {
    const mutation = useMutation();
    useEffect(() => {
      mutation(['DATA', 'Key2'], 123);
    }, []);

    return null;
  };
  const Component06 = () => {
    const [value1] = useGlobalState(['DATA', 'Key1']);
    const [value2] = useGlobalState(['DATA', 'Key2']);
    const [value3] = useGlobalState(['DATA1', 'Key1']);
    const [value4] = useGlobalState(['DATA2', 'Key1']);
    const query = useQuery();
    const value5 = query(['DATA', 'Key1']);

    return <>{[value1, value2, value3, value4, value5].join(',')}</>;
  };
  localStorage.setItem(storageName, JSON.stringify({ 'DATA2/Key1/': 3 }));
  setLocalStorage();
  await act(async () => {
    render(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      <Provider onUpdate={() => {}}>
        <Component01 />
        <Component02 />
        <Component03 />
        <Component04 />
        <Component05 />
        <Component06 />
      </Provider>,
      container
    );
  });
  setLocalStorage(false);
  expect(container.childNodes).toMatchSnapshot();
});
