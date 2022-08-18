import { isFunction } from "lodash-es";
import { useRef, useEffect, useLayoutEffect } from "react";

const useParamsMount = (fn: Function, params: unknown | unknown[], layoutMount = false) => {
    const paramsArray = Array.isArray(params) ? params : [params];
    const hasMount = useRef(false);
    (layoutMount ? useLayoutEffect : useEffect)(() => {
        if (hasMount.current || !isFunction(fn) || paramsArray.some(param => param === undefined || param === null)) {
            return;
        }
        fn();
        hasMount.current = true;
    }, paramsArray);
}

export default useParamsMount;