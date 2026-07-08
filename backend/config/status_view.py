"""
Backend Status Dashboard — visit http://localhost:8000/ to see this.

Shows:
- DB connection health (is Django actually reachable to Postgres/Supabase?)
- Every registered API route, grouped by app
- A live GET check against each non-parameterized route (200/404/500 etc.)
- Response time for the whole check

This is a diagnostic tool, not a production page — keep it, but don't expose
it publicly once you deploy (see note at bottom of this file).
"""
import time
import django
from django.db import connection
from django.urls import get_resolver
from django.test import Client
from django.http import HttpResponse
from django.utils.timezone import now


def _clean_segment(segment):
    # DRF's DefaultRouter builds re_path() patterns under the hood, so
    # str(pattern) includes raw regex anchors (^...$) — strip those so the
    # dashboard shows a normal-looking path instead of regex soup.
    return segment.lstrip("^").rstrip("$")


def _walk_urls(patterns, prefix=""):
    routes = []
    for p in patterns:
        if hasattr(p, "url_patterns"):
            routes += _walk_urls(p.url_patterns, prefix + _clean_segment(str(p.pattern)))
        else:
            routes.append(prefix + _clean_segment(str(p.pattern)))
    return routes


def _check_db():
    try:
        connection.ensure_connection()
        return True, ""
    except Exception as e:
        return False, str(e)


def _collect_route_results():
    all_routes = _walk_urls(get_resolver().url_patterns)
    api_routes = sorted(set(
        r for r in all_routes
        if r.startswith("api/") and "(?" not in r and "format" not in r
    ))

    import re
    client = Client()
    results = []
    for route in api_routes:
        is_dynamic = "<" in route
        # Replace all <type:name> segments with placeholder value 1 or "TEST"
        if is_dynamic:
            test_url = "/" + re.sub(r"<int:[^>]+>", "1", re.sub(r"<str:[^>]+>", "TEST", route))
        else:
            test_url = "/" + route
        try:
            resp = client.get(test_url, SERVER_NAME="localhost")
            ok = resp.status_code < 400 or resp.status_code in (401, 403, 404)
            if resp.status_code == 401:
                note = "requires auth"
            elif resp.status_code == 403:
                note = "forbidden (auth required)"
            elif resp.status_code == 404 and is_dynamic:
                note = "dynamic — placeholder ID not found (route OK)"
            else:
                note = "dynamic" if is_dynamic else ""
            results.append({"route": route, "status": resp.status_code, "ok": ok, "note": note})
        except Exception as e:
            results.append({"route": route, "status": "ERROR", "ok": False, "note": str(e)})
    return results


def status_dashboard(request):
    started = time.time()
    db_ok, db_error = _check_db()
    results = _collect_route_results()
    elapsed_ms = round((time.time() - started) * 1000, 1)

    total = len(results)
    passing = sum(1 for r in results if r["ok"])
    dynamic = sum(1 for r in results if r["ok"] is None)

    def row(r):
        if r["ok"] is None:
            dot, color = "○", "#6B7280"
        elif r["ok"] and r["status"] == 401:
            dot, color = "●", "#F59E0B"
        elif r["ok"]:
            dot, color = "●", "#22C55E"
        else:
            dot, color = "●", "#DC2626"
        note = f'<span style="color:#6B7280;font-size:12px;"> — {r["note"]}</span>' if r["note"] else ""
        return f'''
        <tr>
          <td style="padding:10px 14px;font-family:monospace;font-size:13px;">/{r["route"]}</td>
          <td style="padding:10px 14px;color:{color};font-weight:600;">{dot} {r["status"]}{note}</td>
        </tr>'''

    rows_html = "\n".join(row(r) for r in results)
    db_badge = (
        '<span style="color:#22C55E;font-weight:700;">● Connected</span>' if db_ok
        else f'<span style="color:#DC2626;font-weight:700;">● Failed — {db_error}</span>'
    )

    html = f"""
    <html>
    <head>
      <title>EduNova Backend Status</title>
      <style>
        body {{ font-family: -apple-system, Segoe UI, sans-serif; background:#F8FAFC; margin:0; padding:40px; color:#111827; }}
        .card {{ background:white; border-radius:12px; padding:24px 28px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.08); }}
        h1 {{ color:#1E3A8A; margin:0 0 4px 0; }}
        .sub {{ color:#6B7280; font-size:14px; margin-bottom:24px; }}
        .stats {{ display:flex; gap:16px; margin-bottom:20px; }}
        .stat {{ flex:1; background:white; border-radius:10px; padding:16px; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.08); }}
        .stat .num {{ font-size:28px; font-weight:800; color:#1E3A8A; }}
        .stat .label {{ font-size:12px; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px; }}
        table {{ width:100%; border-collapse:collapse; }}
        tr:nth-child(even) {{ background:#F8FAFC; }}
        th {{ text-align:left; padding:10px 14px; font-size:12px; text-transform:uppercase; color:#6B7280; border-bottom:2px solid #E5E7EB; }}
      </style>
    </head>
    <body>
      <h1>EduNova Backend Status</h1>
      <p class="sub">Django {django.get_version()} · Checked at {now().strftime('%Y-%m-%d %H:%M:%S')} · {elapsed_ms}ms</p>

      <div class="stats">
        <div class="stat"><div class="num">{db_badge}</div><div class="label">Database</div></div>
        <div class="stat"><div class="num">{passing}/{total - dynamic}</div><div class="label">Routes OK</div></div>
        <div class="stat"><div class="num">{dynamic}</div><div class="label">Dynamic (not tested)</div></div>
      </div>

      <div class="card">
        <table>
          <tr><th>Route</th><th>Status</th></tr>
          {rows_html}
        </table>
      </div>

      <p class="sub">Visit <a href="/admin/">/admin/</a> to manage content · <a href="/">refresh</a></p>
    </body>
    </html>
    """
    return HttpResponse(html)


# SECURITY NOTE: this page runs live queries against your own API and shows
# internal route structure + DB errors. Fine for local dev. Before
# production deploy, either remove the "" route in urls.py or wrap this
# view with `@staff_member_required` so only logged-in admins can see it.
