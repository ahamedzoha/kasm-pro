import { Button } from "@kasm-pro/ui"
import { Route, Routes, Link } from "react-router-dom"
import { myNewUtil } from "@kasm-pro/util"

export function App() {
  const util = myNewUtil()

  console.log(util)
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Button>Click me</Button>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              This is the generated root route.{" "}
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
  )
}

export default App
