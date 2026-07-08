import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader } from "../components/Common";

export default function Messages() {
  const [teachers, setTeachers] = useState(null);
  const [activeTeacher, setActiveTeacher] = useState(null);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/parent/teachers/").then(({ data }) => {
      setTeachers(data);
      if (data.length) setActiveTeacher(data[0]);
    }).catch(() => setTeachers([]));
  }, []);

  useEffect(() => {
    if (!activeTeacher) return;
    api.get(`/parent/messages/?with=${activeTeacher.id}`).then(({ data }) => setThread(data)).catch(() => setThread([]));
  }, [activeTeacher]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || !activeTeacher) return;
    await api.post("/parent/messages/", { receiver: activeTeacher.id, message_text: text });
    setText("");
    const { data } = await api.get(`/parent/messages/?with=${activeTeacher.id}`);
    setThread(data);
  }

  if (!teachers) return <Loader rows={4} />;
  if (teachers.length === 0) return <EmptyState label="No teachers found for your children's classes yet." />;

  return (
    <div className="grid lg:grid-cols-[16rem_1fr] gap-4 h-[70vh]">
      <Card className="overflow-y-auto">
        <div className="space-y-1">
          {teachers.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTeacher(t)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                activeTeacher?.id === t.id ? "bg-academic-green/10 text-academic-green font-semibold" : "hover:bg-gray-50"
              }`}
            >
              {t.name}
              <span className="block text-xs text-ink-secondary">{t.subject_name} · {t.class_name}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2 mb-3">
          {thread.map((m) => (
            <div key={m.id} className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
              m.sender === activeTeacher?.id ? "bg-gray-100 text-ink-primary" : "bg-academic-green text-white ml-auto"
            }`}>
              {m.message_text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={send} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus-ring outline-none"
          />
          <button className="bg-academic-green text-white px-4 rounded-xl"><Send size={16} /></button>
        </form>
      </Card>
    </div>
  );
}
