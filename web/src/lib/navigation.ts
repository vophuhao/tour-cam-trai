export let navigate: (path: string, options?: any) => void = () => {};
export const setNavigate = (fn: typeof navigate) => {
  navigate = fn;
};