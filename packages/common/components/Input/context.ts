import { createContext, useContext, type RefObject } from "react";

const InputContext = createContext<{ domRef: RefObject<HTMLInputElement | null>; max?: string | number; disabled?: boolean; }>({ domRef: null!, max: undefined, disabled: undefined });

const useInputContext = () => useContext(InputContext);

export { useInputContext, InputContext }