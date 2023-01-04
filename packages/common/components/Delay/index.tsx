import { useState, useLayoutEffect, PropsWithChildren } from 'react';
import cx from 'clsx';

interface Props {
  delay?: number;
  mode?: 'display' | 'opacity';
}

const Delay = ({ delay = 200, mode = 'display', children }: PropsWithChildren<Props>) => {
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const timer = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(timer);
  }, []);

  if (mode === 'display') {
    if (!ready) return null;
    return <>{children}</>;
  } else {
    return <div className={cx('w-fit transition-opacity', ready ? 'opacity-100' : 'opacity-0')}>{children}</div>;
  }
};

export default Delay;
