export const Ui = () => {
  return (
    <div className="bg-red-500">
      <h1>Welcome to Ui!</h1>
    </div>
  );
};

export const Text = ({ children }: { children: React.ReactNode }) => {
  return <h1 className="text-red-500 text-2xl ">{children}</h1>;
};

export const Button = ({ children }: { children: React.ReactNode }) => {
  return (
    <button className="bg-teal-500 hover:bg-teal-600 transition-all duration-300 ease-in-out text-white p-2 rounded-md">
      {children}
    </button>
  );
};
