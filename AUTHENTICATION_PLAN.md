# Authentication & Access Control Implementation Plan

## Overview

This document outlines the implementation plan for adding Google OAuth authentication and role-based access control to the polling application.

## Progress Tracking

### ✅ Completed Steps
- **1.1** Install OAuth Dependencies (django-allauth)
- **1.2** Update Django Settings with OAuth configuration
- **1.3** Database Migrations (allauth tables created)
- **1.4** Create Admin User Model Extension (UserProfile, UserVote models)
- **1.5** Update API Views for Authentication (user_info, admin_stats, logout, vote tracking)
- **1.6** Add OAuth URLs and test authentication infrastructure
- **1.7** Test Authentication Views and Business Logic (53 tests passing)

### ✅ Additional Completed Steps
- **1.8** Set up Google OAuth Credentials ✅ COMPLETED
- **1.9** Implement UserProfile Auto-Creation ✅ COMPLETED  
- **1.10** Frontend Authentication Integration ✅ COMPLETED
- **1.11** Cache Management System ✅ COMPLETED
- **1.12** Manual Refresh System ✅ COMPLETED

## Current Session Summary

### ✅ What We Accomplished (Steps 1.4-1.7)
- **Created UserProfile and UserVote models** with proper relationships and business logic
- **Enhanced vote view** with authentication and user vote tracking
- **Added new authentication API endpoints**:
  - `GET /auth/user-info/` - Get current user information
  - `GET /auth/admin-stats/` - Get admin statistics (admin only)
  - `POST /auth/logout/` - Handle user logout
- **Updated vote endpoint** to require authentication and track user votes
- **Added comprehensive test coverage** (53 tests passing):
  - Model tests for UserProfile and UserVote business logic
  - Authentication endpoint tests
  - Enhanced vote tracking tests
- **Fixed database testing** by using SQLite for tests (avoiding MySQL permission issues)

### 🎯 Authentication System Complete
The authentication system is now **fully implemented and production-ready**. All components are working with proper authentication, authorization, and cache management.

### 🔧 Cache Management & Refresh Strategy
- **React Query Integration**: Native cache invalidation using `useQueryClient`
- **Manual Refresh System**: Reliable refresh buttons for data consistency
- **Auto-refresh Decision**: Chose manual refresh over complex auto-refresh to avoid navigation interference
- **Cache Consistency**: Dashboard and edit pages always show synchronized data

## Architecture

```
Guest Users → Google OAuth → Client Users → Admin Users
     ↓              ↓              ↓
  Guest View    Client View    Admin View
```

## Part 1: Google OAuth Authentication Setup

### Backend Changes (Django)

#### 1.1 Install OAuth Dependencies ✅ COMPLETED
```bash
cd backend-django
uv add django-allauth
uv add django-allauth[socialaccount]
```

#### 1.2 Update Settings ✅ COMPLETED
```python
# settings.py additions
INSTALLED_APPS = [
    # ... existing apps
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'polls.apps.PollsConfig',  # Move polls after allauth
]

# Add allauth configuration
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

SITE_ID = 1

# Google OAuth settings
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    }
}

# CORS settings for OAuth
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend.vercel.app",
]

# Allauth settings
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_VERIFICATION = 'none'  # Skip email verification for OAuth
SOCIALACCOUNT_EMAIL_VERIFICATION = 'none'
SOCIALACCOUNT_LOGIN_ON_GET = True
```

#### 1.3 Database Migrations ✅ COMPLETED
```bash
uv run manage.py makemigrations
uv run manage.py migrate
```

#### 1.4 Create Admin User Model Extension
```python
# polls/models.py additions
from django.contrib.auth.models import User
from django.db import models

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_admin = models.BooleanField(default=False)
    google_email = models.EmailField(unique=True)
    google_name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} ({self.google_email})"

# Add user tracking to existing models
class UserVote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    choice = models.ForeignKey(Choice, on_delete=models.CASCADE)
    voted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'question']  # One vote per user per question
```

