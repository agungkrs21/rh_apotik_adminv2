// Produk.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table";
import axios from "axios";

const Produk = () => {
  const [produk, setProduk] = useState([]);
  const [filterKategori, setFilterKategori] = useState("");
  const [filterStok, setFilterStok] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState([]);
  const [previewURL, setPreviewURL] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    kategori: "",
    deskripsi: "",
    harga: "",
    stok: "",
    gambar: null,
  });
  const [editingId, setEditingId] = useState(null);

  const fetchProduk = async () => {
    const res = await axios.get("http://localhost:3000/api/produk");
    setProduk(res.data);
  };

  useEffect(() => {
    fetchProduk();
  }, []);

  const filteredData = useMemo(() => {
    return produk.filter((item) => {
      const matchKategori = !filterKategori || item.kategori.toLowerCase().includes(filterKategori.toLowerCase());
      const matchStok = filterStok === "" || (filterStok === "habis" ? item.stok === 0 : item.stok > 0);
      const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase()) || item.kategori.toLowerCase().includes(search.toLowerCase());
      return matchKategori && matchStok && matchSearch;
    });
  }, [produk, filterKategori, filterStok, search]);

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "nama", header: "Nama" },
      { accessorKey: "kategori", header: "Kategori" },
      { accessorKey: "deskripsi", header: "Deskripsi" },
      { accessorKey: "harga", header: "Harga", cell: (harga) => Number(harga.getValue()).toLocaleString() },
      { accessorKey: "stok", header: "Stok" },
      {
        accessorKey: "gambar",
        header: "Gambar",
        cell: (info) => <img src={`http://localhost:3000${info.getValue()}`} alt="gambar" className="w-16 h-16 object-cover rounded border" />,
      },
      {
        header: "Aksi",
        cell: ({ row }) => (
          <div className="space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow" onClick={() => handleEdit(row.original)}>
              Edit
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow" onClick={() => handleDelete(row.original.id)}>
              Delete
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
  });

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/api/produk/${id}`);
    fetchProduk();
  };

  const handleEdit = (data) => {
    setEditingId(data.id);
    setFormData({ ...data, gambar: null });
    setPreviewURL(data.gambar);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) form.append(key, value);
    });

    if (editingId) {
      await axios.put(`http://localhost:3000/api/produk/${editingId}`, form);
    } else {
      await axios.post("http://localhost:3000/api/produk", form);
    }

    setEditingId(null);
    setPreviewURL(null);
    setFormData({ nama: "", kategori: "", deskripsi: "", harga: "", stok: "", gambar: null });
    fetchProduk();
  };

  const handleGambarChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, gambar: file });
    if (file) setPreviewURL(URL.createObjectURL(file));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-slate-700">Manajemen Produk</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow mb-6">
        <input type="text" placeholder="Nama" className="border border-slate-300 p-2 rounded" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
        <input type="text" placeholder="Kategori" className="border border-slate-300 p-2 rounded" value={formData.kategori} onChange={(e) => setFormData({ ...formData, kategori: e.target.value })} />
        <input
          type="text"
          placeholder="Deskripsi"
          className="border border-slate-300 p-2 rounded"
          value={formData.deskripsi}
          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
        />
        <input type="number" placeholder="Harga" className="border border-slate-300 p-2 rounded" value={formData.harga} onChange={(e) => setFormData({ ...formData, harga: e.target.value })} />
        <input type="number" placeholder="Stok" className="border border-slate-300 p-2 rounded" value={formData.stok} onChange={(e) => setFormData({ ...formData, stok: e.target.value })} />
        <input type="file" className="border border-slate-300 p-2 rounded" onChange={handleGambarChange} />
        {previewURL && (
          <div className="col-span-full">
            {previewURL.startsWith("blob") ? (
              <img src={`${previewURL}`} alt="Preview" className="w-32 h-32 object-cover border rounded" />
            ) : (
              <img src={`http://localhost:3000${previewURL}`} alt="Preview" className="w-32 h-32 object-cover border rounded" />
            )}
          </div>
        )}
        <button className="col-span-full bg-green-600 hover:bg-green-700 text-white p-2 rounded shadow">{editingId ? "Update Produk" : "Tambah Produk"}</button>
      </form>

      <div className="flex flex-wrap gap-2 mb-4">
        <input type="text" placeholder="Cari nama/kategori..." className="border border-slate-300 p-2 rounded" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border border-slate-300 p-2 rounded" value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
          <option value="">Semua Kategori</option>
          {[...new Set(produk.map((p) => p.kategori))].map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select className="border border-slate-300 p-2 rounded" value={filterStok} onChange={(e) => setFilterStok(e.target.value)}>
          <option value="">Semua Stok</option>
          <option value="habis">Stok Habis</option>
          <option value="tersedia">Stok Tersedia</option>
        </select>
      </div>

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
    </div>
  );
};

export default Produk;
