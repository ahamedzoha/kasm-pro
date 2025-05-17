import { Button, Text, Ui } from "@kasm-pro/ui";

export default function Index() {
  return (
    <div className="bg-black text-white h-screen flex flex-col items-center justify-center">
      <Ui />
      <Text>Hello</Text>
      <Button>Click me</Button>
      <div className="">Hello</div>
    </div>
  );
}
