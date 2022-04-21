import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { createContextCache, reset, useGlobalState, useMutation } from '../src/index';
import { Provider } from '../src/index';

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

it('initData-undefined', () => {
  const Component01 = () => {
    const [value] = useGlobalState('Key1');
    return <>{value ?? 'undefined'}</>;
  };
  const Component02 = () => {
    const [value] = useGlobalState('Key1');
    return <>{value ?? 'undefined'}</>;
  };
  const Component03 = () => {
    const [value] = useGlobalState('Key1');
    return <>{value ?? 'undefined'}</>;
  };
  const root = createRoot(container);
  act(() => {
    root.render(
      <Provider>
        <Component01 />
        <Component02 />
        <Component03 />
      </Provider>
    );
  });
  expect(container.childNodes).toMatchSnapshot();
  act(() => {
    root.unmount();
  });
});

it('initData-normal', () => {
  const Component01 = () => {
    const [value] = useGlobalState('Key1');
    return <>{value ?? 'undefined'}</>;
  };
  const Component02 = () => {
    //first initData
    const [value] = useGlobalState('Key1', 1);
    return <>{value ?? 'undefined'}</>;
  };
  const Component03 = () => {
    const [value] = useGlobalState('Key1', 2);
    return <>{value ?? 'undefined'}</>;
  };
  const root = createRoot(container);
  act(() => {
    root.render(
      <Provider>
        <Component01 />
        <Component02 />
        <Component03 />
      </Provider>
    );
  });
  expect(container.childNodes).toMatchSnapshot();
  act(() => {
    root.unmount();
  });
});

it('initData-function', () => {
  const Component01 = () => {
    const [value] = useGlobalState('Key1');
    return <>{value ?? 'undefined'}</>;
  };
  const Component02 = () => {
    //first initData
    const [value] = useGlobalState('Key1', () => 1);
    return <>{value ?? 'undefined'}</>;
  };
  const Component03 = () => {
    const [value] = useGlobalState('Key1', () => 2);
    return <>{value ?? 'undefined'}</>;
  };
  const root = createRoot(container);
  act(() => {
    root.render(
      <Provider>
        <Component01 />
        <Component02 />
        <Component03 />
      </Provider>
    );
  });
  expect(container.childNodes).toMatchSnapshot();
  act(() => {
    root.unmount();
  });
});

it('useEffect', () => {
  const Component01 = () => {
    const [value] = useGlobalState('Key1');
    return <>{value ?? 'undefined'}</>;
  };
  const Component02 = () => {
    const [value, setValue] = useGlobalState('Key1', 1);
    useEffect(() => {
      setValue(3);
    }, []);
    return <>{value ?? 'undefined'}</>;
  };
  const Component03 = () => {
    const [value, setValue] = useGlobalState<unknown>('Key1', 2);
    useEffect(() => {
      //Last setValue
      setValue('Effect');
    }, []);
    return <>{value ?? 'undefined'}</>;
  };
  const root = createRoot(container);
  act(() => {
    root.render(
      <Provider>
        <Component01 />
        <Component02 />
        <Component03 />
      </Provider>
    );
  });
  expect(container.childNodes).toMatchSnapshot();
  act(() => {
    root.unmount();
  });
});

