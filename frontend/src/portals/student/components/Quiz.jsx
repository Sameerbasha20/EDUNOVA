import { Clock, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import api from "../lib/api";
import { Loader } from "./Common";

export default function Quiz({ courseId, onClose }) {
  // NOTE: prop is named courseId for call-site brevity but the value passed
  // in is actually the quiz id (see Lms.jsx) — kept as a single id param.
  const quizId = courseId;
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/student/quizzes/${quizId}/`).then(({ data }) => {
      setQuiz(data);
      setSecondsLeft(data.duration_minutes * 60);
    });
  }, [quizId]);

  useEffect(() => {
    if (secondsLeft == null || result) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    timerRef.current = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, result]);

  async function handleSubmit() {
    if (submitting || result) return;
    setSubmitting(true);
    clearTimeout(timerRef.current);
    try {
      const { data } = await api.post(`/student/quizzes/${quizId}/`, { answers });
      setResult(data);
    } finally {
      setSubmitting(false);
    }
  }

  const mm = secondsLeft != null ? String(Math.floor(secondsLeft / 60)).padStart(2, "0") : "--";
  const ss = secondsLeft != null ? String(secondsLeft % 60).padStart(2, "0") : "--";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card w-full max-w-lg shadow-raised max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <p className="font-heading font-semibold">{quiz?.title || "Loading quiz…"}</p>
          <div className="flex items-center gap-3">
            {!result && secondsLeft != null && (
              <span className={`flex items-center gap-1 font-numeric text-sm font-semibold ${secondsLeft < 30 ? "text-danger" : "text-academic-blue"}`}>
                <Clock size={14} /> {mm}:{ss}
              </span>
            )}
            <button onClick={onClose} className="text-ink-secondary"><X size={18} /></button>
          </div>
        </div>

        <div className="p-6">
          {!quiz ? (
            <Loader rows={3} />
          ) : result ? (
            <div className="text-center py-6">
              <p className={`font-numeric text-4xl font-bold mb-1 ${result.passed ? "text-academic-green" : "text-danger"}`}>
                {result.percentage}%
              </p>
              <p className="text-ink-secondary text-sm mb-4">
                {result.score} / {result.total} correct — {result.passed ? "Passed 🎉" : "Not passed"}
              </p>
              <button onClick={onClose} className="bg-academic-blue text-white rounded-xl px-5 py-2 text-sm font-medium">
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {quiz.questions.map((q, idx) => (
                <div key={q.id}>
                  <p className="text-sm font-medium mb-2">{idx + 1}. {q.question_text}</p>
                  <div className="space-y-1.5">
                    {Object.entries(q.options || {}).map(([key, label]) => (
                      <label
                        key={key}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer transition-colors ${
                          answers[q.id] === key ? "border-academic-blue bg-academic-blue/5" : "border-slate-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          className="accent-academic-blue"
                          checked={answers[q.id] === key}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: key }))}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-academic-orange text-white rounded-xl py-2.5 font-medium hover:bg-academic-orange/90 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit quiz"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
