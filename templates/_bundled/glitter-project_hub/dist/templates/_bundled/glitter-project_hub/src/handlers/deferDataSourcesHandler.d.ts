interface DeferDataSourcesAction {
    params?: {
        dataSourceIds?: string[];
        delayMs?: number;
        staggerMs?: number;
        homeOnly?: boolean;
        anonymousOnly?: boolean;
    };
}
export declare function deferDataSourcesHandler(action: DeferDataSourcesAction): Promise<void>;
export {};
