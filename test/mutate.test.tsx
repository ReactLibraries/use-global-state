import React, { useEffect } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { reset, useGlobalState, mutate } from '../src/index';

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
  await act(async () => {
    render(
      <>
        <Component01 />
        <Component02 />
        <Component03 />
        <Component04 />
      </>,
      container
    );
  });
  expect(container.childNodes).toMatchSnapshot();
});
