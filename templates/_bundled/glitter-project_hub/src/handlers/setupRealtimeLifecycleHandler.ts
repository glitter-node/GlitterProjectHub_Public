interface RealtimeLifecycleWindow extends Window {
  __glitterProjectHubRealtimeLifecycle?: boolean;
}

export async function setupRealtimeLifecycleHandler(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const lifecycleWindow = window as RealtimeLifecycleWindow;

  if (lifecycleWindow.__glitterProjectHubRealtimeLifecycle) {
    return;
  }

  lifecycleWindow.__glitterProjectHubRealtimeLifecycle = true;

  window.addEventListener('pagehide', () => {
    (window as any).G7Core?.websocket?.disconnect?.();
  });

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted || !window.localStorage.getItem('auth_token')) {
      return;
    }

    window.setTimeout(() => {
      void (window as any).G7Core?.dataSource?.refetch?.('current_user');
      void (window as any).G7Core?.dataSource?.refetch?.('notification_unread_count');
    }, 250);
  });
}
