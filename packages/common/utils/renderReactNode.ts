import React, { isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';

const renderReactNode = (ele: ReactNode | Function) => {
    let node: React.ReactElement;
    if (typeof ele === 'function') {
        node = ele();
    } else if (typeof ele === 'object' && typeof (ele as any)?.render === 'function') {
        node = (ele as any).render();
    } else {
        node = ele as ReactElement;
    }

    if (!isValidElement(node)) {
        return null;
    }

    return node;
};

export default renderReactNode;