#### 1.5 Update API Views for Authentication
```python
# polls/views.py additions
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
def user_info(request):
    """Get current user information"""
    if request.user.is_authenticated:
        try:
            profile = request.user.userprofile
            return Response({
                'authenticated': True,
                'email': profile.google_email,
                'name': profile.google_name,
                'is_admin': profile.is_admin,
                'has_voted': has_user_voted(request.user)
            })
        except UserProfile.DoesNotExist:
            return Response({
                'authenticated': True,
                'email': request.user.email,
                'name': request.user.username,
                'is_admin': False,
                'has_voted': False
            })
    return Response({'authenticated': False})

def has_user_voted(user):
    """Check if user has voted on any poll"""
    return UserVote.objects.filter(user=user).exists()

@api_view(['GET'])
def admin_stats(request):
    """Get admin statistics"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    try:
        profile = request.user.userprofile
        if not profile.is_admin:
            return Response({'error': 'Admin access required'}, status=403)
    except UserProfile.DoesNotExist:
        return Response({'error': 'Admin access required'}, status=403)
    
    # Calculate statistics
    total_voters = UserVote.objects.values('user').distinct().count()
    total_votes = UserVote.objects.count()
    total_questions = Question.objects.count()
    
    # Hidden questions breakdown
    unpublished_questions = Question.objects.filter(pub_date__gt=timezone.now()).count()
    choiceless_questions = Question.objects.filter(choice__isnull=True).distinct().count()
    unpublished_choiceless = Question.objects.filter(
        pub_date__gt=timezone.now(),
        choice__isnull=True
    ).distinct().count()
    
    return Response({
        'total_voters': total_voters,
        'total_votes': total_votes,
        'total_questions': total_questions,
        'hidden_questions': {
            'unpublished': unpublished_questions,
            'choiceless': choiceless_questions,
            'unpublished_choiceless': unpublished_choiceless,
            'total': unpublished_questions + choiceless_questions + unpublished_choiceless
        }
    })
```

#### 1.6 Update Vote Submission
```python
# Update the vote view to track user votes
@csrf_exempt
@api_view(["POST"])
def vote(request: Request):
    """Handles a POST request to update vote counts for a poll"""
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=401)
    
    try:
        submission = PollSubmissionSchema.model_validate(request.data)
    except ValidationError as e:
        return Response({"error": e.json()}, status=status.HTTP_400_BAD_REQUEST)

    votes_dict = submission.votes
    
    if not votes_dict:
        return Response({"error": "No votes provided"}, status=status.HTTP_400_BAD_REQUEST)

    for question_id, choice_id in votes_dict.items():
        try:
            choice = Choice.objects.select_related("question").get(pk=choice_id)
        except ObjectDoesNotExist:
            return Response({"error": "Choice with this ID was not found"}, status=status.HTTP_404_NOT_FOUND)

        if choice.question_id != question_id:
            return Response({"error": "Choice does not belong to this question"}, status=status.HTTP_400_BAD_REQUEST)

        # Remove existing vote if user already voted on this question
        UserVote.objects.filter(user=request.user, question=choice.question).delete()
        
        # Record new vote
        UserVote.objects.create(user=request.user, question=choice.question, choice=choice)
        
        # Update vote count
        choice.votes += 1
        choice.save()

    return Response({"message": "Votes submitted successfully"}, status=status.HTTP_200_OK)
```

### Frontend Changes (React)

#### 1.7 Install OAuth Dependencies
```bash
cd frontend-react
# No additional packages needed - use Django OAuth directly
# Your Django allauth setup handles the OAuth flow
```

#### 1.8 Create Authentication Context
```javascript
// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { pollsApi } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await pollsApi.getUserInfo();
            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = () => {
        // Redirect to Django OAuth URL
        window.location.href = `${process.env.REACT_APP_API_BASE_URL}/accounts/google/login/`;
    };

    const logout = async () => {
        try {
            await pollsApi.logout();
            setUser(null);
            window.location.href = `${process.env.REACT_APP_API_BASE_URL}/accounts/logout/`;
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: user?.authenticated || false,
        isAdmin: user?.is_admin || false,
        hasVoted: user?.has_voted || false
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
```

#### 1.9 Update API Service
```javascript
// src/services/apiService.js additions
export const pollsApi = {
    // ... existing methods
    
    // Authentication methods
    getUserInfo: async () => {
        const response = await api.get('/auth/user-info/');
        return response.data;
    },
    
    getAdminStats: async () => {
        const response = await api.get('/auth/admin-stats/');
        return response.data;
    },
    
    logout: async () => {
        const response = await api.post('/auth/logout/');
        return response.data;
    }
};
```

## Part 2: Functional Changes & Access Control

### 2.1 Create Conditional Components

#### Guest Home Page
```javascript
// src/pages/GuestHomePage.jsx
import React from 'react';
import { Box, VStack, Heading, Button, Text } from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const GuestHomePage = () => {
    const { login } = useAuth();

    return (
        <Box py={8}>
            <VStack spacing={8} align="center">
                <Heading as="h1" size="2xl" textAlign="center">
                    Welcome to Our Polling App
                </Heading>
                <Text fontSize="lg" textAlign="center" maxW="md">
                    Join thousands of users who have already shared their opinions. 
                    Log in with Google to participate in our polls and see results.
                </Text>
                <Button
                    leftIcon={<FaGoogle />}
                    colorScheme="blue"
                    size="lg"
                    onClick={login}
                >
                    Login with Google
                </Button>
            </VStack>
        </Box>
    );
};

export default GuestHomePage;
```

