import React, { useEffect, useState } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { reset, useGlobalState } from '../src/index';

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

it('initData undefined', () => {
  const Component01 = () => {
    const [value] = useGlobalState(['DATA', 'Key1']);
    return <>{value ?? 'undefined'}</>;
  };
  const Component02 = () => {
    const [value] = useGlobalState(['DATA', 'Key1']);
    return <>{value ?? 'undefined'}</>;
  };
  const Component03 = () => {
    const [value] = useGlobalState(['DATA', 'Key1']);
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
});

it('rename', () => {
  const Component01 = () => {
    const [name, setName] = useState("DATA")
    const [value] = useGlobalState([name, 'Key1']);
    useEffect(() => {
      setName("DATA2")
    }, [])
    return <>{value ?? 'undefined'}</>;
  };
  const Component02 = () => {
    const [value] = useGlobalState(['DATA', 'Key1'], 100);
    return <>{value ?? 'undefined'}</>;
  };
  const Component03 = () => {
    const [value] = useGlobalState(['DATA', 'Key1']);
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
});
it('rename2', () => {
  const Component01 = () => {
    const [name, setName] = useState("DATA")
    const [value] = useGlobalState([name, 'Key1']);
    useEffect(() => {
      setName("DATA2")
    }, [])
    return <>{value ?? 'undefined'}</>;
  };
  const Component02 = () => {
    const [value] = useGlobalState(['DATA', 'Key1'], 100);
    return <>{value ?? 'undefined'}</>;
  };
  const Component03 = () => {
    const [value] = useGlobalState(['DATA2', 'Key1'], 200);
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
});

it('initData', () => {
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
});

it('useEffect', () => {
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
});

it('onclick', () => {
  const Component01 = () => {
    const [value, setValue] = useGlobalState(['Key1']);
    return (
      <button
        id="click"
        onClick={() => {
          setValue('Click');
        }}
      >
        <>{value ?? 'undefined'}</>
      </button>
    );
  };
  const Component02 = () => {
    const [value, setValue] = useGlobalState<unknown>(['Key1'], 1);
    useEffect(() => {
      setValue('Efect');
    }, []);
    return <>{value ?? 'undefined'}</>;
  };
  const Component03 = () => {
    const [value] = useGlobalState('Key1', 2);
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
  act(() => {
    const element = container.querySelector('#click');
    element?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  expect(container.childNodes).toMatchSnapshot();
});
