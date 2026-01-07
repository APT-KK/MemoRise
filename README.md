
# 📸 Memorise: Smart Event Gallery

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Django](https://img.shields.io/badge/Django-5.x-green.svg)
![React](https://img.shields.io/badge/React-19-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)

**Memorise** is a full-stack "Smart Gallery" platform built for photographers and event coordinators to organize, manage, and showcase large photo collections with AI-powered tagging and real-time notifications.

> 💡 Think Google Photos meets Flickr, but structured specifically for **Events** with role-based access control.

---

## 📖 Table of Contents
- [The Core Concept](#-the-core-concept)
- [Architecture Overview](#-architecture-overview)
- [Data Models](#-data-models)
- [API Layer](#-api-layer-views--serializers)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)

---

## 🧠 The Core Concept

Instead of dumping thousands of photos into one big pile, **Memorise** uses a structured, two-tier hierarchy:

```
┌─────────────────────────────────────────────────────────┐
│                    EVENT                                │
│              (e.g., "John's Wedding")                   │
│                                                         │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│   │   ALBUM     │  │   ALBUM     │  │   ALBUM     │     │
│   │  Ceremony   │  │  Reception  │  │  After Party│     │
│   │   📸📸     │  │   📸📸     │  |   📸📸     │     |
│   └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│   📸 📸 📸 📸  (Loose Photos - Event-level stream)    │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗 Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                         FRONTEND                               │
│                    React 19 + TypeScript                       │
│          Material UI + Tailwind CSS + Vite                     │
│                                                                │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐        │
│   │  Pages   │  │Components│  │ Context  │  │   API   │        │ 
│   │ (Routes) │  │ (UI/MUI) │  │(WebSocket│  │ (Axios) |        │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘        │
└────────┼─────────────┼─────────────┼─────────────┼─────────────┘
         │             │             │             │
         ▼             ▼             ▼             ▼
┌────────────────────────────────────────────────────────────────┐
│                     REST API + WebSocket                       │
│                    JWT Authentication                          │
└────────────────────────────────────────────────────────────────┘
         │                                         │
         ▼                                         ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│       DJANGO REST API       │    │     DJANGO CHANNELS         │
│        (DRF ViewSets)       │    │   (WebSocket Consumers)     │
│                             │    │                             │
│  • EventViewSet             │    │  • NotificationConsumer     │
│  • AlbumViewSet             │    │  • JWT Token Auth           │
│  • PhotoViewSet             │    │  • User-specific Groups     │
│  • LikeViewSet              │    │                             │
│  • CommentViewSet           │    │                             │
└──────────────┬──────────────┘    └──────────────┬──────────────┘
               │                                   │
               ▼                                   ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│         MODELS              │    │       CELERY TASKS          │
│   (PostgreSQL/SQLite)       │    │     (Redis Broker)          │
│                             │    │                             │
│  • CustomUser (5 roles)     │    │  • process_photo()          │
│  • Event → Album → Photo    │    │    - Thumbnail generation   │
│  • Like, Comment            │    │    - Watermark overlay      │
│  • Notification (Generic)   │    │    - EXIF extraction        │
│                             │    │  • AI Tagging (ResNet50)    │
└─────────────────────────────┘    └─────────────────────────────┘
```

---

## 📊 Data Models

### User Model (`users/models.py`)
Custom user with email-based auth and role-based permissions:

| Field | Type | Description |
|-------|------|-------------|
| `email` | EmailField | Primary identifier (replaces username) |
| `full_name` | CharField | Display name |
| `role` | Choice | `Admin` / `Coordinator` / `Photographer` / `Member` / `Guest` |
| `profile_picture` | ImageField | Avatar |
| `email_otp` | CharField | PyOTP secret for email verification |
| `is_verified` | Boolean | Email verification status |

### Gallery Models (`gallery/models.py`)

**Event** — Top-level container
```python
Event
├── name, description, date, location
├── cover_image
└── coordinator → ForeignKey(User)  # Only coordinators can own events
```

**Album** — Sub-collection within an event
```python
Album
├── name, description, cover_image
├── event → ForeignKey(Event)
└── owner → ForeignKey(User)
```

**Photo** — The core asset
```python
Photo
├── image, thumbnail (generated)
├── is_processed (Celery flag)
├── exif_data (JSONField - extracted metadata)
├── auto_tags (AI-generated via ResNet50)
├── tagged_users → ManyToMany(User)
├── photographer → ForeignKey(User)
├── album → ForeignKey(Album)
├── event → ForeignKey(Event)
└── likes_cnt, download_cnt
```

### Interaction Models (`interactions/models.py`)

```python
Like
├── user → ForeignKey(User)
├── photo → ForeignKey(Photo)
└── unique_together = ('user', 'photo')  # One like per user

Comment
├── user → ForeignKey(User)
├── photo → ForeignKey(Photo)
├── content (TextField)
├── parent → ForeignKey(self)  # Nested replies support
└── created_at
```

### Notification Model (`notifications/models.py`)
Uses Django's **GenericForeignKey** for polymorphic notifications:

```python
Notification
├── recipient → ForeignKey(User)
├── actor → ForeignKey(User)
├── verb (CharField)  # "liked your photo", "commented on"
├── content_type → ForeignKey(ContentType)  # Generic relation
├── object_id (PositiveIntegerField)
├── content_object (GenericForeignKey)
└── is_read, created_at
```

---

## 🔌 API Layer (Views & Serializers)

### ViewSets (`gallery/views.py`)

| ViewSet | Endpoint | Features |
|---------|----------|----------|
| `PhotoViewSet` | `/api/gallery/photos/` | CRUD, filtering, ordering, download action |
| `AlbumViewSet` | `/api/gallery/albums/` | CRUD, filter by event/owner, search |
| `EventViewSet` | `/api/gallery/events/` | CRUD, auto-assigns coordinator |
| `UserSearchView` | `/api/gallery/search/` | Debounced user search for tagging |

### Key Serializer Patterns (`gallery/serializers.py`)

```python
# Dual-field pattern for user tagging:
tagged_users_details = UserTagSerializer(read_only=True)   # GET: Full user objects
tagged_user_ids = PrimaryKeyRelatedField(write_only=True)  # POST/PATCH: Just IDs

# Computed fields:
is_liked = SerializerMethodField()      # Check if current user liked
likes_count = SerializerMethodField()   # Dynamic count
auto_tags = SerializerMethodField()     # AI-generated tags
```

### Background Processing (`gallery/tasks.py`)
Celery tasks triggered on photo upload via signals:

```python
@shared_task
def process_photo(photo_id):
    # 1. Generate 500x500 thumbnail
    # 2. Apply watermark overlay ("© MemoRise")
    # 3. Extract EXIF metadata
    # 4. Set is_processed = True
```

---

## 🚀 Key Features

| Feature | Implementation |
|---------|---------------|
| **Real-Time Notifications** | Django Channels + WebSocket + JWT auth |
| **AI Photo Tagging** | ResNet50 deep learning model |
| **EXIF Extraction** | Pillow/exifread on upload |
| **Async Processing** | Celery + Redis for thumbnails/watermarks |
| **User Tagging** | ManyToMany with debounced search |
| **Nested Comments** | Self-referential ForeignKey (parent) |
| **Role-Based Access** | 5 user roles with `limit_choices_to` |
| **MUI Dialog Components** | Modal forms for Create Event/Album/Tagging |

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Python 3.8+ | Language |
| Django 5.x | Web framework |
| Django REST Framework | API layer |
| Django Channels | WebSocket support |
| Celery + Redis | Async task queue |
| PostgreSQL/SQLite | Database |
| ResNet50 (TensorFlow) | AI image tagging |
| PyOTP | Email OTP verification |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI library |
| TypeScript 5.x | Type safety |
| Vite 7.x | Build tool |
| Material UI 7.x | Component library |
| Tailwind CSS | Utility styling |
| Axios | HTTP client |
| react-hot-toast | Notifications |
| Lucide React | Icons |

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+ & npm
- Python 3.8+
- Redis (for Celery)

### 1. Clone & Setup Backend
```bash
git clone https://github.com/yourusername/memorise-gallery.git
cd memorise-gallery/backend

python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Start Celery Worker
```bash
celery -A config worker -l info
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:5173** 🚀

---

## 🔮 Roadmap

- [x] Real-Time Notifications (WebSocket + JWT)
- [x] TypeScript Migration
- [x] Material UI Dialog Components
- [ ] AWS S3 Cloud Storage
- [x] share albums/photos

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
