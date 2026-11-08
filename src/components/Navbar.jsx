import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        backgroundColor: "#F7F5EC",
        padding: "25px",
        borderBottom: "2px solid #DCE6D8",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2 style={{ color: "#244B3C", margin: 0 }}>
        M.A.R.S Campus Lost & Found
      </h2>

      <div style={{ display: "flex", gap: "25px" }}>
        <Link to="/" style={{ color: "#244B3C" }}>
          Home
        </Link>

        <Link to="/items" style={{ color: "#244B3C" }}>
          Item List
        </Link>
      </div>
    </nav>
  );
}