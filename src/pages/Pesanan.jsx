// Pesanan.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, flexRender, getPaginationRowModel } from "@tanstack/react-table";
import axios from "axios";

const Pesanan = () => {
  const [pesanan, setPesanan] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [sort, setSort] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [statusEdit, setStatusEdit] = useState("");
  const [selectedPesanan, setSelectedPesanan] = useState(null);
  const [selectedIdPesanan, setSelectedIdPesanan] = useState(null);

  const fetchPesanan = async () => {
    const res = await axios.get("http://localhost:3000/api/pesanan");
    setPesanan(res.data);
  };

  const fetchDetail = async (id_pesanan) => {
    const res = await axios.get(`http://localhost:3000/api/pesanan/detail_pesanan/${id_pesanan}`);
    setSelectedPesanan({ id_pesanan, details: res.data });
  };

  useEffect(() => {
    fetchPesanan();
  }, []);

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
  };

  const filteredData = useMemo(() => {
    return pesanan.filter((p) => {
      const matchStatus = !filterStatus || p.status_pembelian === filterStatus;
      const matchUser = !filterUser || p.nama?.toLowerCase().includes(filterUser.toLowerCase());
      const matchTanggal = !filterTanggal || formatDate(p.tanggal_pembelian) === formatDate(filterTanggal);
      const matchSearch = p.id_pesanan.toLowerCase().includes(search.toLowerCase()) || p.nama?.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchUser && matchTanggal && matchSearch;
    });
  }, [pesanan, filterStatus, filterUser, filterTanggal, search]);

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "id_pesanan", header: "ID Pesanan" },
      { accessorKey: "nama", header: "Nama User" },
      {
        accessorKey: "tanggal_pembelian",
        header: "Tanggal",
        cell: (info) => formatDate(info.getValue()),
      },
      {
        accessorKey: "status_pembelian",
        header: "Status",
        cell: (info) => <span className="capitalize font-medium text-slate-700">{info.getValue()}</span>,
      },
      {
        accessorKey: "bukti_pembayaran",
        header: "Bukti Bayar",
        cell: (info) =>
          info.getValue() ? (
            <a href={`http://localhost:3000${info.getValue()}`} target="_blank" rel="noopener noreferrer">
              <img src={`http://localhost:3000${info.getValue()}`} alt="bukti" className="w-12 h-12 object-cover rounded" />
            </a>
          ) : (
            <span className="text-sm text-slate-400">Belum ada</span>
          ),
      },
      {
        header: "Aksi",
        cell: ({ row }) => (
          <div className="space-x-2">
            {row.original.status_pembelian !== "selesai" && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow"
                onClick={() => {
                  setEditingId(row.original.id);
                  setStatusEdit(row.original.status_pembelian);
                  setSelectedIdPesanan(row.original.id_pesanan);
                }}
              >
                Edit
              </button>
            )}
            <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow" onClick={() => handleDelete(row.original.id)}>
              Hapus
            </button>
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded shadow" onClick={() => fetchDetail(row.original.id_pesanan)}>
              Detail
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
    state: {
      sorting: sort,
    },
    onSortingChange: setSort,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/api/pesanan/${id}`);
    fetchPesanan();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (statusEdit === "selesai") {
        const res = await axios.put(`http://localhost:3000/api/pesanan/selesai/${selectedIdPesanan}`);
        if (res.status === 200) {
          alert("Pesanan berhasil diselesaikan.");
        }
      } else {
        await axios.put(`http://localhost:3000/api/pesanan/${editingId}`, {
          status_pembelian: statusEdit,
        });
      }

      setEditingId(null);
      fetchPesanan();
    } catch (error) {
      console.error(error);
      alert("Gagal menyelesaikan pesanan.");
    }
  };

  const handleExportCSV = () => {
    const header = ["ID", "ID_Pesanan", "Nama", "Tanggal", "Status"];
    const rows = filteredData.map((p) => [p.id, p.id_pesanan, p.nama, formatDate(p.tanggal_pembelian), p.status_pembelian]);
    const csvContent = [header, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pesanan.csv";
    a.click();
  };

  const jumlahMenunggu = pesanan.filter((p) => p.status_pembelian === "menunggu").length;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-slate-700">Manajemen Pesanan</h1>

      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <input type="text" placeholder="Cari ID/Nama" className="border border-slate-300 p-2 rounded" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border border-slate-300 p-2 rounded" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="menunggu">Menunggu</option>
          <option value="dibayar">Dibayar</option>
          <option value="diterima">Diterima</option>
          <option value="selesai">Selesai</option>
          <option value="dibatalkan">Dibatalkan</option>
        </select>
        <input type="text" placeholder="Filter Nama User" className="border border-slate-300 p-2 rounded" value={filterUser} onChange={(e) => setFilterUser(e.target.value)} />
        <input type="date" className="border border-slate-300 p-2 rounded" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} />
      </div>

      <div className="flex justify-between items-center mb-2">
        <p className="text-slate-600">
          Jumlah pesanan menunggu: <strong>{jumlahMenunggu}</strong>
        </p>
        {/* Export CSV */}
        {/* <button onClick={handleExportCSV} className="text-sm text-white bg-slate-600 hover:bg-slate-700 px-3 py-1 rounded shadow">
          📤 Ekspor CSV
        </button> */}
      </div>

      {editingId && (
        <form onSubmit={handleEditSubmit} className="bg-white p-4 rounded-xl shadow mb-4 flex flex-col md:flex-row items-center gap-4">
          <span className="text-slate-600">Update Status:</span>
          <select className="border border-slate-300 p-2 rounded" value={statusEdit} onChange={(e) => setStatusEdit(e.target.value)}>
            <option value="menunggu">Menunggu</option>
            <option value="dibayar">Dibayar</option>
            <option value="diterima">Diterima</option>
            <option value="selesai">Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
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
              <tr
                key={row.id}
                className={row.original.status_pembelian !== "selesai" ? "border-t border-slate-200 hover:bg-slate-50" : "border-t border-slate-200 hover:bg-gray-200 bg-gray-100 text-gray-500"}
              >
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
        </div>
      </div>

      {selectedPesanan && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-xl">
            <h2 className="text-lg font-bold mb-4">Detail Pesanan: {selectedPesanan.id_pesanan}</h2>
            {selectedPesanan.details.map((item, i) => (
              <div key={i} className="flex justify-between py-1 border-b">
                <div>Produk #{item.id_produk}</div>
                <div>
                  {item.jumlah} x Rp {Number(item.harga).toLocaleString()} = Rp {Number(item.total).toLocaleString()}
                </div>
              </div>
            ))}
            <button className="mt-4 px-4 py-2 bg-slate-700 text-white rounded" onClick={() => setSelectedPesanan(null)}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pesanan;