it('onclick', () => {
  const Component01 = () => {
    const [value, setValue] = useGlobalState('Key1');
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
    const [value, setValue] = useGlobalState<unknown>('Key1', 1);
    useEffect(() => {
      setValue('Efect');
    }, []);
    return <>{value ?? 'undefined'}</>;
  };
  const Component03 = () => {
    const [value] = useGlobalState('Key1', 2);
    return <>{value ?? 'undefined'}</>;
  };
  const root = createRoot(container);
  act(() => {
    root.render(
      <Provider>
        <Component01 />
        <Component02 />
        <Component03 />
      </Provider>
    );
  });
  expect(container.childNodes).toMatchSnapshot();
  act(() => {
    const element = container.querySelector('#click');
    element?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  expect(container.childNodes).toMatchSnapshot();
  act(() => {
    root.unmount();
  });
});

it('remove', () => {
  const Component01 = () => {
    const [value] = useGlobalState('Key1');
    return <>{value ?? 'undefined'}</>;
  };
  const Component02 = () => {
    //first initData
    const [value] = useGlobalState('Key1', () => 1);
    return <>{value ?? 'undefined'}</>;
  };
  const Component03 = () => {
    const [value] = useGlobalState('Key1', () => 2);
    return <>{value ?? 'undefined'}</>;
  };
  const Root = () => {
    const [flag, setFlag] = useState(true);
    useEffect(() => {
      setFlag(false);
    }, []);

    return (
      <Provider>
        <Component01 />
        <Component02 />
        {flag && <Component03 />}
      </Provider>
    );
  };
  const root = createRoot(container);
  act(() => {
    root.render(<Root />);
  });
  expect(container.childNodes).toMatchSnapshot();
  act(() => {
    root.unmount();
  });
});

it('Provider value', () => {
  const Component01 = () => {
    const [value] = useGlobalState('Key1', 5);
    return <>{value}</>;
  };
  const value = [['Key1', 10]] as const;
  let newValue: { [key: string]: unknown }, oldVallue: { [key: string]: unknown };
  const root = createRoot(container);
  act(() => {
    root.render(
      <Provider value={createContextCache(value)}>
        <Component01 />
      </Provider>
    );
  });
  expect(container.childNodes).toMatchSnapshot();
  expect([oldVallue, newValue]).toMatchSnapshot();
  act(() => {
    root.unmount();
  });
});

it('Provider update', () => {
  const Component01 = () => {
    const [value] = useGlobalState('Key1', 5);
    const mutate = useMutation();
    useEffect(() => {
      mutate('Key2', 'ABC');
    }, []);
    return <>{value}</>;
  };
  let newValue: { [key: string]: unknown }, oldVallue: { [key: string]: unknown };
  const root = createRoot(container);
  act(() => {
    root.render(
      <Provider
        onUpdate={(nv, ov) => {
          newValue = nv;
          oldVallue = ov;
        }}
      >
        <Component01 />
      </Provider>
    );
  });
  expect(container.childNodes).toMatchSnapshot();
  expect([oldVallue, newValue]).toMatchSnapshot();
  act(() => {
    root.unmount();
  });
});

it('Provider nest update', () => {
  const Component01 = () => {
    const [value] = useGlobalState('Key1', 5);
    const mutate = useMutation();
    useEffect(() => {
      mutate('Key2', 'ABC');
    }, []);
    return <>{value}</>;
  };
  let newValue: { [key: string]: unknown }, oldVallue: { [key: string]: unknown };
  const root = createRoot(container);
  act(() => {
    root.render(
      <Provider
        onUpdate={(nv, ov) => {
          newValue = nv;
          oldVallue = ov;
        }}
      >
        <Provider>
          <Component01 />
        </Provider>
      </Provider>
    );
  });
  expect(container.childNodes).toMatchSnapshot();
  expect([oldVallue, newValue]).toMatchSnapshot();
  act(() => {
    root.unmount();
  });
});

it('Provider unmount', () => {
  const Component01 = () => {
    const [value] = useGlobalState('Key1', 5);
    const [state, setState] = useState(true);
    useEffect(() => {
      setState(false);
    }, []);
    return state && <Provider>{value}</Provider>;
  };
  let newValue: { [key: string]: unknown }, oldVallue: { [key: string]: unknown };
  const root = createRoot(container);
  act(() => {
    root.render(
      <Provider
        onUpdate={(nv, ov) => {
          newValue = nv;
          oldVallue = ov;
        }}
      >
        <Component01 />
      </Provider>
    );
  });
  expect(container.childNodes).toMatchSnapshot();
  expect([oldVallue, newValue]).toMatchSnapshot();
  act(() => {
    root.unmount();
  });
});
