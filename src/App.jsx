import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import LostItems from "./pages/CLF_LostItems";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/items" element={<LostItems />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;