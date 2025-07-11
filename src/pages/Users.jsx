import React, { useEffect, useMemo, useState } from "react";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table";

const Users = () => {
  const [data, setData] = useState([]);
  const [peranFilter, setPeranFilter] = useState("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/users/users");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Gagal fetch data users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id, sumber) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/users/${id}?tbname=${sumber}`, {
        method: "DELETE",
      });
      if (res.ok) fetchUsers();
      else alert("Gagal menghapus user");
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus");
    }
  };

  const openEditModal = (row) => {
    setEditData(row);
    setShowPassword(false);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const { id, sumber, ...updatedFields } = editData;
    console.log(updatedFields);
    try {
      const res = await fetch(`http://localhost:3000/api/users/${id}?tbname=${sumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        setEditModalOpen(false);
        fetchUsers();
      } else {
        alert("Gagal update");
      }
    } catch (err) {
      alert("Error saat update user");
    }
  };

  const filteredData = useMemo(() => {
    return data
      .filter((item) => (peranFilter === "semua" ? true : item.peran === peranFilter))
      .filter((item) => {
        const q = searchQuery.toLowerCase();
        return item.nama.toLowerCase().includes(q) || item.email.toLowerCase().includes(q);
      });
  }, [data, peranFilter, searchQuery]);

  const columns = useMemo(
    () => [
      { header: "ID", accessorKey: "id", enableSorting: true },
      { header: "Nama", accessorKey: "nama", enableSorting: true },
      { header: "Email", accessorKey: "email", enableSorting: true },
      {
        header: "Password",
        accessorKey: "password",
        cell: () => "•••••••",
        enableSorting: false,
      },
      { header: "Alamat", accessorKey: "alamat" },
      {
        header: "Jenis Kelamin",
        accessorKey: "jenis_kelamin",
        enableSorting: true,
      },
      {
        header: "Tanggal Lahir",
        accessorKey: "tanggal_lahir",
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString("id-ID"),
        enableSorting: true,
      },
      { header: "Peran", accessorKey: "peran", enableSorting: true },
      { header: "Sumber", accessorKey: "sumber" },
      {
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button onClick={() => openEditModal(row.original)} className="px-3 py-1 bg-yellow-500 text-white rounded text-sm">
              Edit
            </button>
            <button onClick={() => handleDelete(row.original.id, row.original.sumber)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">
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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-slate-700">Manajemen Users</h1>

      {/* Filter & Search */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <select value={peranFilter} onChange={(e) => setPeranFilter(e.target.value)} className="border px-3 py-2 rounded">
          <option value="semua">Semua Peran</option>
          <option value="admin">Admin</option>
          <option value="dokter">Dokter</option>
          <option value="pengguna">Pengguna</option>
        </select>
        <input type="text" placeholder="Cari nama/email" className="border px-3 py-2 rounded flex-1" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} onClick={header.column.getToggleSortingHandler()} className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: " 🔼",
                      desc: " 🔽",
                    }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 text-sm text-gray-800">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span>
          Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1 border rounded text-sm">
            Sebelumnya
          </button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1 border rounded text-sm">
            Selanjutnya
          </button>
        </div>
      </div>

      {/* Modal Edit */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleEditSubmit} className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 shadow">
            <h2 className="text-xl font-bold">Edit User</h2>

            <input className="w-full border p-2 rounded" value={editData.nama} onChange={(e) => setEditData({ ...editData, nama: e.target.value })} placeholder="Nama" required />
            <input className="w-full border p-2 rounded" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} placeholder="Email" required />

            {/* Password + toggle 👁️ */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border p-2 rounded pr-10"
                value={editData.password}
                onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                placeholder="Password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2 text-sm text-gray-500">
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <input className="w-full border p-2 rounded" value={editData.alamat} onChange={(e) => setEditData({ ...editData, alamat: e.target.value })} placeholder="Alamat" />
            <select className="w-full border p-2 rounded" value={editData.jenis_kelamin} onChange={(e) => setEditData({ ...editData, jenis_kelamin: e.target.value })}>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
            <input type="date" className="w-full border p-2 rounded" value={editData.tanggal_lahir?.slice(0, 10) || ""} onChange={(e) => setEditData({ ...editData, tanggal_lahir: e.target.value })} />
            <select className="w-full border p-2 rounded" value={editData.peran} onChange={(e) => setEditData({ ...editData, peran: e.target.value })}>
              {editData.sumber === "admin" ? (
                <>
                  <option value="admin">Admin</option>
                  <option value="dokter">Dokter</option>
                </>
              ) : (
                <option value="pengguna">Pengguna</option>
              )}
            </select>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 border rounded">
                Batal
              </button>
              <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded">
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Users;
