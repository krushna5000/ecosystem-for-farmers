import AdminRoutes from './routes/AdminRoutes'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

function App() {
 

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
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
  )
}

export default App
