export let navigate: (path: string, options?: unknown) => void = () => {};

export const setNavigate = (fn: typeof navigate) => {
  navigate = fn;
};
