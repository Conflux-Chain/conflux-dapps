import React, { isValidElement, cloneElement } from 'react';
import type { ReactElement, ReactNode } from 'react';

const renderReactNode = (ele: ReactNode | Function, props?: Record<string, any>) => {
    let node: React.ReactElement;
    if (typeof ele === 'function') {
        node = ele();
    } else if (typeof ele === 'object' && typeof (ele as any)?.render === 'function') {
        node = (ele as any).render();
    } else {
        if (!props) {
            node = ele as ReactElement;
        } else {
            node = cloneElement(ele as ReactElement, props)
        }
    }

    if (!isValidElement(node)) {
        return null;
    }

    return node;
};

export default renderReactNode;
