import React, { useEffect, useMemo, useState } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, flexRender, getPaginationRowModel } from "@tanstack/react-table";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Konsultasi = () => {
  const [konsultasi, setKonsultasi] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterDokter, setFilterDokter] = useState("");
  const [sort, setSort] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [statusEdit, setStatusEdit] = useState("");
  const [catatanEdit, setCatatanEdit] = useState("");
  const [balasanEdit, setBalasanEdit] = useState("");
  const [topikEdit, setTopikEdit] = useState("");
  const { user } = useAuth();
  const fetchKonsultasi = async () => {
    const res = await axios.get("http://localhost:3000/api/konsultasi");
    setKonsultasi(res.data);
  };

  useEffect(() => {
    fetchKonsultasi();
  }, []);

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
  };

  const filteredData = useMemo(() => {
    return konsultasi.filter((k) => {
      const matchStatus = !filterStatus || k.status_konsultasi === filterStatus;
      const matchUser = !filterUser || k.nama_user.toLowerCase().includes(filterUser.toLowerCase());
      const matchDokter = !filterDokter || k.nama_dokter.toLowerCase().includes(filterDokter.toLowerCase());
      const matchSearch = k.topik.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchUser && matchDokter && matchSearch;
    });
  }, [konsultasi, filterStatus, filterUser, filterDokter, search]);

  const jumlahMenunggu = useMemo(() => {
    return konsultasi.filter((k) => k.status_konsultasi === "menunggu").length;
  }, [konsultasi]);

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "nama_user", header: "Nama User" },
      { accessorKey: "nama_dokter", header: "Nama Dokter" },
      { accessorKey: "topik", header: "Topik" },
      {
        accessorKey: "tanggal_konsultasi",
        header: "Tanggal",
        cell: (info) => formatDate(info.getValue()),
      },
      {
        accessorKey: "status_konsultasi",
        header: "Status",
        cell: (info) => <span className="capitalize font-medium text-slate-700">{info.getValue()}</span>,
      },
      {
        accessorKey: "catatan",
        header: "Catatan",
      },
      {
        accessorKey: "balasan",
        header: "Balasan",
        cell: (info) => (info.getValue() ? <span className="text-green-700">{info.getValue()}</span> : <span className="text-slate-400 italic">Belum dibalas</span>),
      },
      {
        header: "Aksi",
        cell: ({ row }) => (
          <div className="space-x-2">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow"
              onClick={() => {
                setEditingId(row.original.id);
                setStatusEdit(row.original.status_konsultasi);
                setCatatanEdit(row.original.catatan || "");
                setBalasanEdit(row.original.balasan || "");
                setTopikEdit(row.original.topik || "");
              }}
            >
              Balas
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow" onClick={() => handleDelete(row.original.id)}>
              Hapus
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting: sort },
    onSortingChange: setSort,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/api/konsultasi/${id}`);
    fetchKonsultasi();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await axios.put(`http://localhost:3000/api/konsultasi/${editingId}`, {
      status_konsultasi: statusEdit,
      catatan: catatanEdit,
      balasan: balasanEdit,
      topik: topikEdit,
      id_dokter: user.id,
    });
    setEditingId(null);
    fetchKonsultasi();
  };

  const handleExportCSV = () => {
    const header = ["ID", "User", "Dokter", "Topik", "Tanggal", "Status", "Catatan", "Balasan"];
    const rows = filteredData.map((k) => [k.id, k.nama_user, k.nama_dokter, k.topik, formatDate(k.tanggal_konsultasi), k.status_konsultasi, k.catatan, k.balasan || ""]);
    const csvContent = [header, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "konsultasi.csv";
    a.click();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-slate-700">Manajemen Konsultasi</h1>

      <div className="mb-4 text-slate-600 font-medium">
        Jumlah Konsultasi Menunggu: <span className="text-blue-700 font-bold">{jumlahMenunggu}</span>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <input type="text" placeholder="Cari Topik" className="border border-slate-300 p-2 rounded" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input type="text" placeholder="Filter Nama User" className="border border-slate-300 p-2 rounded" value={filterUser} onChange={(e) => setFilterUser(e.target.value)} />
        <input type="text" placeholder="Filter Nama Dokter" className="border border-slate-300 p-2 rounded" value={filterDokter} onChange={(e) => setFilterDokter(e.target.value)} />
        <select className="border border-slate-300 p-2 rounded" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="menunggu">Menunggu</option>
          <option value="diterima">Diterima</option>
          <option value="selesai">Selesai</option>
          <option value="dibatalkan">Dibatalkan</option>
        </select>
      </div>

      {editingId && (
        <form onSubmit={handleEditSubmit} className="bg-white p-4 rounded-xl shadow mb-4 flex flex-col md:flex-row items-center gap-4">
          <span className="text-slate-600">Update Status, Catatan & Balasan:</span>
          <select className="border border-slate-300 p-2 rounded" value={statusEdit} onChange={(e) => setStatusEdit(e.target.value)}>
            <option value="menunggu">Menunggu</option>
            <option value="diterima">Diterima</option>
            <option value="selesai">Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
          <input className="border border-slate-300 p-2 rounded" value={catatanEdit} onChange={(e) => setCatatanEdit(e.target.value)} placeholder="Catatan" />
          <input className="border border-slate-300 p-2 rounded" value={balasanEdit} onChange={(e) => setBalasanEdit(e.target.value)} placeholder="Balasan" />
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow">Simpan</button>
        </form>
      )}

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm text-slate-700">
          <thead className="bg-slate-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} onClick={header.column.getToggleSortingHandler()} className="p-2 cursor-pointer text-left">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() ? (header.column.getIsSorted() === "asc" ? " 🔼" : " 🔽") : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-200 hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-slate-600">
        <div>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1 border rounded disabled:opacity-50">
            Prev
          </button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1 border rounded disabled:opacity-50">
            Next
          </button>
          {/* Export CSV */}
          {/* <button onClick={handleExportCSV} className="ml-4 bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded shadow">
            📤 Ekspor CSV
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default Konsultasi;
