# Production Deployment Checklist

This checklist covers all environment variables and configuration needed for production deployment with OAuth authentication.

## 🎯 Quick Reference

| Service | What It Hosts | Cost |
|---------|--------------|------|
| **Railway** | MySQL Database | Free (1GB) |
| **Render** | Django Backend API | Free (750 hrs/mo) |
| **Vercel** | React Frontend | Free (100GB bandwidth) |

### **Understanding Admin Access:**

Your app has **two separate admin systems**:

1. **Django Built-in Admin** (`/django-admin/`)
   - For managing database models directly (SocialApp, Site, Users, etc.)
   - Requires superuser account (created with `createsuperuser`)
   - Used for OAuth configuration and low-level database management

2. **Custom Admin Dashboard** (`/admin/`)
   - Your polling app's admin interface
   - Access controlled by `MAIN_ADMIN_EMAIL` and UserProfile.is_admin
   - For managing polls, users, and poll closure

---

## 1️⃣ Railway (Database) - No Changes Needed ✅

Your existing Railway MySQL setup should work as-is. Just verify:

- ✅ Database is running
- ✅ You have the `DATABASE_URL` connection string saved

**Example:**
```
mysql://root:your-password@containers-us-west-xyz.railway.app:3306/railway
```

---

## 2️⃣ Render (Django Backend) - Environment Variables

### **Required Environment Variables:**

Go to your Render service → **Environment** tab → Add these:

```bash
# ========== CORE (You should already have these) ==========
SECRET_KEY=your-django-secret-key-here
DEBUG=False
DATABASE_URL=mysql://root:password@railway.app:3306/railway

# ========== NEW - Authentication & OAuth ==========
ENVIRONMENT=production
FRONTEND_URL=https://your-app.vercel.app
MAIN_ADMIN_EMAIL=your-admin@gmail.com

# ========== NEW - For Automated Setup ==========
SUPERUSER_EMAIL=admin@example.com
SUPERUSER_PASSWORD=YourSecurePassword123!

# ========== OPTIONAL - If using custom domains ==========
ALLOWED_HOSTS=your-app.onrender.com
```

### **How to Get Values:**

**SECRET_KEY:**
```bash
# Generate a new one if you don't have it
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Or use: https://djecrety.ir/

**FRONTEND_URL:**
- Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
- Get from Vercel dashboard after deploying frontend

**MAIN_ADMIN_EMAIL:**
- The Google email you'll use as the main admin
- This user can manage other admins via `/admin/users/`

---

## 3️⃣ Google Cloud Console - OAuth Setup

You need to configure Google OAuth credentials for production:

### **Step 1: Go to Google Cloud Console**
1. Visit: https://console.cloud.google.com
2. Select your project (or create one)
3. Go to "APIs & Services" → "Credentials"

### **Step 2: Create/Update OAuth 2.0 Client**
1. Click "Create Credentials" → "OAuth 2.0 Client ID"
2. Application type: **Web application**
3. Name: `Polling App - Production`

**Authorized JavaScript origins:**
```
https://your-app.vercel.app
https://your-app.onrender.com
```

**Authorized redirect URIs:**
```
https://your-app.onrender.com/accounts/google/login/callback/
```

4. Click "Create" and save your:
   - **Client ID**: `617047880119-xxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxx`

### **Step 3: Update Django Database**

You need to add/update the Google OAuth app in your **production database**:

**Option A: Via Django Admin (Recommended)**
1. Go to `https://your-app.onrender.com/django-admin/`
2. Log in as superuser
3. Go to "Social applications"
4. Add new or edit existing Google OAuth app:
   - **Provider**: Google
   - **Name**: Google OAuth (Production)
   - **Client ID**: (from Google Console)
   - **Secret**: (from Google Console)
   - **Sites**: Select your site (usually ID=1)

**Note:** `/django-admin/` is Django's built-in admin panel, while `/admin/` is your custom admin dashboard.

**Option B: Via Django Shell on Render**

In Render dashboard → Shell:
```python
from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site

# Get or create site
site = Site.objects.get(id=1)
site.domain = 'your-app.onrender.com'
site.name = 'Production Site'
site.save()

# Create/update Google OAuth app
google_app, created = SocialApp.objects.update_or_create(
    provider='google',
    defaults={
        'name': 'Google OAuth Production',
        'client_id': 'your-production-client-id',
        'secret': 'your-production-secret',
    }
)
google_app.sites.add(site)
print(f"Google OAuth app {'created' if created else 'updated'}")
```

---

## 4️⃣ Vercel (Frontend) - Environment Variables

### **Required Environment Variables:**

Go to your Vercel project → **Settings** → **Environment Variables**:

```bash
REACT_APP_API_BASE_URL=https://your-app.onrender.com
```

**Important:** 
- No trailing slash
- Must match exactly what's in your `apiService.js`
- Set for **Production** environment

