// A new revision remounts the conversation, including when a cached page resumes.
export function createChatEntryStore(events?: EventTarget) {
  let revision = 0;
  const listeners = new Set<() => void>();
  const reset = () => {
    revision += 1;
    listeners.forEach((listener) => listener());
  };
  const restore = (event: Event) => {
    if ("persisted" in event && event.persisted === true) reset();
  };
  return {
    getSnapshot: () => revision,
    getServerSnapshot: () => 0,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1) {
        events?.addEventListener("pagehide", reset);
        events?.addEventListener("pageshow", restore);
        events?.addEventListener("popstate", reset);
      }
      reset();
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          events?.removeEventListener("pagehide", reset);
          events?.removeEventListener("pageshow", restore);
          events?.removeEventListener("popstate", reset);
        }
      };
    },
  };
}
