import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { request } from "./api";

const socketUrl = import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000";
const idOf = (value) => value?._id || value;

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const messagesRef = useRef(null);
  const selected = useMemo(() => conversations.find((item) => item._id === selectedId), [conversations, selectedId]);

  useEffect(() => {
    request("/api/chat/conversations").then((result) => {
      if (result?.success) {
        setConversations(result.data || []);
        setSelectedId((value) => value || result.data?.[0]?._id || "");
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    request(`/api/chat/conversations/${selectedId}/messages`).then((result) => {
      if (result?.success) {
        setMessages(result.data || []);
        setConversations((items) => items.map((item) => item._id === selectedId ? { ...item, unreadSeller: 0 } : item));
      }
    });
  }, [selectedId]);

  useEffect(() => {
    const socket = io(socketUrl, { auth: { token: localStorage.getItem("sellerAccessToken") } });
    socket.on("chat:message", (message) => {
      setConversations((items) => items.map((item) => item._id === message.conversationId ? {
        ...item,
        lastMessage: message.text,
        lastMessageAt: message.createdAt,
        unreadSeller: message.conversationId === selectedId ? 0 : Number(item.unreadSeller || 0) + 1,
      } : item));
      if (message.conversationId === selectedId) {
        setMessages((items) => items.some((item) => item._id === message._id) ? items : [...items, message]);
      }
    });
    return () => socket.disconnect();
  }, [selectedId]);

  useEffect(() => {
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  const send = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !selectedId) return;
    setDraft("");
    const result = await request(`/api/chat/conversations/${selectedId}/messages`, { method: "POST", body: { text } });
    if (result?.success) setMessages((items) => items.some((item) => item._id === result.data._id) ? items : [...items, result.data]);
  };

  return (
    <section className="chat-panel">
      <div className="chat-list">
        <h2>Messages</h2>
        {!conversations.length && <p className="mini-empty">No customer messages yet.</p>}
        {conversations.map((conversation) => (
          <button className={`chat-contact ${selectedId === conversation._id ? "active" : ""}`} key={conversation._id} onClick={() => setSelectedId(conversation._id)}>
            <span className="chat-avatar">{conversation.customerId?.name?.[0] || "C"}</span>
            <span><strong>{conversation.customerId?.name || "Customer"}</strong><small>{conversation.lastMessage || "New conversation"}</small></span>
            {conversation.unreadSeller > 0 && <b>{conversation.unreadSeller}</b>}
          </button>
        ))}
      </div>
      <div className="chat-room">
        {selected ? <>
          <header><div><h3>{selected.customerId?.name || "Customer"}</h3><small>{selected.productName || "Store enquiry"}</small></div></header>
          <div ref={messagesRef} className="chat-messages">
            {messages.map((message) => <div key={message._id} className={`chat-bubble ${idOf(message.senderId) === idOf(selected.sellerId) ? "mine" : ""}`}>{message.text}</div>)}
          </div>
          <form className="chat-compose" onSubmit={send}><input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength="2000" placeholder="Write a reply..." /><button>Send</button></form>
        </> : <div className="mini-empty">Select a conversation.</div>}
      </div>
    </section>
  );
}