---

## 5️⃣ Initial Database Setup (One-Time)

After deploying to Render for the first time, you need to set up the database.

**Note:** Render's free tier doesn't include shell access. Use one of these methods:

### **Method A: Custom Management Command (Easiest - Recommended)**

A custom Django command is **already included** in your codebase that runs automatically on deployment!

**What it does:**
- ✅ Runs migrations
- ✅ Creates superuser (if env vars set)
- ✅ Updates Site configuration
- ✅ Checks OAuth setup

**You just need to add these to Render environment variables:**
```bash
SUPERUSER_EMAIL=admin@example.com
SUPERUSER_PASSWORD=YourSecurePassword123!
```

The command runs automatically during deployment. After first deploy, you can:
1. Access `/django-admin/` with the superuser credentials
2. Update OAuth credentials in Social applications

See **"Method A Details"** section below for how it works.

### **Method B: Via Local Django Shell (Quick Fix)**

Connect to your Railway database from your local machine:

```bash
# 1. Set production DATABASE_URL locally (temporarily)
export DATABASE_URL="mysql://root:password@railway.app:3306/railway"

# 2. Run migrations
cd backend-django
uv run python manage.py migrate

# 3. Create superuser
uv run python manage.py createsuperuser
# Enter username, email, password

# 4. Set up Google OAuth SocialApp
uv run python manage.py shell
```

```python
from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site

# Update site for production
site = Site.objects.get(id=1)
site.domain = 'your-app.onrender.com'
site.name = 'Production'
site.save()

# Create/update Google OAuth app
google_app, created = SocialApp.objects.update_or_create(
    provider='google',
    defaults={
        'name': 'Google OAuth Production',
        'client_id': 'your-production-client-id-from-google',
        'secret': 'your-production-secret-from-google',
    }
)
google_app.sites.add(site)
print(f"OAuth app {' created' if created else 'updated'}")
```

### **Method C: Create a Setup API Endpoint (Most Automated)**

Create a one-time setup endpoint (see **"Method C Details"** below).

---

## 📝 Method A Details: Custom Management Command

**Create:** `backend-django/polls/management/commands/setup_production.py`

```python
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site
import os

class Command(BaseCommand):
    help = 'Set up production environment (superuser, OAuth, site)'

    def handle(self, *args, **options):
        # Create superuser if doesn't exist
        email = os.getenv('SUPERUSER_EMAIL', 'admin@example.com')
        password = os.getenv('SUPERUSER_PASSWORD', 'changeme123')
        
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', email, password)
            self.stdout.write(self.style.SUCCESS('✅ Superuser created'))
        else:
            self.stdout.write('ℹ️  Superuser already exists')
        
        # Update site
        site = Site.objects.get(id=1)
        site.domain = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')[0]
        site.name = 'Production'
        site.save()
        self.stdout.write(self.style.SUCCESS('✅ Site updated'))
        
        # Note about OAuth
        self.stdout.write(self.style.WARNING(
            '⚠️  Remember to update SocialApp OAuth credentials in Django admin!'
        ))
```

**Configure in Render:**

**Build Command:**
```bash
cd backend-django && uv sync --no-dev && uv run python manage.py migrate && uv run python manage.py setup_production
```

**Start Command:**
```bash
cd backend-django && uv run gunicorn mysite.wsgi:application --bind 0.0.0.0:$PORT
```

**Environment Variables to Add:**
```bash
SUPERUSER_EMAIL=admin@example.com
SUPERUSER_PASSWORD=YourSecurePassword123!
```

**How it works:**
1. First deployment triggers the build command
2. `migrate` runs database migrations
3. `setup_production` creates superuser and updates site
4. Command outputs success/warning messages in Render logs
5. You can then access `/django-admin/` to configure OAuth

---

## 📝 Method C Details: Setup API Endpoint

**Create a temporary setup endpoint** (delete after use):

```python
# In polls/views.py
@api_view(['POST'])
def one_time_setup(request):
    """One-time production setup - DELETE AFTER USE"""
    if os.getenv('ENVIRONMENT') != 'production':
        return Response({"error": "Not in production"}, status=400)
    
    # Check secret token
    if request.data.get('secret') != os.getenv('SETUP_SECRET'):
        return Response({"error": "Unauthorized"}, status=403)
    
    # Create superuser
    # Update site
    # Return success
    
    return Response({"status": "Setup complete"}, status=200)
```

Then POST to it once with the secret token.

---

## **🎯 Recommended Approach: Method B (Local Shell)**

**Why:** It's the simplest and most reliable for a one-time setup.

**Steps:**
1. Temporarily connect to Railway database from local machine
2. Run migrations and create superuser locally
3. Set up OAuth credentials
4. Disconnect (remove DATABASE_URL from local env)
5. Deploy to Render

