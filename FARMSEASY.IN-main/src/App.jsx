import { BrowserRouter, useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { Toaster } from "react-hot-toast";

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {!isAdmin && <Navbar />}
      <main className="flex-grow">
        <AppRoutes />
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}

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

      <AppContent />
    </BrowserRouter>
  );
}

export default App;
