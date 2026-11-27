import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { FeedbackProvider } from "./context/FeedbackContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DataGate from "./components/DataGate";

import Home from "./pages/Home";
import ItemList from "./pages/ItemList";
import ItemDetailPage from "./pages/ItemDetail";
import ItemForm from "./pages/ItemForm";

import ClaimDetail from "./pages/ClaimDetail";
import LocationDetail from "./pages/LocationDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <FeedbackProvider>
          <DataProvider>
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />

                <div className="flex-1">
                  {/* Pages render once the data has loaded from the API */}
                  <DataGate>
                    <Routes>
                      <Route path="/" element={<Home />} />

                      {/* Item management */}
                      <Route path="/items" element={<ItemList />} />
                      <Route path="/items/new" element={<ItemForm />} />
                      <Route path="/items/:id" element={<ItemDetailPage />} />
                      <Route path="/items/:id/edit" element={<ItemForm />} />

                      {/* Other project pages */}
                      <Route path="/claims/:id" element={<ClaimDetail />} />
                      <Route path="/locations/:id" element={<LocationDetail />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/dashboard" element={<Dashboard />} />

                      <Route
                        path="/report"
                        element={<Navigate to="/items/new" replace />}
                      />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </DataGate>
                </div>

                <Footer />
              </div>
            </AuthProvider>
          </DataProvider>
        </FeedbackProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
