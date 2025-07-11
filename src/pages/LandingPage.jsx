import React from "react";
import { FaClinicMedical, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-white flex flex-col justify-center items-center px-4 text-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-xl">
        <div className="flex justify-center items-center gap-2 mb-4 text-teal-600 text-3xl font-bold">
          <FaClinicMedical />
          Apotik Sehat
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">Selamat Datang di Sistem Manajemen Apotik</h1>
        <p className="text-gray-600 text-sm sm:text-base mb-6">Kelola produk, pesanan, konsultasi, dan data pengguna apotik Anda secara efisien dan cepat melalui dashboard kami.</p>

        <Link to="/dashboard" className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2 rounded-full hover:bg-teal-700 transition">
          Masuk ke Dashboard <FaArrowRight />
        </Link>
      </div>

      <footer className="mt-10 text-sm text-gray-500">&copy; {new Date().getFullYear()} Apotik Sehat. All rights reserved.</footer>
    </div>
  );
};

export default LandingPage;
