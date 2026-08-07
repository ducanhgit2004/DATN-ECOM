import { useContext, useEffect, useMemo, useState } from "react";
import { FiInbox, FiMessageCircle, FiSearch } from "react-icons/fi";
import { MyContext } from "../../App";
import { editData, fetchDataFromApi } from "../../utils/api";

const badge = {
  open: "bg-amber-50 text-amber-700",
  answered: "bg-emerald-50 text-emerald-700",
  closed: "bg-gray-100 text-gray-600",
};

const Support = () => {
  const context = useContext(MyContext);
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState({});
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDataFromApi("/api/support/admin/tickets").then((result) => {
      if (result?.success) setTickets(result.data || []);
      else context.alertBox("error", result?.message || "Unable to load support requests.");
      setLoading(false);
    });
    // Load once when this admin screen opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesStatus = filter === "all" || ticket.status === filter;
      const text = `${ticket.subject} ${ticket.message} ${ticket.userId?.name} ${ticket.userId?.email}`.toLowerCase();
      return matchesStatus && (!needle || text.includes(needle));
    });
  }, [tickets, filter, query]);

  const replaceTicket = (updated) =>
    setTickets((current) => current.map((item) => item._id === updated._id ? updated : item));

  const sendReply = async (ticket) => {
    const reply = String(drafts[ticket._id] ?? ticket.adminReply ?? "").trim();
    if (!reply) return context.alertBox("error", "Please enter a reply.");
    setBusy(ticket._id);
    const result = await editData(`/api/support/admin/tickets/${ticket._id}/reply`, { reply });
    if (result?.success) {
      replaceTicket(result.data);
      context.alertBox("success", result.message);
    } else context.alertBox("error", result?.message || "Unable to send reply.");
    setBusy("");
  };

  const changeStatus = async (ticket, status) => {
    setBusy(ticket._id);
    const result = await editData(`/api/support/admin/tickets/${ticket._id}/status`, { status });
    if (result?.success) {
      replaceTicket(result.data);
      context.alertBox("success", result.message);
    } else context.alertBox("error", result?.message || "Unable to update status.");
    setBusy("");
  };

  const openCount = tickets.filter((ticket) => ticket.status === "open").length;

  return (
    <section>
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#ff5252]">Customer care</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Support Requests</h1>
          <p className="mt-1 text-sm text-gray-500">Review customer issues and reply directly from here.</p>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-[#ff5252] to-[#ef7558] p-5 text-white shadow-sm">
          <FiInbox size={30} /><div><strong className="text-3xl">{openCount}</strong><p className="text-sm text-white/80">Awaiting reply</p></div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row">
        <label className="relative flex-1"><FiSearch className="absolute left-3 top-3.5 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, subject, or message..." className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 outline-none focus:border-[#ff5252]" /></label>
        <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-4 py-2.5"><option value="all">All statuses</option><option value="open">Open</option><option value="answered">Answered</option><option value="closed">Closed</option></select>
      </div>

      {loading ? <div className="py-16 text-center text-gray-500">Loading support requests...</div> : filtered.length ? (
        <div className="mt-5 space-y-4">
          {filtered.map((ticket) => (
            <article key={ticket._id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold uppercase text-[#ff5252]">{ticket.category}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${badge[ticket.status]}`}>{ticket.status}</span></div><h2 className="mt-2 text-lg font-bold text-gray-900">{ticket.subject}</h2><p className="mt-1 text-xs text-gray-500">{ticket.userId?.name || "Customer"} · {ticket.userId?.email || "No email"} · {new Date(ticket.createdAt).toLocaleString()}</p></div>
                <select disabled={busy === ticket._id} value={ticket.status} onChange={(event) => changeStatus(ticket, event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"><option value="open">Open</option><option value="answered">Answered</option><option value="closed">Closed</option></select>
              </div>
              <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">{ticket.message}</div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800"><FiMessageCircle className="text-[#ff5252]" /> Admin reply</label>
                <textarea rows="4" maxLength="3000" value={drafts[ticket._id] ?? ticket.adminReply ?? ""} onChange={(event) => setDrafts((current) => ({ ...current, [ticket._id]: event.target.value }))} placeholder="Write a helpful response to this customer..." className="mt-2 w-full resize-y rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-[#ff5252]" />
                <div className="mt-3 flex justify-end"><button type="button" disabled={busy === ticket._id} onClick={() => sendReply(ticket)} className="rounded-lg bg-[#ff5252] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e74848] disabled:opacity-50">{busy === ticket._id ? "Saving..." : ticket.adminReply ? "Update reply" : "Send reply"}</button></div>
              </div>
            </article>
          ))}
        </div>
      ) : <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center text-gray-500">No support requests match this filter.</div>}
    </section>
  );
};

export default Support;
