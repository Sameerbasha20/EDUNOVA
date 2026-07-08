"""Portal API uses Django's default auth_user plus raw SQL against the
portal_* tables defined in portal/sql/portal_extension_auth_user.sql.

Models are intentionally not declared here because the user's current Supabase
schema already contains Django auth/CMS/admissions tables, and the portal
extension is applied directly in Supabase to avoid migration conflicts.
"""
