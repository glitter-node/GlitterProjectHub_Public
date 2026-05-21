export interface HandlerContext {
    setState: (scope: 'local' | 'global' | '_global', data: Record<string, any>) => void;
    getState: (path: string) => any;
    formatCurrency: (amount: number, currency?: string) => string;
    calculateMultiCurrency: (amount: number) => Record<string, {
        value: number;
        formatted: string;
    }>;
    navigate: (path: string) => void;
    toast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    apiCall: (url: string, options?: RequestInit) => Promise<any>;
    t: (key: string, params?: Record<string, string | number>) => string;
    settings: Record<string, any>;
    currentUser: any;
}
export type HandlerFunction = (params: any, context: HandlerContext) => void | Promise<void>;
