import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ItemsProvider } from "./context/ItemsContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import LostItems from "./pages/CLF_LostItems";
import ItemDetails from "./pages/ItemDetails";
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
        <DataProvider>
          <AuthProvider>
            <ItemsProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />

                <div className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />

                    {/* Item management */}
                    <Route path="/items" element={<LostItems />} />
                    <Route path="/items/new" element={<ItemForm />} />
                    <Route path="/items/:id" element={<ItemDetails />} />
                    <Route path="/edit/:id" element={<ItemForm />} />

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
                </div>

                <Footer />
              </div>
            </ItemsProvider>
          </AuthProvider>
        </DataProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;