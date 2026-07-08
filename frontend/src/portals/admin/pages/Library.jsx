import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";

export default function Library() {
  const [books, setBooks] = useState(null);
  const [bookForm, setBookForm] = useState({ title: "", author: "", isbn: "", barcode_id: "", quantity: 1, available_quantity: 1, book_type: "Physical", digital_file_url: "" });
  const [issueForm, setIssueForm] = useState({ book_id: "", borrower_id: "", loan_days: 14 });
  const [returnId, setReturnId] = useState("");
  const [toast, setToast] = useState("");

  function load() {
    api.get("/admin-portal/library/books/").then(({ data }) => setBooks(data)).catch(() => setBooks([]));
  }
  useEffect(() => { load(); }, []);

  async function addBook(e) {
    e.preventDefault();
    try {
      await api.post("/admin-portal/library/books/", bookForm);
      setBookForm({ title: "", author: "", isbn: "", barcode_id: "", quantity: 1, available_quantity: 1, book_type: "Physical", digital_file_url: "" });
      load();
    } catch { setToast("Could not add book."); }
  }

  async function issue(e) {
    e.preventDefault();
    try {
      const { data } = await api.post("/admin-portal/library/issue/", issueForm);
      setToast(`Issued. Due back ${data.due_date}.`);
      setIssueForm({ book_id: "", borrower_id: "", loan_days: 14 });
      load();
    } catch (err) { setToast(err?.response?.data?.detail || "Could not issue book."); }
  }

  async function returnBook(e) {
    e.preventDefault();
    try {
      const { data } = await api.post(`/admin-portal/library/return/${returnId}/`, {});
      setToast(`Returned. ${data.late_days} day(s) late — fine ₹${data.fine_amount}.`);
      setReturnId("");
      load();
    } catch (err) { setToast(err?.response?.data?.detail || "Could not process return."); }
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <SectionTitle>Issue a book (barcode/ID)</SectionTitle>
          <form onSubmit={issue} className="grid grid-cols-2 gap-3">
            <input required placeholder="Book ID" value={issueForm.book_id} onChange={(e) => setIssueForm({ ...issueForm, book_id: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input required placeholder="Borrower user ID" value={issueForm.borrower_id} onChange={(e) => setIssueForm({ ...issueForm, borrower_id: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input type="number" placeholder="Loan days" value={issueForm.loan_days} onChange={(e) => setIssueForm({ ...issueForm, loan_days: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <button className="bg-academic-blue text-white rounded-xl py-2 font-medium">Issue</button>
          </form>
        </Card>
        <Card>
          <SectionTitle>Return a book</SectionTitle>
          <form onSubmit={returnBook} className="grid grid-cols-2 gap-3">
            <input required placeholder="Transaction ID" value={returnId} onChange={(e) => setReturnId(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <button className="bg-academic-green text-white rounded-xl py-2 font-medium">Return (auto fine calc)</button>
          </form>
          <p className="text-xs text-ink-secondary mt-2">Fine is calculated automatically: ₹5/day beyond the due date.</p>
        </Card>
      </div>

      <Card>
        <SectionTitle>Add book to catalogue</SectionTitle>
        <form onSubmit={addBook} className="grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <input required placeholder="Title" value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input required placeholder="Author" value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="ISBN" value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Barcode ID" value={bookForm.barcode_id} onChange={(e) => setBookForm({ ...bookForm, barcode_id: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input type="number" placeholder="Quantity" value={bookForm.quantity} onChange={(e) => setBookForm({ ...bookForm, quantity: e.target.value, available_quantity: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <button className="sm:col-span-3 lg:col-span-4 bg-academic-blue text-white rounded-xl py-2 font-medium">Add book</button>
        </form>
      </Card>

      <Card>
        <SectionTitle>Catalogue</SectionTitle>
        {!books ? <Loader rows={3} /> : books.length === 0 ? <EmptyState label="No books in the catalogue yet." /> : (
          <div className="divide-y divide-slate-100">
            {books.map((b) => (
              <div key={b.id} className="py-2 text-sm flex justify-between">
                <span>{b.title} — {b.author}</span>
                <span className="text-ink-secondary">ID #{b.id} · {b.available_quantity}/{b.quantity} available</span>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
