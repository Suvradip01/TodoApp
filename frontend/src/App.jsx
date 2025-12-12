import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from "./components/theme-provider"
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from "./components/ui/sonner"

// --------------------------------------------------------------------------------
// MAIN APP COMPONENT
// --------------------------------------------------------------------------------
// This is the "Traffic Controller" of the frontend.
// It decides which "Page" to show based on the URL.
function App() {
  return (
    // ThemeProvider: Handles Light/Dark mode switching
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* AuthProvider: Wraps app so ALL pages know if user is logged in */}
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes: Anyone can visit */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes: Only logged-in users.
                We use a "Layout Route" approach. <ProtectedRoute> checks for token.
                If valid, it renders the child routes (Dashboard).
            */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
            </Route>

            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
