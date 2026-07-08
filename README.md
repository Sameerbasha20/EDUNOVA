# EduNova Global Academy Platform

See **[SETUP.md](./SETUP.md)** for full setup instructions and implementation status.

---

## SMTP Email Configuration

OTP login codes are delivered via email. Configure your SMTP provider in `backend/.env`.

### Local Development (no real emails)

```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

OTP codes print to the Django terminal. No email account needed.

---

### Gmail (production)

1. Enable 2-Step Verification on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Generate an App Password for "Mail"
4. Use the 16-character password as `EMAIL_HOST_PASSWORD`

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your@gmail.com
EMAIL_HOST_PASSWORD=xxxx-xxxx-xxxx-xxxx
DEFAULT_FROM_EMAIL=EduNova Academy <your@gmail.com>
```

---

### Brevo (formerly Sendinblue)

Sign up at [app.brevo.com](https://app.brevo.com) → SMTP & API → SMTP tab.

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your@email.com
EMAIL_HOST_PASSWORD=your-brevo-smtp-key
DEFAULT_FROM_EMAIL=EduNova Academy <no-reply@yourdomain.com>
```

---

### Mailtrap (safe testing — never delivers to real inboxes)

Sign up at [mailtrap.io](https://mailtrap.io) → Email Testing → SMTP Settings.

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-mailtrap-user
EMAIL_HOST_PASSWORD=your-mailtrap-password
DEFAULT_FROM_EMAIL=no-reply@edunovaacademy.edu.in
```

---

### Running Auth Tests

```bash
cd backend
python manage.py test portal.tests.test_auth
```

Tests cover: login sends email · resend sends new OTP · OTP expires · invalid OTP · SMTP failure · inactive user.
