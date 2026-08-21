import { BrowserRouter } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <main className="grow">
          <AdminRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
