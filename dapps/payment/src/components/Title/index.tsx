import React, { useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { APPDetailType, TitleType } from 'payment/src/utils/types';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    config?: TitleType[];
    backTo?: string | Function;
}

export default ({ backTo, config = [], children, ...others }: Props) => {
    const navigate = useNavigate();

    const handleGoBack = useCallback(() => {
        if (typeof backTo === 'function') {
            backTo();
        } else if (typeof backTo === 'string') {
            navigate(backTo);
        }
    }, []);

    const t = useMemo(() => {
        if (children) {
            return <span className="text-lg">{children}</span>;
        }

        if (Array.isArray(config)) {
            return (
                <span className="text-lg">
                    {config.map((t, i) => (
                        <span key={i}>
                            {t.active ? (
                                <span className="text-gray-900">{t.text}</span>
                            ) : typeof t.onClick !== undefined ? (
                                <span className="text-gray-400 cursor-pointer" onClick={() => (t.onClick as Function)(t.key || t.text)}>
                                    {t.text}
                                </span>
                            ) : (
                                <Link className="text-gray-400 cursor-pointer" to={t.link as string}>
                                    {t.text}
                                </Link>
                            )}
                            {i !== config.length - 1 && <span className="m-1">|</span>}
                        </span>
                    ))}
                </span>
            );
        } else {
            return '';
        }
    }, [config, children]);

    return (
        <div id="title" className="mb-4" {...others}>
            {backTo && (
                <a onClick={handleGoBack} id="button_goBack" className="mr-4">
                    {'< Back'}
                </a>
            )}
            {t}
        </div>
    );
};
