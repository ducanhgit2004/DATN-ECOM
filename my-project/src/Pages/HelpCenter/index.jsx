import { useContext, useEffect, useState } from "react";
import { FiChevronDown, FiClock, FiHeadphones, FiMessageCircle, FiSend } from "react-icons/fi";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";
import { fetchDataFromApi, postData } from "../../utils/api";

const faqs = [
  { category: "Orders", question: "How can I track my order?", answer: "Open My Orders and select the order you want to track. Its latest status and delivery details will be shown there." },
  { category: "Orders", question: "Can I change or cancel an order?", answer: "You can request a cancellation while the order is still pending. Once it is being processed or shipped, please send a support request below." },
  { category: "Delivery", question: "Why is my delivery delayed?", answer: "Weather, carrier volume, or address verification can cause delays. Check Order Tracking first, then contact us with your order number if there is no update." },
  { category: "Payment", question: "My payment failed but money was deducted", answer: "Most failed payments are automatically reversed by the payment provider. If the amount is not returned within the provider's processing time, send us the order and payment details." },
  { category: "Returns", question: "How do returns and refunds work?", answer: "Open the relevant order and contact support with the item and reason. Approved refunds are returned to the original payment method after inspection." },
  { category: "Account", question: "I cannot access my account", answer: "Use Forgot Password on the login page. If you no longer have access to your registered email, create a support request so the admin can assist." },
];

const statusStyle = {
  open: "bg-amber-50 text-amber-700",
  answered: "bg-emerald-50 text-emerald-700",
  closed: "bg-gray-100 text-gray-600",
};

const HelpCenter = () => {
  const context = useContext(MyContext);
  const [openFaq, setOpenFaq] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ category: "order", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!context.isLogin) return;
    let active = true;
    fetchDataFromApi("/api/support/tickets/my").then((result) => {
      if (active && result?.success) setTickets(result.data || []);
    });
    return () => { active = false; };
  }, [context.isLogin]);

  const submit = async (event) => {
    event.preventDefault();
    if (!context.isLogin) {
      context.alertBox("error", "Please log in to send a support request.");
      return;
    }
    setSubmitting(true);
    const result = await postData("/api/support/tickets", form);
    if (result?.success) {
      setTickets((current) => [result.data, ...current]);
      setForm({ category: "order", subject: "", message: "" });
      context.alertBox("success", result.message);
    } else context.alertBox("error", result?.message || "Unable to send your request.");
    setSubmitting(false);
  };

  return (
    <main className="bg-[#f8f9fb] pb-16">
      <section className="bg-gradient-to-br from-[#ff5252] to-[#ef7558] px-5 py-16 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20"><FiHeadphones size={28} /></div>
          <h1 className="text-3xl font-bold md:text-4xl">How can we help?</h1>
          <p className="mx-auto mt-3 max-w-2xl text-white/85">Find a quick answer or send your issue directly to the NovaCart support team.</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-7 px-5 py-10 lg:grid-cols-[1.05fr_.95fr]">
        <section>
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#ff5252]">Quick answers</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <article key={faq.question} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="flex w-full items-center gap-3 bg-white px-5 py-4 text-left text-gray-900">
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-[#ff5252]">{faq.category}</span>
                  <strong className="flex-1 text-sm md:text-base">{faq.question}</strong>
                  <FiChevronDown className={`transition ${openFaq === index ? "rotate-180" : ""}`} />
                </button>
                {openFaq === index && <p className="border-t border-gray-100 px-5 py-4 text-sm leading-6 text-gray-600">{faq.answer}</p>}
              </article>
            ))}
          </div>
        </section>

        <section className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#ff5252]"><FiMessageCircle size={22} /></span>
            <div><h2 className="text-xl font-bold text-gray-900">Tell us your issue</h2><p className="mt-1 text-sm text-gray-500">An admin will review and reply to your request.</p></div>
          </div>
          {!context.isLogin && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Please <Link to="/login" className="font-bold underline">log in</Link> to send and track support requests.
            </div>
          )}
          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Issue type
              <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-normal outline-none focus:border-[#ff5252]">
                <option value="order">Order</option><option value="payment">Payment</option><option value="delivery">Delivery</option><option value="return">Return or refund</option><option value="account">Account</option><option value="product">Product</option><option value="other">Other</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-gray-700">Subject
              <input required minLength="5" maxLength="160" value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Briefly describe the problem" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-normal outline-none focus:border-[#ff5252]" />
            </label>
            <label className="block text-sm font-semibold text-gray-700">Details
              <textarea required minLength="10" maxLength="3000" rows="6" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="Include an order number and any useful details..." className="mt-2 w-full resize-y rounded-lg border border-gray-300 px-3 py-3 font-normal outline-none focus:border-[#ff5252]" />
            </label>
            <button type="submit" disabled={!context.isLogin || submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff5252] px-5 py-3 font-semibold text-white transition hover:bg-[#e74848] disabled:cursor-not-allowed disabled:opacity-50">
              <FiSend /> {submitting ? "Sending..." : "Send to support"}
            </button>
          </form>
        </section>
      </div>

      {context.isLogin && (
        <section className="mx-auto max-w-6xl px-5">
          <div className="mb-4 flex items-center gap-3"><FiClock className="text-[#ff5252]" /><h2 className="text-xl font-bold">Your support requests</h2></div>
          {tickets.length ? <div className="space-y-3">{tickets.map((ticket) => (
            <article key={ticket._id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><span className="text-xs font-semibold uppercase text-[#ff5252]">{ticket.category}</span><h3 className="mt-1 font-bold text-gray-900">{ticket.subject}</h3></div><span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle[ticket.status]}`}>{ticket.status}</span></div>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">{ticket.message}</p>
              <p className="mt-2 text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleString()}</p>
              {ticket.adminReply && <div className="mt-4 rounded-xl border-l-4 border-[#ff5252] bg-red-50 p-4"><b className="text-sm text-[#ff5252]">NovaCart Support</b><p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-700">{ticket.adminReply}</p>{ticket.repliedAt && <p className="mt-2 text-xs text-gray-400">{new Date(ticket.repliedAt).toLocaleString()}</p>}</div>}
            </article>
          ))}</div> : <div className="rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center text-sm text-gray-500">You have not submitted any support requests yet.</div>}
        </section>
      )}
    </main>
  );
};

export default HelpCenter;
