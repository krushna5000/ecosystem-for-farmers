import { BrowserRouter } from "react-router-dom";
import DashboardRoutes from "./routes/DashboardRoutes";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <main >
          <DashboardRoutes/>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;