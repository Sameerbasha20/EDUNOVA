import { BookMarked, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loader, SectionTitle } from "../components/Common";
import api from "../lib/api";

export default function Library() {
  const [transactions, setTransactions] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api.get("/student/library/").then(({ data }) => setTransactions(data)).catch(() => setTransactions([]));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      api
        .get("/student/library/search/", { params: { q: query } })
        .then(({ data }) => setResults(data))
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Search the digital library</SectionTitle>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or author…"
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm focus-ring outline-none"
          />
        </div>
        {searching && <Loader rows={2} />}
        {results && (
          results.length ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {results.map((b) => (
                <div key={b.id} className="rounded-xl border border-slate-200 p-3 flex items-start gap-3">
                  <BookMarked size={18} className="text-academic-blue shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{b.title}</p>
                    <p className="text-xs text-ink-secondary truncate">{b.author}</p>
                    <Badge tone={b.available_quantity > 0 ? "green" : "red"}>
                      {b.available_quantity > 0 ? `${b.available_quantity} available` : "All copies issued"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState label="No books matched your search." />
          )
        )}
      </Card>

      <Card>
        <SectionTitle>My issued books</SectionTitle>
        {!transactions ? (
          <Loader rows={3} />
        ) : transactions.length ? (
          <div className="divide-y divide-slate-100">
            {transactions.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{t.book_detail?.title}</p>
                  <p className="text-xs text-ink-secondary">{t.book_detail?.author}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-secondary">Due {t.due_date}</p>
                  {t.return_date ? (
                    <Badge tone="green">Returned</Badge>
                  ) : (
                    <Badge tone={Number(t.fine_amount) > 0 ? "red" : "blue"}>
                      {Number(t.fine_amount) > 0 ? `Fine ₹${t.fine_amount}` : "Issued"}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState label="You haven't borrowed any books yet." />
        )}
      </Card>
    </div>
  );
}
