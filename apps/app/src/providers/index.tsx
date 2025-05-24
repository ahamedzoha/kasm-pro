import ReduxProvider from "./ReduxProvider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <ReduxProvider>{children}</ReduxProvider>;
};
