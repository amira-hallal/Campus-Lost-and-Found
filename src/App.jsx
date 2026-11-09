import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import ItemList from "./pages/ItemList";
import ItemDetail from "./pages/ItemDetail";
import ReportItem from "./pages/ReportItem";
import EditItem from "./pages/EditItem";
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
            <div className="flex min-h-screen flex-col">
              <Navbar />

              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/items" element={<ItemList />} />
                  <Route path="/items/new" element={<ReportItem />} />
                  <Route path="/items/:id" element={<ItemDetail />} />
                  <Route path="/items/:id/edit" element={<EditItem />} />
                  <Route path="/claims/:id" element={<ClaimDetail />} />
                  <Route path="/locations/:id" element={<LocationDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Home page buttons link to /report */}
                  <Route path="/report" element={<Navigate to="/items/new" replace />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>

              <Footer />
            </div>
          </AuthProvider>
        </DataProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
