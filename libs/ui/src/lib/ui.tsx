import { cn } from "@kasm-pro/util";

export const Ui = () => {
  return (
    <div className="bg-red-500">
      <h1>Welcome to Ui!</h1>
    </div>
  );
};

export const Text = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <h1 className={cn("text-red-500 text-2xl", className)}>{children}</h1>;
};

export const Button = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <button
      className={cn(
        "bg-teal-500 hover:bg-teal-600 transition-all duration-300 ease-in-out text-white p-2 rounded-md",
        className
      )}
    >
      {children}
    </button>
  );
};

export const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("bg-yellow-500 p-4 rounded-md shadow-md", className)}>
      {children}
    </div>
  );
};
