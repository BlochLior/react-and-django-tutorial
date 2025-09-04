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
├── postman_tests/         # API testing collection
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

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend-django
```

### 2. Set Up Virtual Environment

```bash
# Using uv (recommended)
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Or using standard Python
python -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
# Using uv
uv sync

# Or using pip
pip install -r requirements.txt
```

### 4. Environment Configuration

Create a `.env` file in the project root:

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=mysql://username:password@localhost:3306/polls_db
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 5. Database Setup

```bash
# Wait for MySQL to be ready (if using Docker)
python scripts/wait_for_mysql.py

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

### 6. Run the Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

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
| `GET` | `/api/polls/` | List all published polls with pagination |
| `GET` | `/api/polls/<id>/` | Get specific poll details |
| `POST` | `/api/polls/<id>/vote/` | Submit a vote for a choice |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/polls/` | List all polls (admin view) |
| `POST` | `/api/admin/polls/` | Create a new poll |
| `PUT` | `/api/admin/polls/<id>/` | Update an existing poll |
| `DELETE` | `/api/admin/polls/<id>/` | Delete a poll |
| `GET` | `/api/admin/polls/<id>/results/` | Get detailed results for a poll |

### Query Parameters

- `page`: Page number for pagination
- `page_size`: Number of items per page (or `all` for all items)

## 🧪 Testing

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=polls --cov-report=html

# Run specific test file
pytest polls/tests/test_views.py
```

### Coverage Report

After running tests with coverage, view the HTML report:

```bash
# Open coverage report
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
start htmlcov/index.html  # Windows
```

### Postman Collection

Import the Postman collection from `postman_tests/Django_Polls_API.postman_collection.json` to test the API endpoints.

## 🔧 Development Tools

### Code Quality

```bash
# Lint with Ruff
ruff check .

# Format with Ruff
ruff format .

# Type checking with MyPy
mypy .

# Pyright type checking
pyright

# Pylint
pylint polls/ mysite/
```

### Security Scanning

```bash
# Run Bandit security checks
bandit -r .

# Run Safety checks
safety check
```

### Pre-commit Hooks

The project includes configuration for various code quality tools. Consider setting up pre-commit hooks for automated quality checks.

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `DEBUG=False`
   - Configure production `SECRET_KEY`
   - Set production `DATABASE_URL`
   - Configure `ALLOWED_HOSTS`

2. **Database**
   - Use production MySQL instance
   - Configure connection pooling
   - Set up database backups

3. **Static Files**
   - Run `python manage.py collectstatic`
   - Configure static file serving

4. **Security**
   - Enable HTTPS
   - Configure CORS properly
   - Set secure headers

### Docker Support

The project includes a `wait_for_mysql.py` script for containerized environments. Use it in your Docker setup to ensure database connectivity.

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and quality checks
5. Submit a pull request

### Code Style

- Follow PEP 8 guidelines
- Use type hints throughout
- Write comprehensive docstrings
- Maintain test coverage above 90%

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include error logs and reproduction steps

## 🔗 Related Projects

- Frontend React application (if applicable)
- Docker configuration
- CI/CD pipeline configuration

---

**Built with ❤️ using Django and modern Python development practices**
