import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { FarmProvider } from "./context/FarmContext";

function App() {
  console.log("Debugging");
  
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        richColors={false}
        toastOptions={{
          success: {
            style: { background: "#16a34a", color: "#fff" },
          },
          error: {
            style: { background: "#dc2626", color: "#fff" },
          },
          loading: {
            style: { background: "#0ea5e9", color: "#fff" },
          },
        }}
      />

      {/* Background Image via inline style */}
      <div className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col text-white">
        {/* Glass Effect Layer */}
        <div className="min-h-screen">
          <main className="grow">
            <AuthProvider>
              <FarmProvider>
                <AppRoutes />
              </FarmProvider>
            </AuthProvider>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
