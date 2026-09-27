import type { JSResourceReference } from "react-relay";

/** Share the module promise between speculative preload and route navigation. */
export function RouteResource<T>(
  id: string,
  loader: () => Promise<T>,
): JSResourceReference<T> {
  let component: T | null = null;
  let pending: Promise<T> | null = null;
  return {
    getModuleId: () => id,
    getModuleIfRequired: () => component,
    load: () =>
      (pending ??= loader()
        .then((value) => {
          component = value;
          return value;
        })
        .catch((error) => {
          pending = null;
          throw error;
        })),
  };
}
