# Django Polls API Backend

A modern, production-ready Django REST API backend for a polling application. This project demonstrates best practices in Django development with comprehensive testing, code quality tools, and a well-structured API.

## 🚀 Features

- **RESTful API**: Full CRUD operations for polls and voting
- **Modern Django**: Built with Django 5.2.4 and Django REST Framework
- **Type Safety**: Comprehensive type checking with MyPy and Pyright
- **Code Quality**: Automated linting with Ruff, Pylint, and security scanning with Bandit
- **Testing**: Full test coverage with pytest and coverage reporting
- **Database**: MySQL support with connection pooling
- **CORS Support**: Cross-origin resource sharing enabled for frontend integration
- **Pagination**: Built-in pagination for API responses
- **Validation**: Pydantic schemas for request/response validation

## 🏗️ Project Structure

```
backend-django/
├── mysite/                 # Main Django project settings
│   ├── settings.py        # Django configuration
│   ├── urls.py           # Main URL routing
│   ├── wsgi.py           # WSGI application entry point
│   └── asgi.py           # ASGI application entry point
├── polls/                 # Main application
│   ├── models.py         # Database models (Question, Choice)
│   ├── views.py          # API views and business logic
│   ├── serializers.py    # DRF serializers
│   ├── schemas.py        # Pydantic validation schemas
│   ├── urls.py           # Application URL routing
│   └── admin_urls.py     # Admin-specific endpoints
├── postman_tests/         # API testing collection - usage is deprecated
├── scripts/               # Utility scripts
│   └── wait_for_mysql.py # MySQL connection readiness checker
├── sql/                   # Database scripts and migrations
├── tests/                 # Test suite
├── pyproject.toml         # Project configuration and dependencies
├── manage.py             # Django management script
└── .python-version       # Python version specification
```

## 📋 Prerequisites

- **Python**: 3.12 or higher
- **Database**: MySQL 8.0+
- **Package Manager**: uv (recommended) or pip

## 🗄️ Database Models

### Question Model
- `question_text`: The poll question (max 200 characters)
- `pub_date`: Publication date and time

### Choice Model
- `question`: Foreign key to Question model
- `choice_text`: The choice text (max 200 characters)
- `votes`: Number of votes for this choice (default: 0)

## 🌐 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/polls/` | List all published polls |
| `GET` | `/polls/<id>/` | Get specific poll details |
| `POST` | `/polls/vote/` | Submit a vote |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/` | Admin dashboard |
| `GET` | `/admin/summary/` | Results summary |
| `POST` | `/admin/create/` | Create a new poll |
| `GET` | `/admin/questions/<id>/` | Get detailed poll results and management |

### Query Parameters

- `page`: Page number for pagination
- `page_size`: Number of items per page (or `all` for all items)

## 🔧 Development Tools

### Code Quality

```bash
# Lint with Ruff
uv run ruff check .

# Format with Ruff
uv run ruff format .

# Type checking with MyPy
uv run mypy .

# Pyright type checking
uv run pyright

# Pylint
uv run pylint polls/ mysite/
```

### Security Scanning

```bash
# Run Bandit security checks
uv run bandit -r .

# Run Safety checks
uv run safety check
```

## 📚 Dependencies

### Core Dependencies
- **Django**: 5.2.4 - Web framework
- **Django REST Framework**: 3.16.0+ - API framework
- **Django CORS Headers**: 4.7.0+ - CORS support
- **MySQL Client**: 2.2.7+ - Database driver
- **Pydantic**: 2.11.7+ - Data validation
- **python-dotenv**: 1.1.1+ - Environment variable management

### Development Dependencies
- **pytest**: Testing framework
- **ruff**: Fast Python linter and formatter
- **mypy**: Static type checker
- **coverage**: Code coverage measurement
- **bandit**: Security linter
- **safety**: Dependency vulnerability scanner

