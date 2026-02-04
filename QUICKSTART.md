# 🚀 SATS Quick Start Guide

Get the Student Attendance Tracking System up and running in 10 minutes!

---

## ⚡ Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js v18+ installed (`node --version`)
- ✅ PostgreSQL v14+ installed and running
- ✅ npm or yarn installed
- ✅ Git (optional)

---

## 📝 Step-by-Step Setup (10 Minutes)

### Step 1: Database Setup (2 minutes)

```bash
# Open PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sats_db;

# Exit
\q
```

### Step 2: Backend Setup (3 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env - Update these lines:
# DB_PASSWORD=your_postgres_password
# JWT_SECRET=any_random_string_here

# Run migrations
npm run migrate

# Seed demo data
npm run seed

# Start backend server
npm run dev
```

**Alternatively, start the backend and DB with Docker Compose:**

```bash
# From repository root
docker compose -f backend/docker-compose.yml up --build -d
```

This will bring up the database and backend services; the backend startup script runs migrations and seeds automatically.

**To run the full stack (DB + backend + frontend)**:

```bash
# From repository root
docker compose up --build -d
```

The frontend will be served by Nginx at `http://localhost:5173` and the backend at `http://localhost:5000`.

If you prefer to run the **Vite dev server inside a container** (hot reload), run:

```bash
# From repository root
docker compose -f docker-compose.dev.yml up --build -d
```

Stop the static frontend first if necessary:

```bash
docker compose stop frontend
```

**✅ Backend should now be running on http://localhost:5000**

### Step 3: Frontend Setup (3 minutes)

Open a **new terminal window**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

**✅ Frontend should now be running on http://localhost:5173**

### Step 4: Download Face Models (2 minutes)

**Option A: Manual Download**
1. Go to: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Download these 9 files to `frontend/public/models/`:
   - tiny_face_detector_model-weights_manifest.json
   - tiny_face_detector_model-shard1
   - face_landmark_68_model-weights_manifest.json
   - face_landmark_68_model-shard1
   - face_recognition_model-weights_manifest.json
   - face_recognition_model-shard1
   - face_recognition_model-shard2
   - face_expression_model-weights_manifest.json
   - face_expression_model-shard1

**Option B: Using wget (Linux/Mac)**
```bash
cd frontend/public
mkdir -p models
cd models

# Download all models
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-weights_manifest.json
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-shard1
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-weights_manifest.json
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-shard1
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-weights_manifest.json
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard1
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard2
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_expression_model-weights_manifest.json
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_expression_model-shard1
```

---

## 🎯 First Test (2 minutes)

### Test as Lecturer

1. **Open browser:** http://localhost:5173
2. **Login with:**
   - Email: `john.lecturer@university.edu`
   - Password: `lecturer123`
3. **You should see:**
   - Lecturer Dashboard
   - 4 stat cards showing classes, students, attendance rate
   - Today's sessions
   - Recent activity

### Test as Student

1. **Logout** (click avatar → Logout)
2. **Login with:**
   - Email: `alice.student@university.edu`
   - Password: `student123`
3. **You should see:**
   - Student Dashboard
   - Enrolled classes
   - Active sessions
   - Quick actions

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can login as lecturer
- [ ] Can login as student
- [ ] Dashboard loads without errors
- [ ] No console errors in browser
- [ ] Database has demo data

---

## 🎨 Demo Accounts

### Lecturers
| Name | Email | Password |
|------|-------|----------|
| John Smith | john.lecturer@university.edu | lecturer123 |
| Sarah Johnson | sarah.lecturer@university.edu | lecturer123 |
| Michael Brown | michael.lecturer@university.edu | lecturer123 |

### Students
| Name | Email | Password |
|------|-------|----------|
| Alice Williams | alice.student@university.edu | student123 |
| Bob Davis | bob.student@university.edu | student123 |
| Charlie Miller | charlie.student@university.edu | student123 |
| Diana Wilson | diana.student@university.edu | student123 |

---

## 🧪 Quick Feature Tests

### Test 1: Create a Class (Lecturer)
1. Login as lecturer
2. Navigate to "Classes"
3. Click "Create Class"
4. Fill in:
   - Course Code: TEST101
   - Course Name: Test Course
   - Semester: Fall
   - Academic Year: 2024
5. Click "Create"
6. ✅ Class should appear in list

### Test 2: Start a Session (Lecturer)
1. On a class card, click "Start Session"
2. ✅ Should redirect to Live Monitoring
3. ✅ Should see student list
4. ✅ Should see attendance stats

### Test 3: Register Face (Student)
1. Login as student
2. Navigate to "Register Face"
3. Allow camera access
4. Position face in oval guide
5. Click "Capture Photo"
6. Click "Register"
7. ✅ Should see success message

### Test 4: Check In (Student)
1. Navigate to "Check In"
2. Select an active session
3. Allow camera access
4. Click "Check In with Face Recognition"
5. ✅ Should see success message

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # Mac

# Check if port 5000 is in use
lsof -ti:5000 | xargs kill -9  # Kill process on port 5000
```

### Frontend won't start
```bash
# Check if port 5173 is in use
lsof -ti:5173 | xargs kill -9  # Kill process on port 5173

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database connection error
```bash
# Check .env file
cat backend/.env

# Verify database exists
psql -U postgres -l | grep sats_db

# Recreate database if needed
psql -U postgres -c "DROP DATABASE IF EXISTS sats_db;"
psql -U postgres -c "CREATE DATABASE sats_db;"
```

### Camera not working
- Use Chrome or Firefox (best support)
- Ensure you're on localhost or HTTPS
- Check browser permissions
- Try a different browser

### Face models not loading
- Verify files are in `frontend/public/models/`
- Check browser console for 404 errors
- Ensure all 9 files are downloaded
- Refresh the page

---

## 📚 Next Steps

Once everything is working:

1. **Explore Features:**
   - Create classes
   - Manage students
   - Start sessions
   - Generate reports

2. **Read Documentation:**
   - `README.md` - Project overview
   - `SETUP.md` - Detailed setup
   - `API.md` - API documentation
   - `PROJECT_SUMMARY.md` - Complete summary

3. **Customize:**
   - Update theme colors in `frontend/src/theme/muiTheme.ts`
   - Modify face match threshold in backend `.env`
   - Add your own data

4. **Deploy:**
   - Set up production database
   - Configure environment variables
   - Build frontend: `npm run build`
   - Deploy to your hosting platform

---

## 🎉 Success!

If you can:
- ✅ Login as both lecturer and student
- ✅ See the dashboards
- ✅ Navigate between pages
- ✅ No console errors

**Congratulations! SATS is ready to use! 🚀**

---

## 💡 Tips

- **Dark Mode:** Click sun/moon icon to toggle theme
- **Real-time:** Open two browsers to see live updates
- **Mobile:** Test on mobile devices for student interface
- **Demo Data:** Use seeded data to explore features
- **Reset Data:** Run `npm run seed` again to reset

---

## 📞 Need Help?

- Check `INSTALLATION_TESTING.md` for detailed testing
- Review `SETUP.md` for comprehensive setup guide
- Check browser console for errors
- Verify all services are running
- Ensure database is populated

---

**Estimated Total Time: 10 minutes**
**Difficulty: Easy**
**Status: Ready to Run! ✅**