#### Client Home Page
```javascript
// src/pages/ClientHomePage.jsx
import React from 'react';
import { Box, VStack, Heading, Text, Button, HStack } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ClientHomePage = () => {
    const { user, hasVoted } = useAuth();
    const navigate = useNavigate();

    const handleAnswerPoll = () => {
        navigate('/polls');
    };

    const handleReviewAnswers = () => {
        navigate('/review');
    };

    const handleShowResults = () => {
        navigate('/results');
    };

    return (
        <Box py={8}>
            <VStack spacing={6} align="center">
                <Heading as="h1" size="xl" textAlign="center">
                    Welcome back, {user?.name || user?.email}!
                </Heading>
                
                <Text fontSize="lg" textAlign="center">
                    You have <strong>client access</strong> and have{' '}
                    {hasVoted ? 'already answered' : 'not yet answered'} the poll.
                </Text>

                {hasVoted ? (
                    <VStack spacing={4}>
                        <HStack spacing={4}>
                            <Button colorScheme="blue" onClick={handleReviewAnswers}>
                                Review Answers
                            </Button>
                            <Button colorScheme="orange" onClick={handleAnswerPoll}>
                                Re-answer Poll
                            </Button>
                        </HStack>
                        <Button colorScheme="green" onClick={handleShowResults}>
                            Show Results Summary
                        </Button>
                    </VStack>
                ) : (
                    <Button colorScheme="teal" size="lg" onClick={handleAnswerPoll}>
                        Answer Poll
                    </Button>
                )}
            </VStack>
        </Box>
    );
};

export default ClientHomePage;
```

#### Admin Home Page
```javascript
// src/pages/AdminHomePage.jsx
import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Button, HStack, Stat, StatLabel, StatNumber, StatGroup } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { pollsApi } from '../services/apiService';

const AdminHomePage = () => {
    const { user, hasVoted } = useAuth();
    const navigate = useNavigate();
    const [adminStats, setAdminStats] = useState(null);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const stats = await pollsApi.getAdminStats();
                setAdminStats(stats);
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            }
        };

        if (user?.is_admin) {
            fetchAdminStats();
        }
    }, [user]);

    return (
        <Box py={8}>
            <VStack spacing={6} align="center">
                <Heading as="h1" size="xl" textAlign="center">
                    Welcome back, {user?.name || user?.email}!
                </Heading>
                
                <Text fontSize="lg" textAlign="center">
                    You have <strong>admin access</strong> and have{' '}
                    {hasVoted ? 'already answered' : 'not yet answered'} the poll.
                </Text>

                {hasVoted ? (
                    <HStack spacing={4}>
                        <Button colorScheme="blue" onClick={() => navigate('/review')}>
                            Review Answers
                        </Button>
                        <Button colorScheme="orange" onClick={() => navigate('/polls')}>
                            Re-answer Poll
                        </Button>
                        <Button colorScheme="green" onClick={() => navigate('/admin-results')}>
                            Comprehensive Summary
                        </Button>
                    </HStack>
                ) : (
                    <Button colorScheme="teal" onClick={() => navigate('/polls')}>
                        Answer Poll
                    </Button>
                )}

                <HStack spacing={4} mt={4}>
                    <Button colorScheme="purple" onClick={() => navigate('/admin')}>
                        Admin Dashboard
                    </Button>
                    <Button colorScheme="cyan" onClick={() => navigate('/admin/create')}>
                        Add New Question
                    </Button>
                </HStack>

                {adminStats && (
                    <Box mt={8} p={6} borderWidth={1} borderRadius="lg" bg="gray.50">
                        <Heading size="md" mb={4} textAlign="center">
                            Executive Summary
                        </Heading>
                        <StatGroup>
                            <Stat>
                                <StatLabel>Total Voters</StatLabel>
                                <StatNumber>{adminStats.total_voters}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Total Votes</StatLabel>
                                <StatNumber>{adminStats.total_votes}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Available Questions</StatLabel>
                                <StatNumber>{adminStats.total_questions}</StatNumber>
                            </Stat>
                        </StatGroup>
                        <Text mt={4} fontSize="sm" textAlign="center">
                            Hidden from clients: {adminStats.hidden_questions.total} questions 
                            ({adminStats.hidden_questions.unpublished} unpublished, 
                            {adminStats.hidden_questions.choiceless} choiceless, 
                            {adminStats.hidden_questions.unpublished_choiceless} unpublished choiceless)
                        </Text>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

export default AdminHomePage;
```

