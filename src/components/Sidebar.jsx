import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaComments, FaShoppingCart, FaBoxes, FaUsers, FaSignOutAlt, FaClinicMedical } from "react-icons/fa";

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/konsultasi", label: "Konsultasi", icon: <FaComments /> },
    { to: "/pesanan", label: "Pesanan", icon: <FaShoppingCart /> },
    { to: "/produk", label: "Produk", icon: <FaBoxes /> },
    { to: "/users", label: "Users", icon: <FaUsers /> },
  ];

  return (
    <aside className="w-64 bg-slate-800 text-white h-screen fixed flex flex-col justify-between">
      <div>
        <a href="/" className="flex items-center gap-2 p-4 text-2xl font-bold border-b border-slate-700">
          <FaClinicMedical className="text-teal-400" />
          Rahmat Ratu-Glow
        </a>

        <div className="p-4 border-b border-slate-700 text-sm">
          <p className="font-semibold">{user?.nama ?? "Pengguna"}</p>
          <p className="text-slate-400 text-xs">{user?.email}</p>
        </div>

        <nav className="flex flex-col mt-4">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className={`flex items-center gap-2 px-4 py-3 hover:bg-slate-700 transition ${location.pathname.startsWith(item.to) ? "bg-slate-700 font-semibold" : ""}`}>
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <button onClick={onLogout} className="flex items-center gap-2 px-4 py-3 hover:bg-red-600 transition border-t border-slate-700">
        <FaSignOutAlt />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
