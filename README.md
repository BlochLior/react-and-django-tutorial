# React & Django Polls Application

A modern, full-stack polling application built with **React** (frontend) and **Django** (backend), and a **MySQL** database to maintain the data. This project demonstrates enterprise-level development practices with comprehensive testing, performance optimization, and maintainable architecture. 

## 🎯 Project Overview

This is a **production-ready polling application** that allows users to:
- **View and vote on polls** through an intuitive React frontend
- **Manage polls and view results** through an admin interface
- **Submit votes securely** via a RESTful Django API
- **Access comprehensive analytics** and voting statistics

## 🏗️ Architecture

```
react-and-django-tutorial/
├── frontend-react/        # 🎨 React Frontend Application
│   ├── src/              # React source code
│   ├── docs/             # 📚 Comprehensive documentation
│   └── README.md         # Frontend-specific documentation
├── backend-django/        # 🐍 Django Backend API
│   ├── polls/            # Main Django application
│   ├── mysite/           # Django project settings
│   └── README.md         # Backend-specific documentation
└── README.md             # This file - Project overview
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18+ (for React frontend)
- **Python**: 3.12+ (for Django backend)
- **MariaDB**: 10.0+ (database)
- **Package Managers**: npm (Node.js) and uv (Python)

### 1. Clone the Repository

```bash
git clone https://github.com/BlochLior/react-and-django-tutorial
cd react-and-django-tutorial
```

### 2. Backend Setup (Django)

```bash
cd backend-django

# Set up virtual environment
uv venv

# Install dependencies
uv sync

# Environment configuration
cp .env.example .env  # Create and configure .env file

# Database setup

python manage.py migrate
python manage.py createsuperuser  # Optional

# Start backend server
uv run manage.py runserver
```

**Backend will be available at:** `http://localhost:8000/`

### 3. Frontend Setup (React)

```bash
cd frontend-react

# Install dependencies
npm install

# Start development server
npm start
```

**Frontend will be available at:** `http://localhost:3000/`

## 🎨 Frontend (React)

### **Status: 100% Complete** 🎉

The React frontend is a **production-ready application** with:

- **Chakra UI Components**: Modern, accessible UI library
- **React Query Integration**: Production-ready data fetching with caching
- **Comprehensive Testing**: 100% test success rate with centralized utilities
- **Performance Optimized**: No infinite loops or excessive API calls
- **Maintainable Architecture**: Consistent patterns and centralized utilities

### **Key Features**
- **User Interface**: Intuitive polling interface with responsive design
- **Admin Dashboard**: Comprehensive poll management and analytics
- **Real-time Updates**: Dynamic UI updates with React Query
- **Accessibility**: WCAG compliant components with Chakra UI
- **Cross-browser Support**: Modern browser compatibility

### **Technical Stack**
- **React 18**: Modern React with hooks and functional components
- **Chakra UI**: Component library with design system
- **React Query**: Data fetching, caching, and synchronization
- **React Router**: Client-side routing and navigation
- **Jest + Testing Library**: Comprehensive testing framework

### **Testing Infrastructure**
- **100% Test Success Rate**: All tests passing with centralized utilities
- **Integration Testing**: End-to-end user flow testing
- **Component Testing**: Isolated component testing with proper mocking
- **Mock Factories**: Consistent test data generation
- **Professional Patterns**: Enterprise-level testing practices

## 🐍 Backend (Django)

### **Status: Production Ready** 🚀

The Django backend provides a **robust, scalable API** with:

- **RESTful API**: Full CRUD operations for polls and voting
- **Modern Django**: Built with Django 5.2.4 and Django REST Framework
- **Type Safety**: Comprehensive type checking with MyPy and Pyright
- **Code Quality**: Automated linting with Ruff, Pylint, and security scanning
- **Database**: MySQL support with connection pooling and optimization

