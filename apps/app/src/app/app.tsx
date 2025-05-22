import { Button, Card, Text } from "@kasm-pro/ui";
import { Route, Routes, Link } from "react-router-dom";
import { myNewUtil } from "@kasm-pro/util";

export function App() {
  const util = myNewUtil();

  console.log(util);
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-teal-500 text-white">
      <Text className="text-4xl font-bold text-amber-500">Welcome to App</Text>
      <Button>Click me</Button>
      <Card className="bg-red-500">
        <h1>Hello</h1>
      </Card>
      <Card className="bg-blue-500">
        <h1>Hello</h1>
      </Card>
      <Card className="bg-green-500">
        <h1>Hello</h1>
      </Card>

      <Routes>
        <Route
          path="/"
          element={
            <div>
              This is the generated root route.
              <Link to="/page-2">Click here for page 2.</Link>
            </div>
          }
        />
        <Route
          path="/page-2"
          element={
            <div>
              <Link to="/">Click here to go back to root page.</Link>
            </div>
          }
        />
      </Routes>
      {/* END: routes */}
    </div>
  );
}

export default App;
