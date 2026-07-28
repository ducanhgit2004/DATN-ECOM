import { useCallback, useContext, useEffect, useState } from "react";
import { Button, CircularProgress, MenuItem, Pagination, Select } from "@mui/material";
import { IoRefreshOutline, IoSearchOutline } from "react-icons/io5";
import { MdLocalPhone, MdOutlineMarkEmailRead, MdVerified } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { MyContext } from "../../App";
import { editData, fetchDataFromApi } from "../../utils/api";

const statusStyles = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-gray-100 text-gray-600",
  Suspended: "bg-red-100 text-red-700",
};

const formatDate = (value) => value
  ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value))
  : "—";

const Users = () => {
  const context = useContext(MyContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const limit = 10;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const result = await fetchDataFromApi(`/api/user/admin/users?${params}`);
    if (result?.success) {
      setUsers(Array.isArray(result.data) ? result.data : []);
      setPagination(result.pagination || { total: 0, totalPages: 1 });
    } else context.alertBox("error", result?.message || "Users could not be loaded.");
    setLoading(false);
  }, [page, search, status, context]);

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  const updateStatus = async (user, nextStatus) => {
    if (user.status === nextStatus) return;
    setUpdatingId(user._id);
    const result = await editData(`/api/user/admin/users/${user._id}/status`, { status: nextStatus });
    if (result?.success) {
      setUsers((items) => items.map((item) => item._id === user._id ? result.data : item));
      context.alertBox("success", result.message);
    } else context.alertBox("error", result?.message || "User status could not be updated.");
    setUpdatingId("");
  };

  const applySearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Users Listing</h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination.total} customer{pagination.total === 1 ? "" : "s"} in total
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select size="small" value={status} displayEmpty onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
            <MenuItem value="Suspended">Suspended</MenuItem>
          </Select>
          <form onSubmit={applySearch} className="relative min-w-[300px]">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search name, email or phone..." className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500" />
          </form>
          <Button onClick={loadUsers} disabled={loading} className="!min-w-10 !border !border-gray-200 !text-gray-600" aria-label="Refresh users">
            <IoRefreshOutline className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {loading ? <div className="flex min-h-[350px] items-center justify-center"><CircularProgress size={34} /></div> :
        users.length === 0 ? <div className="px-5 py-16 text-center text-gray-500">No users match the selected filters.</div> :
        <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr>
            <th className="px-5 py-4">User</th><th className="px-4 py-4">Contact</th><th className="px-4 py-4">Email verification</th><th className="px-4 py-4">Provider</th><th className="px-4 py-4">Joined</th><th className="px-4 py-4">Last login</th><th className="min-w-[170px] px-4 py-4">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">{users.map((user) => <tr key={user._id} className="hover:bg-gray-50/70">
            <td className="px-5 py-4"><div className="flex items-center gap-3"><img src={user.avatar || "/Sample_User_Icon.png"} alt={user.name} className="h-11 w-11 rounded-full border border-gray-100 object-cover" /><div><p className="font-semibold text-gray-900">{user.name}</p><p className="mt-1 text-xs text-gray-400">{user._id}</p></div></div></td>
            <td className="px-4 py-4"><p className="flex items-center gap-2 text-gray-700"><MdOutlineMarkEmailRead />{user.email}</p><p className="mt-2 flex items-center gap-2 text-gray-500"><MdLocalPhone />{user.mobile || "No phone"}</p></td>
            <td className="px-4 py-4">{user.verify_email ? <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700"><MdVerified /> Verified</span> : <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Unverified</span>}</td>
            <td className="px-4 py-4 capitalize text-gray-600">{user.authProvider || "local"}</td>
            <td className="px-4 py-4"><span className="flex items-center gap-2 whitespace-nowrap text-gray-500"><SlCalender />{formatDate(user.createdAt)}</span></td>
            <td className="px-4 py-4 whitespace-nowrap text-gray-500">{formatDate(user.last_login_date)}</td>
            <td className="px-4 py-4"><Select size="small" fullWidth value={user.status || "Active"} disabled={updatingId === user._id} onChange={(event) => updateStatus(user, event.target.value)} className={statusStyles[user.status] || statusStyles.Active}>
              <MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem><MenuItem value="Suspended">Suspended</MenuItem>
            </Select></td>
          </tr>)}</tbody>
        </table></div>}

      {!loading && pagination.total > 0 && <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row">
        <p className="text-sm text-gray-500">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)} of {pagination.total} users</p>
        <Pagination page={page} count={Math.max(1, pagination.totalPages)} color="primary" shape="rounded" onChange={(_, value) => setPage(value)} />
      </div>}
    </div>
  );
};

export default Users;
