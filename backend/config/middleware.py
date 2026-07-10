from django.conf import settings

# Django's own served pages (the /admin/ site is the only HTML this backend
# renders -- everything else is a JSON API consumed by the separate React
# frontend, which is outside this middleware's reach). Django admin's own JS
# is external files (script-src 'self' is enough); some admin widgets still
# rely on inline <style> attributes, hence 'unsafe-inline' on style-src only.
DEFAULT_CSP = (
    "default-src 'self'; "
    "script-src 'self'; "
    "style-src 'self' 'unsafe-inline'; "
    "img-src 'self' data:; "
    "font-src 'self' data:; "
    "connect-src 'self'; "
    "object-src 'none'; "
    "base-uri 'self'; "
    "frame-ancestors 'none'"
)


class ContentSecurityPolicyMiddleware:
    """Adds a Content-Security-Policy header to every response. Only
    protects Django's own rendered pages (admin site) -- the React frontend
    is served separately and needs its own CSP configured wherever it's
    hosted."""

    def __init__(self, get_response):
        self.get_response = get_response
        self.policy = getattr(settings, "CONTENT_SECURITY_POLICY", DEFAULT_CSP)

    def __call__(self, request):
        response = self.get_response(request)
        if self.policy:
            response.setdefault("Content-Security-Policy", self.policy)
        return response
