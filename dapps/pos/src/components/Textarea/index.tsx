import React, { forwardRef, useRef } from 'react';
import composeRef from 'common/utils/composeRef';
import cx from 'clsx';
import './index.css';
interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(({ className, ...props }, ref) => {
    const domRef = useRef<HTMLTextAreaElement>(null!);

    return <textarea className={cx(className, 'text-area')} ref={composeRef(ref, domRef)} {...props}></textarea>;
});

export default Textarea;
