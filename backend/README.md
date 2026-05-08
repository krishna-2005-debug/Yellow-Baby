# Yellow Baby Backend — Setup Guide

## Prerequisites
- Python 3.10+
- MySQL 8.0+
- Git

---

## 1. Setup Virtual Environment

Navigate to the `backend` directory:
```bash
cd backend
```

Activate the virtual environment:
```bash
# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

---

## 2. Configure MySQL Database

### Step A — Create the database
Open **MySQL Workbench** or **MySQL Shell** and run:
```sql
CREATE DATABASE IF NOT EXISTS yellow_baby_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### Step B — Update credentials in `yellow_baby_backend/settings.py`
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'yellow_baby_db',
        'USER': 'root',
        'PASSWORD': 'your_mysql_password_here',   # <-- UPDATE THIS
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

---

## 3. Run Migrations

```bash
.\venv\Scripts\python manage.py makemigrations
.\venv\Scripts\python manage.py migrate
```

---

## 4. Create Admin Superuser

```bash
.\venv\Scripts\python manage.py createsuperuser
```
> When prompted, enter your **mobile number** as the identifier (e.g. `9876543210`) and a password.

---

## 5. Start Development Server

```bash
.\venv\Scripts\python manage.py runserver
```

The server will start at **http://127.0.0.1:8000/**

---

## API Endpoints Reference

### Authentication
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/users/request-otp/` | Request OTP (dev: returns OTP in response) |
| POST | `/api/users/verify-otp/` | Verify OTP & get JWT tokens |
| POST | `/api/users/token/refresh/` | Refresh access token |
| GET/PATCH | `/api/users/profile/` | View/update user profile |
| GET/POST | `/api/users/addresses/` | List/add addresses |
| GET/PATCH/DELETE | `/api/users/addresses/<id>/` | Address detail |

### Products
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/products/` | Product list (paginated, filterable) |
| GET | `/api/products/<id>/` | Product detail |
| GET | `/api/products/categories/` | Category list |
| GET | `/api/products/wishlist/` | View user's wishlist |
| POST | `/api/products/wishlist/toggle/` | Add/remove product from wishlist |
| GET | `/api/products/wishlist/status/<id>/` | Check if product is wishlisted |
| GET | `/api/products/<id>/reviews/` | List approved product reviews |
| POST | `/api/products/<id>/reviews/` | Submit a product review (auth required) |

**Product Filters (query params):**
- `?category=1` — filter by category ID
- `?min_price=100&max_price=500` — price range
- `?gender=boys` — boys / girls / unisex
- `?age_group=0-1Y` — age group
- `?size=M` — filter by size
- `?in_stock=true` — only in-stock items
- `?search=frock` — search by name
- `?ordering=price` or `?ordering=-price` — sort by price

### Cart
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/cart/` | View cart |
| POST | `/api/cart/add/` | Add item (`product_variant_id`, `quantity`) |
| PUT | `/api/cart/update/<item_id>/` | Update item quantity |
| DELETE | `/api/cart/remove/<item_id>/` | Remove item |
| DELETE | `/api/cart/clear/` | Clear cart |

### Orders
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/orders/validate-coupon/` | Validate coupon code & get discount amount |
| POST | `/api/orders/checkout/` | Place order from cart (supports `coupon_code`) |
| GET | `/api/orders/` | Order history |
| GET | `/api/orders/<id>/` | Order detail (includes `status_logs`) |
| POST | `/api/orders/<id>/cancel/` | Cancel order & restore stock |
| GET | `/api/orders/<id>/invoice/` | Download PDF invoice |

---

## Admin Panel

**URL:** http://127.0.0.1:8000/admin/

**Analytics Dashboard:** http://127.0.0.1:8000/admin/analytics/

### Key Admin Features:
- **Custom Branded Dashboard** with live stats (Today's Revenue, Monthly Revenue, Total Products, Low Stock Alerts)
- **Interactive Analytics Charts** (Chart.js) showing Daily Revenue, Order Status distribution, Top Products, and Category Revenue
- **Product Management** with inline variant & image editing, emoji thumbnails, and stock heatmap bars
- **Order Management** with colored status badges, payment status badges, and PDF invoice link
- **Coupons Management** with usage tracking meter and active toggle
- **Reviews Management** with star display and approve/hide actions
- **Bulk Actions**: Mark Packed/Shipped/Delivered/Paid, Export to CSV (Orders, Products, Users), Approve Reviews

---

## OTP (Development Mode)

OTP dev bypass is **enabled** by default.  
When you call `/api/users/request-otp/`, the response will include `"dev_otp": "123456"`.  
Use `123456` as the OTP when calling `/api/users/verify-otp/`.

To disable dev mode (production), set in `settings.py`:
```python
OTP_DEV_BYPASS = False
```

---

## Project Structure

```
backend/
├── yellow_baby_backend/    # Django project settings, custom admin site & root urls
├── users/                  # Auth, OTP, Addresses, Users
├── products/               # Categories, Products, Variants, Images, Wishlist, Reviews
├── cart/                   # Cart & CartItems
├── orders/                 # Orders, OrderItems, Coupons, Status Logs, Invoice PDF
├── analytics/              # Admin dashboard & analytics helpers
├── templates/
│   ├── admin/              # Custom admin base & index templates
│   └── analytics/
│       └── dashboard.html  # Custom Chart.js analytics dashboard
├── media/                  # Uploaded images (auto-created)
├── requirements.txt
└── README.md
```
