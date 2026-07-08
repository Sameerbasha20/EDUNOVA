import { MessageSquare, NotebookText, Send, X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Expects an `api` axios instance (each portal has its own with its own auth
 * token) passed in as a prop, so this one component works for both the
 * Student and Teacher portals without duplicating it per-portal.
 */
export default function CourseForum({ api, courseId, onClose }) {
  const [tab, setTab] = useState("forum");
  const [topics, setTopics] = useState(null);
  const [notes, setNotes] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [newTopic, setNewTopic] = useState({ title: "", content: "" });
  const [reply, setReply] = useState("");
  const [newNote, setNewNote] = useState({ title: "", body_markdown: "" });

  function loadTopics() {
    api.get(`/lms/forum-topics/?course_id=${courseId}`).then(({ data }) => setTopics(data)).catch(() => setTopics([]));
  }
  function loadNotes() {
    api.get(`/lms/notes/?course_id=${courseId}`).then(({ data }) => setNotes(data)).catch(() => setNotes([]));
  }
  useEffect(() => { loadTopics(); loadNotes(); }, [courseId]);

  async function postTopic(e) {
    e.preventDefault();
    if (!newTopic.title.trim() || !newTopic.content.trim()) return;
    await api.post("/lms/forum-topics/", { course_id: courseId, ...newTopic });
    setNewTopic({ title: "", content: "" });
    loadTopics();
  }

  async function openTopic(id) {
    const { data } = await api.get(`/lms/forum-topics/${id}/`);
    setActiveTopic(data);
  }

  async function postReply(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    await api.post(`/lms/forum-topics/${activeTopic.id}/reply/`, { post_text: reply });
    setReply("");
    openTopic(activeTopic.id);
    loadTopics();
  }

  async function postNote(e) {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.body_markdown.trim()) return;
    await api.post("/lms/notes/", { course_id: courseId, ...newNote });
    setNewNote({ title: "", body_markdown: "" });
    loadNotes();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("forum")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${tab === "forum" ? "bg-academic-blue text-white" : "bg-slate-100 text-ink-secondary"}`}
            >
              <MessageSquare size={14} /> Discussion
            </button>
            <button
              onClick={() => setTab("notes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${tab === "notes" ? "bg-academic-blue text-white" : "bg-slate-100 text-ink-secondary"}`}
            >
              <NotebookText size={14} /> Digital Notes
            </button>
          </div>
          <button onClick={onClose} className="text-ink-secondary hover:text-ink-primary"><X size={20} /></button>
        </div>

        {tab === "forum" && !activeTopic && (
          <div className="space-y-4">
            <form onSubmit={postTopic} className="space-y-2 bg-surface-light rounded-xl p-3">
              <input placeholder="Start a new topic…" value={newTopic.title} onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <textarea placeholder="What's on your mind?" rows={2} value={newTopic.content} onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <button className="text-sm font-medium text-academic-blue hover:underline flex items-center gap-1"><Send size={13} /> Post topic</button>
            </form>
            {topics === null ? (
              <p className="text-sm text-ink-secondary">Loading…</p>
            ) : topics.length === 0 ? (
              <p className="text-sm text-ink-secondary text-center py-4">No topics yet — start the conversation.</p>
            ) : (
              <ul className="space-y-2">
                {topics.map((t) => (
                  <li key={t.id}>
                    <button onClick={() => openTopic(t.id)} className="w-full text-left rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-surface-light transition-colors">
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-ink-secondary mt-0.5">{t.creator_name} · {t.reply_count} repl{t.reply_count === 1 ? "y" : "ies"}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "forum" && activeTopic && (
          <div className="space-y-3">
            <button onClick={() => setActiveTopic(null)} className="text-xs text-academic-blue hover:underline">← Back to topics</button>
            <div>
              <p className="font-heading font-semibold">{activeTopic.title}</p>
              <p className="text-xs text-ink-secondary mb-2">{activeTopic.creator_name}</p>
              <p className="text-sm">{activeTopic.content}</p>
            </div>
            <div className="space-y-2 border-t border-slate-100 pt-3">
              {activeTopic.posts.map((p) => (
                <div key={p.id} className="bg-surface-light rounded-xl px-3 py-2">
                  <p className="text-xs font-medium text-ink-secondary">{p.author_name}</p>
                  <p className="text-sm">{p.post_text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={postReply} className="flex gap-2">
              <input placeholder="Write a reply…" value={reply} onChange={(e) => setReply(e.target.value)} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <button className="px-3 rounded-lg bg-academic-blue text-white"><Send size={14} /></button>
            </form>
          </div>
        )}

        {tab === "notes" && (
          <div className="space-y-4">
            <form onSubmit={postNote} className="space-y-2 bg-surface-light rounded-xl p-3">
              <input placeholder="Note title" value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <textarea placeholder="Write your notes (markdown supported)…" rows={3} value={newNote.body_markdown} onChange={(e) => setNewNote({ ...newNote, body_markdown: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono" />
              <button className="text-sm font-medium text-academic-blue hover:underline flex items-center gap-1"><Send size={13} /> Save note</button>
            </form>
            {notes === null ? (
              <p className="text-sm text-ink-secondary">Loading…</p>
            ) : notes.length === 0 ? (
              <p className="text-sm text-ink-secondary text-center py-4">No notes shared yet.</p>
            ) : (
              <ul className="space-y-2">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-xl border border-slate-100 px-3 py-2.5">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-ink-secondary mb-1">{n.author_name}</p>
                    <p className="text-sm whitespace-pre-wrap">{n.body_markdown}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
