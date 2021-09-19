# @react-libraries/use-global-state

## What is this

Global `setState` that does not require `provider` or `store`

## usage

- `[data,dispatch] = useGlobalState(key,initData)`

```tsx
import { useGlobalState } from '@react-libraries/use-global-state';
import React from 'react';

export const Tall = () => {
  console.log('Tall');
  // useGlobalState(key, value);
  // useGlobalState(['KeyGroup1','KeyGroup2'...], value); //Composite key
  const [value, setValue] = useGlobalState('tall', '170');
  return (
    <div>
      Tall:
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
    </div>
  );
};
export const Weight = () => {
  console.log('Weight');
  const [value, setValue] = useGlobalState('weight', '60');
  return (
    <div style={{ display: 'flex' }}>
      Weight:
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
    </div>
  );
};

export const Bmi = () => {
  console.log('Bmi');
  const [tall] = useGlobalState<string>('tall');
  const [weight] = useGlobalState<string>('weight');
  return (
    <div>
      {isNaN(Number(tall)) || isNaN(Number(weight))
        ? 'Error'
        : `BMI:${Math.floor((Number(weight) / Math.pow(Number(tall) / 100, 2)) * 100) / 100}`}
    </div>
  );
};

const Page = () => (
  <>
    <Bmi />
    <Tall />
    <Weight />
  </>
);
export default Page;
```

- `mutate(key,data)`

```tsx
import { mutate } from '@react-libraries/use-global-state';

interface Props {
  name: string;
}

export const InputBox = ({ name }: Props) => {
  return (
    <div>
      <input
        defaultValue="100"
        onKeyPress={(e) => {
          e.key === 'Enter' && mutate(name, Number(e.currentTarget.value));
        }}
      />
    </div>
  );
};
```

- `reset`

```tsx
import { reset } from '@react-libraries/use-global-state';

reset(); //Clear cache
```

- `getCache` and `setCache`

```tsx
import { getCache,setCache } from '@react-libraries/use-global-state';
const cache = getCache([...KeyGroups]); //Pass this data to props

//For SSR
setCache(cache);
```

- Provider - `GlobalState`をProvider範囲内に限定します

```tsx
import { Provider } from '../hooks/useContexts'

const Page = () => {
  return (
    <Provider>
      <Test />
    </Provider>
  )
}

export default Page
```
