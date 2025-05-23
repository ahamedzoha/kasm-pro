import { AppRoutes } from "./routes/routes";
import { Providers } from "./providers";

export function App() {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  );
}

export default App;
