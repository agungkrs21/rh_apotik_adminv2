// Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../components/ui/card"; // jika pakai path relatif
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FaUsers, FaBox, FaNotesMedical, FaClipboardList } from "react-icons/fa";

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalProduk, setTotalProduk] = useState(0);
  const [totalPesanan, setTotalPesanan] = useState(0);
  const [totalKonsultasi, setTotalKonsultasi] = useState(0);
  const [pesananStats, setPesananStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [users, admins, produk, pesanan, konsultasi] = await Promise.all([
        axios.get("http://localhost:3000/api/users?tbname=users"),
        axios.get("http://localhost:3000/api/users?tbname=admin"),
        axios.get("http://localhost:3000/api/produk"),
        axios.get("http://localhost:3000/api/pesanan"),
        axios.get("http://localhost:3000/api/konsultasi"),
      ]);

      setTotalUsers(users.data.length);
      setTotalAdmins(admins.data.length);
      setTotalProduk(produk.data.length);
      setTotalPesanan(pesanan.data.length);
      setTotalKonsultasi(konsultasi.data.length);

      const stats = pesanan.data.reduce((acc, p) => {
        const date = new Date(p.tanggal_pembelian).toISOString().split("T")[0];
        const found = acc.find((d) => d.date === date);
        if (found) found.jumlah++;
        else acc.push({ date, jumlah: 1 });
        return acc;
      }, []);

      setPesananStats(stats.sort((a, b) => a.date.localeCompare(b.date)));
    };

    fetchStats();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-slate-700">Dashboard Apotik</h1>

      <div className="grid md:grid-cols-5 gap-4">
        <Card className="bg-white p-4 shadow rounded-xl border-t-4 border-blue-500">
          <CardContent className="flex items-center gap-4">
            <FaUsers className="text-blue-500 text-2xl" />
            <div>
              <div className="text-lg font-bold text-slate-800">{totalUsers}</div>
              <div className="text-sm text-slate-500">Pengguna</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white p-4 shadow rounded-xl border-t-4 border-green-500">
          <CardContent className="flex items-center gap-4">
            <FaNotesMedical className="text-green-500 text-2xl" />
            <div>
              <div className="text-lg font-bold text-slate-800">{totalAdmins}</div>
              <div className="text-sm text-slate-500">Admin/Dokter</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white p-4 shadow rounded-xl border-t-4 border-yellow-500">
          <CardContent className="flex items-center gap-4">
            <FaBox className="text-yellow-500 text-2xl" />
            <div>
              <div className="text-lg font-bold text-slate-800">{totalProduk}</div>
              <div className="text-sm text-slate-500">Produk</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white p-4 shadow rounded-xl border-t-4 border-pink-500">
          <CardContent className="flex items-center gap-4">
            <FaClipboardList className="text-pink-500 text-2xl" />
            <div>
              <div className="text-lg font-bold text-slate-800">{totalPesanan}</div>
              <div className="text-sm text-slate-500">Pesanan</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white p-4 shadow rounded-xl border-t-4 border-purple-500">
          <CardContent className="flex items-center gap-4">
            <FaNotesMedical className="text-purple-500 text-2xl" />
            <div>
              <div className="text-lg font-bold text-slate-800">{totalKonsultasi}</div>
              <div className="text-sm text-slate-500">Konsultasi</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-bold text-slate-700 mb-4">Statistik Pesanan per Tanggal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pesananStats}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="jumlah" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
