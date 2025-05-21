import { Button, Card } from "@kasm-pro/ui";

export default function Index() {
  return (
    <div className="">
      <div className="h-screen flex flex-col justify-center items-center">
        <div className="">
          <h1 className="text-4xl font-bold text-amber-500">
            Welcome to Marketing App
          </h1>
          <Card className="w-1/2 ">This is a card</Card>
          <Button>Click me</Button>
        </div>
      </div>
    </div>
  );
}
