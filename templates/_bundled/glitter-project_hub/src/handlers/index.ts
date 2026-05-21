


import { setThemeHandler, initThemeHandler } from './setThemeHandler';
import { deferDataSourcesHandler } from './deferDataSourcesHandler';
import { setupRealtimeLifecycleHandler } from './setupRealtimeLifecycleHandler';
import { stopPropagationHandler } from "./stopPropagationHandler";





export const handlers = {
  setTheme: setThemeHandler,
  initTheme: initThemeHandler,
  deferDataSources: deferDataSourcesHandler,
  setupRealtimeLifecycle: setupRealtimeLifecycleHandler,
  stopPropagation: stopPropagationHandler,
};


export const handlerMap = handlers;


export type GlitterProjectHubHandlers = typeof handlers;


export {
  setThemeHandler,
  initThemeHandler,
  deferDataSourcesHandler,
  setupRealtimeLifecycleHandler,
  stopPropagationHandler,
};
