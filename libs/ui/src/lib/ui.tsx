export const Ui = () => {
  return (
    <div className="bg-red-500">
      <h1>Welcome to Ui!</h1>
    </div>
  );
};

export const Text = ({ children }: { children: React.ReactNode }) => {
  return <h1 className="text-red-500 text-2xl">{children}</h1>;
};

export const Button = ({ children }: { children: React.ReactNode }) => {
  return (
    <button className="bg-blue-500 text-white p-2 rounded-md">
      {children}
    </button>
  );
};