### 2.2 Update Navigation Components

#### Conditional Header
```javascript
// src/components/Header.jsx
import React from 'react';
import { Box, HStack, Button, Text } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) {
        return (
            <Box bg="white" shadow="sm" p={4}>
                <HStack justify="space-between">
                    <Button variant="ghost" onClick={() => navigate('/')}>
                        Home
                    </Button>
                    <HStack>
                        <Button variant="ghost" onClick={() => navigate('/results')}>
                            Results
                        </Button>
                        <Button colorScheme="blue" onClick={user?.login}>
                            Login
                        </Button>
                    </HStack>
                </HStack>
            </Box>
        );
    }

    return (
        <Box bg="white" shadow="sm" p={4}>
            <HStack justify="space-between">
                <Button variant="ghost" onClick={() => navigate('/')}>
                    Home
                </Button>
                <HStack>
                    <Button variant="ghost" onClick={() => navigate('/polls')}>
                        Polls
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('/results')}>
                        Results
                    </Button>
                    {isAdmin && (
                        <Button variant="ghost" onClick={() => navigate('/admin')}>
                            Admin Dashboard
                        </Button>
                    )}
                    {isAdmin && (
                        <Button variant="ghost" onClick={() => navigate('/admin-results')}>
                            Admin Results
                        </Button>
                    )}
                    <Text fontSize="sm" color="gray.600">
                        {user?.name || user?.email}
                    </Text>
                    <Button variant="outline" onClick={logout}>
                        Logout
                    </Button>
                </HStack>
            </Box>
        </Box>
    );
};

export default Header;
```

### 2.3 Update Results Views

#### Client Results (Filtered)
```javascript
// Update existing results to filter for client view
const getClientResults = async () => {
    // Only show published questions with choices
    const response = await pollsApi.getClientResults();
    return response.data;
};
```

#### Admin Results (Comprehensive)
```javascript
// New admin results view
const getAdminResults = async () => {
    // Show all questions including unpublished and choiceless
    const response = await pollsApi.getAdminResults();
    return response.data;
};
```

### 2.4 Update Routing
```javascript
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import GuestHomePage from './pages/GuestHomePage';
import ClientHomePage from './pages/ClientHomePage';
import AdminHomePage from './pages/AdminHomePage';
import PollsContainer from './pages/client/PollsContainer';
import ReviewPage from './pages/client/ReviewPage';
// ... other imports

const AppContent = () => {
    const { user, loading, isAuthenticated, isAdmin } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={
                    !isAuthenticated ? <GuestHomePage /> :
                    isAdmin ? <AdminHomePage /> : <ClientHomePage />
                } />
                <Route path="/polls" element={<PollsContainer />} />
                <Route path="/review" element={<ReviewPage />} />
                <Route path="/results" element={<ResultsPage />} />
                {isAdmin && (
                    <>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/create" element={<CreateQuestion />} />
                        <Route path="/admin-results" element={<AdminResultsPage />} />
                    </>
                )}
            </Routes>
        </Router>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
```

## Implementation Timeline

### Phase 1: Backend OAuth Setup (Week 1)
- [x] Install and configure django-allauth
- [ ] Set up Google OAuth credentials
- [ ] Create user models and migrations
- [ ] Update API views for authentication

### Phase 2: Frontend Authentication (Week 1-2)
- [ ] Create authentication context
- [ ] Implement login/logout functionality
- [ ] Create conditional components (Guest/Client/Admin)
- [ ] Update navigation and routing

### Phase 3: Access Control & Results (Week 2)
- [ ] Implement filtered results for clients
- [ ] Create admin statistics and comprehensive results
- [ ] Update vote tracking with user association
- [ ] Test all access levels and permissions

### Phase 4: Testing & Deployment (Week 2-3)
- [ ] Test OAuth flow end-to-end
- [ ] Verify all access controls work correctly
- [ ] Update deployment documentation
- [ ] Deploy to production with OAuth credentials

## Google OAuth Setup Requirements

### Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8000/accounts/google/login/callback/` (development)
   - `https://your-backend.onrender.com/accounts/google/login/callback/` (production)

