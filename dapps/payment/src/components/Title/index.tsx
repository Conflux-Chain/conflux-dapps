import React, { useCallback, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    config?:
        | string
        | Array<{
              text: string;
              link?: string;
              active?: boolean;
          }>;
    backTo?: string | Function;
}

export default ({ backTo, config = [], children }: Props) => {
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
            return children;
        }

        if (typeof config === 'string') {
            return config;
        } else if (Array.isArray(config)) {
            return (
                <span className="ml-4">
                    {config.map((t, i) => (
                        <span key={i}>
                            {t.active ? (
                                <span className="text-gray-900">{t.text}</span>
                            ) : (
                                <Link className="text-gray-400 cursor-pointer" to={t.link}>
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
        <div>
            {backTo && <a onClick={handleGoBack}>{'< Back'}</a>}
            {t}
        </div>
    );
};
