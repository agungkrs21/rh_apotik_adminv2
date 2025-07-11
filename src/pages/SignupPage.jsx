import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    alamat: "",
    jenis_kelamin: "",
    tanggal_lahir: "",
    peran: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/signup?tbname=admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal daftar");

      login(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white shadow p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-teal-600 text-center">Buat Akun</h2>

        {error && <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input type="text" name="nama" value={form.nama} onChange={handleChange} required className="w-full border border-gray-300 px-3 py-2 rounded" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border border-gray-300 px-3 py-2 rounded" />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full border border-gray-300 px-3 py-2 rounded" />
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-medium mb-1">Alamat</label>
            <input type="text" name="alamat" value={form.alamat} onChange={handleChange} required className="w-full border border-gray-300 px-3 py-2 rounded" />
          </div>

          {/* Jenis Kelamin */}
          <div>
            <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
            <select name="jenis_kelamin" value={form.jenis_kelamin} onChange={handleChange} required className="w-full border border-gray-300 px-3 py-2 rounded">
              <option value="">Pilih jenis kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          {/* Tanggal Lahir */}
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
            <input type="date" name="tanggal_lahir" value={form.tanggal_lahir} onChange={handleChange} required className="w-full border border-gray-300 px-3 py-2 rounded" />
          </div>

          {/* Peran */}
          <div>
            <label className="block text-sm font-medium mb-1">Peran</label>
            <select name="peran" value={form.peran} onChange={handleChange} required className="w-full border border-gray-300 px-3 py-2 rounded">
              <option value="">Pilih peran</option>
              <option value="admin">Admin</option>
              <option value="dokter">Dokter</option>
            </select>
          </div>

          {/* Tombol submit */}
          <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700">
            Daftar
          </button>

          {/* Link ke login */}
          <p className="text-sm text-center mt-4">
            Sudah punya akun?{" "}
            <a href="/login" className="text-teal-600 hover:underline">
              Login di sini
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