### Environment Variables
```bash
# Backend Django environment variables
GOOGLE_OAUTH2_CLIENT_ID=your_client_id
GOOGLE_OAUTH2_SECRET=your_client_secret
FRONTEND_URL=https://your-frontend.vercel.app  # For production redirects

# Frontend React environment variables
REACT_APP_API_BASE_URL=http://127.0.0.1:8000  # Development
# REACT_APP_API_BASE_URL=https://your-backend.onrender.com  # Production
```

## Security Considerations

- ✅ **HTTPS Only**: All OAuth flows must use HTTPS in production
- ✅ **CSRF Protection**: Django's CSRF protection for OAuth
- ✅ **Secure Cookies**: Configure secure session cookies
- ✅ **Admin Permissions**: Manual admin user creation and management
- ✅ **Rate Limiting**: Implement rate limiting for API endpoints
- ✅ **Input Validation**: Validate all user inputs and OAuth responses

## Testing Strategy

### Unit Tests
- User model and profile creation
- Authentication status checks
- Access control permissions
- Vote tracking and user association

### Integration Tests
- OAuth flow end-to-end
- API authentication and authorization
- Frontend authentication context
- Conditional rendering based on user role

### End-to-End Tests
- Complete user journey (login → vote → view results)
- Admin functionality and statistics
- Access control enforcement
- Cross-browser compatibility

This plan provides a comprehensive roadmap for implementing Google OAuth authentication with role-based access control for your polling application.

---

## 🚀 Authentication Implementation Complete!

### ✅ Current Status (FULLY IMPLEMENTED)
- ✅ **Backend OAuth foundation** is complete (steps 1.1-1.3)
- ✅ **Database migrations** have been run successfully
- ✅ **Django-allauth** is configured and ready
- ✅ **Google OAuth credentials** setup completed
- ✅ **User models** created (UserProfile, UserVote)
- ✅ **API views** updated with authentication endpoints
- ✅ **Frontend authentication** implemented with AuthContext
- ✅ **Conditional components** created (Guest/Client/Admin pages)
- ✅ **Navigation** updated with role-based access
- ✅ **Routing** configured with authentication flow
- ✅ **Environment variables** configured for dev/production

### 🔧 Key Configuration Files Updated
- `backend-django/mysite/settings.py` - OAuth redirect URLs (environment-aware)
- `frontend-react/src/contexts/AuthContext.js` - Authentication context
- `frontend-react/src/services/apiService.js` - Authentication API methods
- `frontend-react/src/App.js` - Conditional routing and AuthProvider
- `frontend-react/.env` - Environment variables

### 🌐 Production Environment Variables
```bash
# Backend (Django) - Set in your production environment
GOOGLE_OAUTH2_CLIENT_ID=your_real_client_id
GOOGLE_OAUTH2_SECRET=your_real_client_secret
FRONTEND_URL=https://your-frontend-domain.com

# Frontend (React) - Set in your build environment
REACT_APP_API_BASE_URL=https://your-backend-domain.com
```

### 🎯 Ready for Production Deployment
The authentication system is **fully functional** and ready for production deployment with proper environment variable configuration.

**Authentication implementation is COMPLETE! 🎉**

## 🔄 Cache Management & Refresh Strategy

### **Decision: Manual Refresh Over Auto-Refresh**

After extensive testing and debugging, we implemented a **manual refresh system** instead of complex auto-refresh mechanisms. This decision was made for the following reasons:

#### **Why Manual Refresh?**
- **Reliability**: Auto-refresh systems were causing navigation interference
- **User Control**: Users have explicit control over when data refreshes
- **Simplicity**: Eliminates complex event systems and timing issues
- **Performance**: Prevents unnecessary API calls and infinite loops

#### **Implementation Details**
- **React Query Cache Invalidation**: Uses `queryClient.invalidateQueries()` for consistent data
- **No Manual Refresh Needed**:
  - **Automatic cache invalidation** on all create/edit/delete operations
  - **React Query handles refresh** automatically when navigating back to dashboard
  - **Clean UI** with only essential "Add New Question" button
- **Optimized Navigation**: Home link for all users, Results link only for clients (admins use dashboard)
- **Improved User Flow**: Vote success redirects to home page (role-appropriate view) instead of polls page
- **Operation Success Callbacks**: All create/edit/delete operations trigger cache invalidation
- **Cache Consistency**: Dashboard and edit pages always show synchronized data

#### **User Workflow**
1. **Create/Edit/Delete Question** → Automatic cache invalidation → Updated data
2. **Automatic Refresh** → Data updates instantly when returning to dashboard
3. **F5 Alternative** → Browser refresh always works as fallback

This approach provides **reliable, predictable behavior** while maintaining **excellent user experience** and **data consistency**.
