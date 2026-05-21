import { setThemeHandler, initThemeHandler } from './setThemeHandler';
import { deferDataSourcesHandler } from './deferDataSourcesHandler';
import { setupRealtimeLifecycleHandler } from './setupRealtimeLifecycleHandler';
import { stopPropagationHandler } from './stopPropagationHandler';
export declare const handlers: {
    setTheme: typeof setThemeHandler;
    initTheme: typeof initThemeHandler;
    deferDataSources: typeof deferDataSourcesHandler;
    setupRealtimeLifecycle: typeof setupRealtimeLifecycleHandler;
    stopPropagation: typeof stopPropagationHandler;
};
export declare const handlerMap: {
    setTheme: typeof setThemeHandler;
    initTheme: typeof initThemeHandler;
    deferDataSources: typeof deferDataSourcesHandler;
    setupRealtimeLifecycle: typeof setupRealtimeLifecycleHandler;
    stopPropagation: typeof stopPropagationHandler;
};
export type GlitterProjectHubHandlers = typeof handlers;
export { setThemeHandler, initThemeHandler, deferDataSourcesHandler, setupRealtimeLifecycleHandler, stopPropagationHandler, };
