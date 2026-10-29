import type { ChatLocation } from "./chat-contract";

type PositionReader = Pick<Geolocation, "getCurrentPosition">;

export function currentChatLocation(
  signal: AbortSignal,
  geolocation: PositionReader | undefined = typeof navigator === "undefined"
    ? undefined
    : navigator.geolocation,
): Promise<ChatLocation> {
  return new Promise((resolve, reject) => {
    let settled = false;
    function finish(action: () => void) {
      if (settled) return;
      settled = true;
      signal.removeEventListener("abort", abort);
      action();
    }
    function abort() {
      finish(() =>
        reject(
          signal.reason ?? new DOMException("Location cancelled", "AbortError"),
        ),
      );
    }
    if (signal.aborted) return abort();
    if (!geolocation) return reject(new Error("Geolocation unavailable"));
    signal.addEventListener("abort", abort, { once: true });
    try {
      geolocation.getCurrentPosition(
        ({ coords }) =>
          finish(() => {
            const { latitude, longitude } = coords;
            if (
              !Number.isFinite(latitude) ||
              Math.abs(latitude) > 90 ||
              !Number.isFinite(longitude) ||
              Math.abs(longitude) > 180
            ) {
              reject(new Error("Invalid current location"));
              return;
            }
            resolve({ latitude, longitude, radiusKm: 5 });
          }),
        (error) => finish(() => reject(error)),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
      );
    } catch (error) {
      finish(() => reject(error));
    }
  });
}
