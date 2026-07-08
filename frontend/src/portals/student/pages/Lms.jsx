import { CheckCircle2, Circle, FileText, MessageSquarePlus, PlayCircle, Radio, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, EmptyState, Loader } from "../components/Common";
import api from "../lib/api";
import Quiz from "../components/Quiz";
import CourseForum from "../components/CourseForum";

const ICONS = {
  Video_Link: PlayCircle,
  Recorded_Video_File: Video,
  PDF_Notes: FileText,
  Live_Class_URL: Radio,
};

export default function Lms() {
  const [courses, setCourses] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [forumCourseId, setForumCourseId] = useState(null);
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    api.get("/student/courses/").then(({ data }) => setCourses(data)).catch(() => setCourses([]));
  }, []);

  async function toggleComplete(contentId) {
    setCompleted((c) => ({ ...c, [contentId]: !c[contentId] }));
    try {
      await api.post("/lms/mark-complete/", { content_id: contentId });
    } catch { /* non-critical — UI already reflects the toggle */ }
  }

  if (!courses) return <Loader rows={4} />;
  if (!courses.length) return <EmptyState label="No courses published for your class yet." />;

  return (
    <div className="space-y-4">
      {courses.map((c) => (
        <Card key={c.id}>
          <div className="flex items-center justify-between mb-2">
            <p className="font-heading font-semibold">{c.title}</p>
            <span className="text-xs text-ink-secondary">{c.subject_name}</span>
          </div>
          {c.description && <p className="text-sm text-ink-secondary mb-3">{c.description}</p>}
          {c.content.length ? (
            <ul className="grid sm:grid-cols-2 gap-2">
              {c.content.map((item) => {
                const Icon = ICONS[item.content_type] || FileText;
                const done = completed[item.id];
                return (
                  <li key={item.id} className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleComplete(item.id)}
                      title={done ? "Marked complete" : "Mark as complete"}
                      className="shrink-0 text-academic-green"
                    >
                      {done ? <CheckCircle2 size={18} /> : <Circle size={18} className="text-slate-300" />}
                    </button>
                    <a
                      href={item.resource_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center gap-2 rounded-xl bg-surface-light px-3 py-2.5 text-sm hover:bg-academic-blue/5 transition-colors min-w-0"
                    >
                      <Icon size={16} className="text-academic-blue shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-ink-secondary">No content uploaded yet.</p>
          )}
          {c.quizzes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {c.quizzes.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setQuizId(q.id)}
                  className="text-sm font-medium text-academic-orange hover:underline"
                >
                  Take quiz: {q.title} →
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setForumCourseId(c.id)}
            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-academic-blue hover:underline"
          >
            <MessageSquarePlus size={14} /> Discussion &amp; Notes
          </button>
        </Card>
      ))}

      {quizId && <Quiz courseId={quizId} onClose={() => setQuizId(null)} />}
      {forumCourseId && <CourseForum api={api} courseId={forumCourseId} onClose={() => setForumCourseId(null)} />}
    </div>
  );
}