**Important Notes:**
- The superuser is for **Django admin panel only** (`/django-admin/`)
- Your **main admin** for the polling app is set via `MAIN_ADMIN_EMAIL` environment variable
- They can be the same email, but they're separate authentication systems

---

## 6️⃣ Post-Deployment Verification

### **Step 1: Test Backend**
```bash
# Health check
curl https://your-app.onrender.com/polls/

# Should return JSON with polls data
```

### **Step 2: Test OAuth Flow**
1. Visit `https://your-app.vercel.app`
2. Click "Login with Google"
3. Should redirect to Google login
4. After login, should redirect back to your app
5. Check you're authenticated in the UI

### **Step 3: Test Admin Access**
1. Log in with your `MAIN_ADMIN_EMAIL` account
2. Go to Admin Dashboard
3. Try creating a question
4. Go to `/admin/users/` and verify you can manage admins
5. Go to `/admin/closure/` and verify poll closure works

### **Step 4: Test Client Flow**
1. Log in with a non-admin Google account
2. Answer the poll
3. Review your answers
4. View results

---

## 🔒 Security Checklist

Before going live, verify:

- [ ] `DEBUG=False` in production
- [ ] `SECRET_KEY` is unique and not in version control
- [ ] `SESSION_COOKIE_SECURE=True` (handled by ENVIRONMENT)
- [ ] `CSRF_COOKIE_SECURE=True` (handled by ENVIRONMENT)
- [ ] `ALLOWED_HOSTS` is restrictive
- [ ] `CORS_ALLOWED_ORIGINS` only includes your frontend
- [ ] Database credentials are secure
- [ ] Google OAuth credentials are for production domain

---

## 📋 Complete Environment Variable Summary

### **Render (Backend):**
```bash
# Core
ENVIRONMENT=production
SECRET_KEY=<generate-new-key>
DEBUG=False
DATABASE_URL=<from-railway>

# OAuth & Authentication
FRONTEND_URL=https://your-app.vercel.app
MAIN_ADMIN_EMAIL=your-admin@gmail.com

# Automated Setup (creates superuser on first deploy)
SUPERUSER_EMAIL=admin@example.com
SUPERUSER_PASSWORD=YourSecurePassword123!
```

### **Vercel (Frontend):**
```bash
REACT_APP_API_BASE_URL=https://your-app.onrender.com
```

### **Railway (Database):**
- No environment variables needed
- Just note your `DATABASE_URL` for Render

---

## 🚨 Common Issues & Solutions

### **Issue: OAuth Redirect Fails**
**Error:** "redirect_uri_mismatch"

**Solution:**
1. Check Google Console authorized redirect URIs
2. Must be exactly: `https://your-app.onrender.com/accounts/google/login/callback/`
3. Include trailing slash

### **Issue: CSRF Verification Failed**
**Error:** "CSRF verification failed"

**Solutions:**
1. Verify `FRONTEND_URL` is set correctly in Render
2. Check `CSRF_TRUSTED_ORIGINS` includes both frontend and backend URLs
3. Ensure cookies are working (check browser developer tools)

### **Issue: Admin Management Returns 403**
**Error:** 403 Forbidden on `/admin/users/`

**Solution:**
1. Verify `MAIN_ADMIN_EMAIL` environment variable is set
2. Ensure your Google account email matches `MAIN_ADMIN_EMAIL` exactly
3. Check your UserProfile in Django admin has `is_admin=True`

### **Issue: Session Not Persisting / Cookies Blocked**
**Error:** User gets logged out on refresh, or "Cookie has been rejected as third-party"

**Root Cause:** Cross-domain authentication (Vercel ≠ Render domain) triggers browser third-party cookie blocking.

**Solution (Already in Code):**
The settings automatically configure for cross-domain in production:
- `SESSION_COOKIE_SAMESITE='None'` (allows cross-domain)
- `SESSION_COOKIE_SECURE=True` (required for SameSite=None)
- `CSRF_COOKIE_SAMESITE='None'` (allows cross-domain)

**If still having issues:**
1. Verify `ENVIRONMENT=production` is set in Render
2. Check browser console for cookie warnings
3. Try in incognito/private mode (some extensions block cookies)
4. Ensure `CORS_ALLOW_CREDENTIALS=True` (already set in code)

---

## 🎯 Deployment Order

1. **Railway** - Database (already done ✅)
2. **Render** - Backend with NEW environment variables
3. **Google Console** - Update OAuth redirect URIs
4. **Render Shell** - Update SocialApp with production credentials
5. **Vercel** - Frontend with backend URL
6. **Test** - Full OAuth flow

---

## 📞 Need Help?

- **Render Docs**: https://docs.render.com
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Django Allauth**: https://django-allauth.readthedocs.io/
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2

---

**Last Updated:** October 12, 2025
**Status:** Ready for production deployment