### **Key Features**
- **Poll Management**: Create, read, update, and delete polls
- **Vote Processing**: Secure vote submission and validation
- **Admin Interface**: Comprehensive admin dashboard and analytics
- **API Security**: CORS support, validation, and security headers
- **Pagination**: Built-in pagination for large datasets

### **Technical Stack**
- **Django 5.2.4**: Latest Django with modern features
- **Django REST Framework**: Powerful API framework
- **MySQL**: Production database with connection pooling
- **Pydantic**: Data validation and serialization
- **Pytest**: Comprehensive testing framework

### **API Endpoints**

#### Public Endpoints
- `GET /polls/` - List all published polls
- `GET /polls/<id>/` - Get specific poll details
- `POST /polls/vote/` - Submit a vote

#### Admin Endpoints
- `GET /admin/` - Admin dashboard
- `GET /admin/summary/` - Results summary
- `POST /admin/create/` - Create a new poll
- `GET /admin/questions/<id>/` - Get detailed poll results and management

## 🧪 Testing & Quality

### **Frontend Testing: 100% Success Rate**
```bash
cd frontend-react
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

### **Backend Testing: Comprehensive Coverage**
```bash
cd backend-django

# Install pytest-django first (if not already installed)
uv sync

# Run tests with pytest (Django-compatible)
uv run pytest                     # Run all tests
uv run pytest --cov=polls        # Run tests with coverage
uv run pytest --cov-report=html  # Generate HTML coverage report

# Alternative: Run tests with Django's built-in test runner
uv run manage.py test      # Run all tests
uv run coverage run --source=polls manage.py test  # Run tests with coverage
uv run coverage report            # View coverage report
uv run coverage html              # Generate HTML coverage report
```

### **Code Quality Tools**

#### Frontend
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type safety (if configured)

#### Backend
- **Ruff**: Fast Python linter and formatter
- **MyPy**: Static type checker
- **Pyright**: Advanced type checking (configured in pyproject.toml)
- **Pylint**: Code analysis with Django plugin
- **Bandit**: Security linting
- **Safety**: Dependency vulnerability scanning
- **Coverage**: Test coverage analysis

## 📚 Documentation

### **Project Documentation**
- **`README.md`**: This file: Comprehensive project documentation index
- **`frontend-react/docs/`**: Frontend-specific documentation
- **`backend-django/README.md`**: Backend-specific documentation

### **Key Documentation Topics in `frontend-react/docs/`**
- **Infinite Loop Resolution**: How we fixed DDoS-like API calls
- **React Query Migration**: Migration from custom hooks to React Query
- **Testing Infrastructure**: Professional-grade testing framework
- **Component Optimization**: Performance improvements and best practices
- **API Design**: RESTful API architecture and endpoints

## 🎉 Major Achievements

### **Frontend (React)**
- ✅ **Infinite Loop Resolution**: Fixed DDoS-like API calls overwhelming backend
- ✅ **React Query Migration**: Successfully migrated from custom hooks to React Query
- ✅ **Testing Infrastructure**: Established professional-grade testing framework
- ✅ **Performance Optimization**: Eliminated unnecessary re-renders and API calls
- ✅ **Code Maintainability**: Consistent patterns and centralized utilities

### **Backend (Django)**
- ✅ **Modern Architecture**: Latest Django with best practices
- ✅ **Comprehensive Testing**: Full test coverage with pytest
- ✅ **Code Quality**: Automated linting and security scanning
- ✅ **API Design**: RESTful API with proper validation
- ✅ **Production Ready**: Scalable and secure backend

## 📞 Support & Resources

### **Getting Help**
1. **Check documentation** in the `docs/` directory
2. **Review existing issues** in the repository
3. **Create new issues** with detailed information
4. **Reference working examples** in existing code

### **Useful Resources**
- **Frontend Documentation**: `frontend-react/docs/README.md`
- **Backend Documentation**: `backend-django/README.md`
- **Test Examples**: Reference existing test files for patterns
- **API Testing**: ~~Use Postman collection in `backend-django/postman_tests/`~~ - Deprecated usage of Postman for this project.
