interface DeferDataSourcesAction {
  params?: {
    dataSourceIds?: string[];
    delayMs?: number;
    staggerMs?: number;
    homeOnly?: boolean;
    anonymousOnly?: boolean;
  };
}

const scheduleIdle = (callback: () => void, delayMs: number): void => {
  const run = () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(callback, { timeout: 2500 });
    } else {
      window.setTimeout(callback, 0);
    }
  };

  window.setTimeout(run, delayMs);
};

export async function deferDataSourcesHandler(action: DeferDataSourcesAction): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const params = action.params ?? {};
  const dataSourceIds = Array.isArray(params.dataSourceIds) ? params.dataSourceIds : [];

  if (dataSourceIds.length === 0) {
    return;
  }

  if (params.homeOnly && window.location.pathname !== '/') {
    return;
  }

  if (params.anonymousOnly && window.localStorage.getItem('auth_token')) {
    return;
  }

  const delayMs = Number(params.delayMs ?? 1200);
  const staggerMs = Number(params.staggerMs ?? 350);

  scheduleIdle(() => {
    dataSourceIds.forEach((dataSourceId, index) => {
      window.setTimeout(() => {
        void (window as any).G7Core?.dataSource?.refetch?.(dataSourceId);
      }, index * staggerMs);
    });
  }, delayMs);
}
