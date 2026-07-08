import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Used inside every authenticated portal's route table as the final
 * `path="*"` route. Without this, navigating to an unmatched sub-path
 * (e.g. a stale bookmark, a typo'd URL, a removed page) rendered nothing at
 * all inside the dashboard layout — just a blank content area with the
 * sidebar still showing, which reads as broken rather than "page not found."
 */
export default function PortalNotFound({ homePath = "/" }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-academic-blue/10 text-academic-blue flex items-center justify-center mb-4">
        <Compass size={28} />
      </div>
      <p className="font-heading text-xl font-semibold text-ink-primary mb-1">Page not found</p>
      <p className="text-sm text-ink-secondary mb-6 max-w-sm">
        That page doesn't exist here, or may have moved. Check the sidebar, or head back to your dashboard.
      </p>
      <Link
        to={homePath}
        className="inline-flex items-center gap-2 bg-academic-blue text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-academic-blue/90 transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
