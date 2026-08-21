import { BrowserRouter } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: { background: "#16a34a", color: "#fff" }, // green
          },
          error: {
            style: { background: "#dc2626", color: "#fff" }, // red
          },
          loading: {
            style: { background: "#0ea5e9", color: "#fff" }, // sky blue
          },
          style: {
            background: "#1f2937",
            color: "#fff",
          },
        }}
      />

      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <main className="grow">
          <AdminRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
