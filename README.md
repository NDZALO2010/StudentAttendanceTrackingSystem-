# Student Attendance Tracking System (SATS)

A modern, web-based attendance tracking solution with facial recognition for students and comprehensive analytics for lecturers.

## 🎯 Features

### For Lecturers
- 🔐 Secure authentication with JWT
- 📊 Real-time attendance monitoring dashboard
- 📝 Class and student management
- 📈 Advanced analytics and reporting
- 📥 Export reports (CSV/PDF)
- 🌙 Dark mode interface

### For Students
- 👤 Facial recognition-based check-in
- 📱 Mobile-first PWA design
- 📅 Personal attendance calendar
- 📊 Attendance statistics and trends
- 🔔 Push notifications

## 🛠️ Technology Stack

### Backend
- Node.js & Express.js
- PostgreSQL with Sequelize ORM
- JWT Authentication
- Socket.IO for real-time updates

### Frontend
- React 18 with TypeScript
- Material-UI (MUI)
- face-api.js for facial recognition
- Recharts for data visualization
- Vite for build tooling
- PWA capabilities

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd EduTracerSystem
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run seed  # Load demo data
npm run dev
```

**Or use Docker Compose to run the database and backend together**:

```bash
# From repository root
docker-compose -f backend/docker-compose.yml up --build -d

# Follow backend logs
docker-compose -f backend/docker-compose.yml logs -f backend
```

The Docker Compose setup will build the backend image, start a Postgres container, and run migrations & seeders automatically via the included startup script. Backend will be available at `http://localhost:5000`. Adjust credentials in `backend/docker-compose.yml` or your environment as needed.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 👥 Demo Accounts

### Lecturers
- Email: `john.lecturer@university.edu`
- Password: `lecturer123`

- Email: `sarah.lecturer@university.edu`
- Password: `lecturer123`

### Students
- Email: `alice.student@university.edu`
- Password: `student123`

- Email: `bob.student@university.edu`
- Password: `student123`

## 📁 Project Structure

```
EduTracerSystem/
├── backend/          # Node.js/Express API
├── frontend/         # React TypeScript App
└── README.md
```

## 🎨 Color Scheme

- Primary Blue: #2563EB
- Success Green: #10B981
- Warning Amber: #F59E0B
- Error Red: #EF4444
- Neutral Gray: #6B7280

## 📖 API Documentation

API endpoints are documented in `backend/API.md`

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention
- CORS configuration
- Rate limiting
- Input validation

## 📱 PWA Features

- Offline capability
- Install to home screen
- Push notifications
- Camera access for face scanning

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Authors

SATS Development Team

## 🙏 Acknowledgments

- face-api.js for facial recognition
- Material-UI for UI components
- PostgreSQL community
