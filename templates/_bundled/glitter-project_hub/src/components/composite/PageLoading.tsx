import React from 'react';


export interface PageLoadingProps {
    options?: {
        text?: string;
    };
}


const t = (key: string, params?: Record<string, string | number>) =>
    (window as any).G7Core?.t?.(key, params) ?? key;


const PageLoading: React.FC<PageLoadingProps> = ({ options }) => {
    return (
        <div className="absolute inset-0 z-[2147483647] overflow-hidden bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-start pt-[15%] gap-3">
            <div className="w-8 h-8 border-[3px] border-slate-400 dark:border-slate-500 border-t-transparent rounded-full animate-[g7-spin_0.8s_linear_infinite]" />
            <span className="text-sm text-slate-500 dark:text-slate-400">
                {options?.text || t('nav.loading')}
            </span>
        </div>
    );
};

export default PageLoading;
