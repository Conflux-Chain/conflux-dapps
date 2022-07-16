import { isValidElement, type ReactNode } from 'react';
import { injectConf as CFXPrefixInjectConf } from './CFXPrefix';
import { injectConf as MAXInjectConf } from './MAX';
import { injectConf as TextPrefix } from './TextPrefix';
import { injectConf as UnitPostfix } from './UnitPostfix';

const AllSuffixes = [CFXPrefixInjectConf, MAXInjectConf, TextPrefix, UnitPostfix] as unknown as Array<{ type: Function; injectClass: string }>;

const getInjectClassNames = (suffix: ReactNode | Array<ReactNode>) => {
    const suffixes = Array.isArray(suffix) ? suffix : [suffix];
    let res: Array<string> = [];
    suffixes.forEach((eachSuffix) => {
        let suffixType: undefined | Function = undefined;
        if (isValidElement(eachSuffix) && typeof eachSuffix.type === 'function') {
            suffixType = eachSuffix.type;
        }

        if (!suffixType) return;
        const matchSuffix = AllSuffixes.find((eachSuffixConf) => eachSuffixConf.type === suffixType);
        if (!matchSuffix) return;
        res.push(matchSuffix.injectClass);
    });

    return res.join(' ');
};

export default getInjectClassNames;
