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

After deploying to Render for the first time, you need to set up the database:

### **In Render Dashboard:**
1. Go to your web service
2. Click "Shell" tab (or use SSH)
3. Run these commands:

```bash
cd backend-django

# 1. Run database migrations
python manage.py migrate

# 2. Create a superuser for Django admin panel
python manage.py createsuperuser
# Enter username, email, and password when prompted
# This is for /django-admin/ access only

# 3. Verify superuser was created
python manage.py shell -c "from django.contrib.auth.models import User; print(f'Superusers: {list(User.objects.filter(is_superuser=True).values_list(\"username\", flat=True))}')"
```

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
ENVIRONMENT=production
SECRET_KEY=<generate-new-key>
DEBUG=False
DATABASE_URL=<from-railway>
FRONTEND_URL=https://your-app.vercel.app
MAIN_ADMIN_EMAIL=your-admin@gmail.com
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

### **Issue: Session Not Persisting**
**Error:** User gets logged out on refresh

**Solutions:**
1. Check `SESSION_COOKIE_SECURE` is properly set based on ENVIRONMENT
2. Verify `SESSION_COOKIE_DOMAIN` is None (uses default)
3. Check browser allows third-party cookies
4. Ensure `CORS_ALLOW_CREDENTIALS=True`

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

