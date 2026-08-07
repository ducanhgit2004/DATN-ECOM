import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { fetchDataFromApi, postData } from "../../utils/api";

const Messages = () => {
  const [params] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(params.get("conversation") || "");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000";

  const loadConversations = async () => {
    const result = await fetchDataFromApi("/api/chat/conversations");
    if (result?.success) {
      setConversations(result.data || []);
      setSelectedId((current) => current || result.data?.[0]?._id || "");
    }
  };
  const loadMessages = async (id) => {
    if (!id) return;
    const result = await fetchDataFromApi(`/api/chat/conversations/${id}/messages`);
    if (result?.success) setMessages(result.data || []);
  };

  useEffect(() => {
    const timer = window.setTimeout(loadConversations, 0);
    const socket = io(apiUrl, {
      auth: { token: localStorage.getItem("accesstoken") },
    });
    socket.on("chat:message", (message) => {
      setMessages((current) =>
        String(message.conversationId) === String(selectedId) &&
        !current.some((item) => item._id === message._id)
          ? [...current, message]
          : current,
      );
      loadConversations();
    });
    return () => {
      window.clearTimeout(timer);
      socket.disconnect();
    };
  }, [apiUrl, selectedId]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadMessages(selectedId), 0);
    return () => window.clearTimeout(timer);
  }, [selectedId]);
  useEffect(() => {
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  const submit = async (event) => {
    event.preventDefault();
    if (!text.trim() || !selectedId) return;
    const value = text.trim();
    setText("");
    const result = await postData(`/api/chat/conversations/${selectedId}/messages`, { text: value });
    if (result?.success)
      setMessages((current) =>
        current.some((item) => item._id === result.data._id)
          ? current
          : [...current, result.data],
      );
    loadConversations();
  };
  const selected = conversations.find((item) => item._id === selectedId);

  return (
    <section className="bg-[#f7f5f5] py-8 min-h-[650px]">
      <div className="container">
        <div className="grid h-[640px] grid-cols-[320px_1fr] overflow-hidden rounded-2xl border bg-white shadow-sm">
          <aside className="border-r bg-white">
            <h1 className="border-b p-5 text-xl font-bold">Messages</h1>
            <div className="overflow-y-auto h-[580px]">
              {conversations.map((item) => (
                <button key={item._id} onClick={() => setSelectedId(item._id)} className={`flex w-full gap-3 border-b p-4 text-left ${selectedId === item._id ? "bg-red-50" : "hover:bg-gray-50"}`}>
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
                    {item.sellerId?.storeLogo ? <img src={item.sellerId.storeLogo} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center font-bold">{item.sellerId?.storeName?.[0] || "S"}</span>}
                  </div>
                  <span className="min-w-0 flex-1"><strong className="block truncate">{item.sellerId?.storeName}</strong><small className="block truncate text-gray-500">{item.lastMessage || item.productName || "Start a conversation"}</small></span>
                  {item.unreadCustomer > 0 && <b className="rounded-full bg-red-500 px-2 py-1 text-xs text-white">{item.unreadCustomer}</b>}
                </button>
              ))}
            </div>
          </aside>
          <main className="flex min-w-0 flex-col">
            {selected ? <>
              <header className="border-b p-4"><strong>{selected.sellerId?.storeName}</strong>{selected.productName && <small className="block text-gray-500">About: {selected.productName}</small>}</header>
              <div ref={messagesRef} className="flex-1 overflow-y-auto bg-gray-50 p-5">
                {messages.map((message) => {
                  const mine = String(message.senderId?._id) !== String(selected.sellerId?._id);
                  return <div key={message._id} className={`mb-3 flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-[#ff5252] text-white" : "border bg-white text-gray-800"}`}><p>{message.text}</p><small className="mt-1 block opacity-70">{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></div></div>;
                })}
              </div>
              <form onSubmit={submit} className="flex gap-3 border-t p-4"><input value={text} maxLength={2000} onChange={(event) => setText(event.target.value)} placeholder="Write a message..." className="flex-1 rounded-xl border px-4 outline-none focus:border-[#ff5252]" /><button className="rounded-xl bg-[#ff5252] px-6 py-3 font-semibold text-white">Send</button></form>
            </> : <div className="grid flex-1 place-items-center text-gray-500">Select a conversation to start chatting.</div>}
          </main>
        </div>
      </div>
    </section>
  );
};

export default Messages;
