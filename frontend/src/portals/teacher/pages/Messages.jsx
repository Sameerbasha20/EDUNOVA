import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card, EmptyState, Loader } from "../components/Common";
import api from "../lib/api";

export default function Messages() {
  const [inbox, setInbox] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const bottomRef = useRef(null);

  const me = JSON.parse(localStorage.getItem("edunova_teacher_user") || "{}");

  function loadInbox() {
    api.get("/teacher/messages/").then(({ data }) => setInbox(data));
  }

  useEffect(() => {
    loadInbox();
    api.get("/teacher/contacts/").then(({ data }) => setContacts(data));
  }, []);

  useEffect(() => {
    if (!active) return;
    api.get("/teacher/messages/", { params: { with: active.id } }).then(({ data }) => setThread(data));
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  async function send() {
    if (!text.trim() || !active) return;
    await api.post("/teacher/messages/", { receiver: active.id, message_text: text });
    setText("");
    const { data } = await api.get("/teacher/messages/", { params: { with: active.id } });
    setThread(data);
    loadInbox();
  }

  if (!inbox) return <Loader rows={4} />;

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[70vh]">
      <Card className="md:col-span-1 flex flex-col overflow-hidden">
        <button
          onClick={() => setShowContacts((v) => !v)}
          className="mb-3 text-sm font-medium text-white bg-academic-blue rounded-xl py-2"
        >
          New message
        </button>
        {showContacts && (
          <div className="mb-3 max-h-40 overflow-y-auto border border-slate-100 rounded-xl">
            {contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => { setActive(c); setShowContacts(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-surface-light flex justify-between"
              >
                <span>{c.name}</span>
                <span className="text-xs text-ink-secondary">{c.role}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto space-y-1">
          {inbox.length ? (
            inbox.map((m) => {
              const otherId = m.sender_name === me.name ? m.receiver : m.sender;
              const otherName = m.sender_name === me.name ? m.receiver_name : m.sender_name;
              return (
                <button
                  key={m.id}
                  onClick={() => setActive({ id: otherId, name: otherName })}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm ${active?.id === otherId ? "bg-academic-blue/10" : "hover:bg-surface-light"}`}
                >
                  <p className="font-medium">{otherName}</p>
                  <p className="text-xs text-ink-secondary truncate">{m.message_text}</p>
                </button>
              );
            })
          ) : (
            <EmptyState label="No conversations yet." />
          )}
        </div>
      </Card>

      <Card className="md:col-span-2 flex flex-col overflow-hidden">
        {!active ? (
          <EmptyState label="Select a conversation or start a new message." />
        ) : (
          <>
            <p className="font-heading font-semibold mb-3 pb-3 border-b border-slate-100">{active.name}</p>
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {thread?.map((m) => {
                const mine = m.sender_name === me.name;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-academic-blue text-white" : "bg-surface-light"}`}>
                      {m.message_text}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message…"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring outline-none"
              />
              <button onClick={send} className="bg-academic-blue text-white rounded-xl px-4 hover:bg-academic-blue/90">
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
