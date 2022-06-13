---
nav:
  title: Button
  path: /components
---

## Button

```tsx
/**
 * title: variant & color
 * desc: Button 组件有五种形态：contained（默认）| outlined | dash | text | link; 有三种功能颜色：primary（默认）| secondary | danger。
 */
import React, { useState } from 'react';
import { Button } from 'fluent-ui';

export default () => {
  const [disabled, setDisabled] = useState(false);

  return (
    <>
      <Button variant='outlined' size="small" onClick={() => setDisabled(pre => !pre)}>{disabled ? '取消禁用' : '禁用按钮'}</Button>

      <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
        <Button disabled={disabled}>按钮</Button>
        <Button variant='outlined' disabled={disabled}>按钮</Button>
        <Button variant='dash' disabled={disabled}>按钮</Button>
        <Button variant='text' disabled={disabled}>按钮</Button>
        <Button variant='link' disabled={disabled}>按钮</Button>
      </div>
      <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
        <Button color='secondary' disabled={disabled}>按钮</Button>
        <Button variant='outlined' color='secondary' disabled={disabled}>按钮</Button>
        <Button variant='dash' color='secondary' disabled={disabled}>按钮</Button>
        <Button variant='text' color='secondary' disabled={disabled}>按钮</Button>
        <Button variant='link' color='secondary' disabled={disabled}>按钮</Button>
      </div>
      <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
        <Button color='danger' disabled={disabled}>按钮</Button>
        <Button variant='outlined' color='danger' disabled={disabled}>按钮</Button>
        <Button variant='dash' color='danger' disabled={disabled}>按钮</Button>
        <Button variant='text' color='danger' disabled={disabled}>按钮</Button>
        <Button variant='link' color='danger' disabled={disabled}>按钮</Button>
      </div>
    </>
  )
}
```


```tsx
/**
 * title: size & fullWidth
 * desc: Button 组件有四种尺寸：mini | small | medium（默认） | large。fullWidth 属性为 true 时，按钮占据父级全部的宽度。
 */
import React from 'react';
import { Button } from 'fluent-ui';

export default () => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <Button size='mini'>mini 按钮</Button>
      <Button size='small'>small 按钮</Button>
      <Button>medium 按钮</Button>
      <Button size='large'>large 按钮</Button>
    </div>

    <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
      <Button size='small' fullWidth>fullWidth 按钮</Button>
    </div>
  </>
)
```

```tsx
/**
 * title: shape
 * desc: Button 组件有三种形状：rect（默认） | circle | round。
 */
import React from 'react';
import { Button, DownOutlined } from 'fluent-ui';

export default () => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <Button>rect 按钮</Button>
      <Button shape='round'>round 按钮</Button>
      <Button shape='circle'>C</Button>
      <Button shape='circle' color="secondary">C</Button>
      <Button shape='circle' variant='dash' icon={DownOutlined}>
      </Button>
      <Button shape='circle' disabled>C</Button>
    </div>
  </>
)
```


```tsx
/**
 * title: loading
 * desc: Button 的 loading 属性为 true 时，进入加载状态。此时如同 disabled 状态一样，不可点击。
 */
import React from 'react';
import { Button, DownOutlined } from 'fluent-ui';

export default () => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <Button loading>按钮</Button>
      <Button color="danger" loading >按钮</Button>
      <Button variant='outlined' loading>按钮</Button>
      <Button shape='circle' loading>A</Button>
    </div>
  </>
)
```


```tsx
/**
 * title: href & <a>标签按钮
 * desc: 当 Button 的 href 属性为 string 时，会以 a 标签的形式渲染。通常用于 variant 为 link 的 Button，便于习惯右键打开新地址的用户。
 */
import React from 'react';
import { Button, DownOutlined } from 'fluent-ui';

export default () => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <Button href="https://www.baidu.com" target="_blank">按钮</Button>
      <Button variant="link" href="https://www.baidu.com" target="_blank">按钮</Button>
    </div>
  </>
)
```

```tsx
/**
 * title: href & <a>标签按钮
 * desc: 当 Button 的 href 属性为 string 时，会以 a 标签的形式渲染。通常用于 variant 为 link 的 Button，便于习惯右键打开新地址的用户。
 */
import React from 'react';
import { Button, DownOutlined } from 'fluent-ui';

export default () => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <Button href="https://www.baidu.com" target="_blank">按钮</Button>
      <Button variant="link" href="https://www.baidu.com" target="_blank">按钮</Button>
    </div>
  </>
)
```