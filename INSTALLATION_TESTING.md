# SATS - Installation & Testing Guide

Complete guide for installing dependencies and testing the Student Attendance Tracking System.

---

## 📦 Installation Steps

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

**Expected packages to be installed:**
- express
- pg, sequelize
- jsonwebtoken, bcryptjs
- cors, dotenv, helmet
- express-validator
- pdfkit, csv-writer
- socket.io
- multer, morgan, compression

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

**Expected packages to be installed:**
- react, react-dom, react-router-dom
- @mui/material, @mui/icons-material, @emotion/react, @emotion/styled
- face-api.js
- axios
- socket.io-client
- recharts
- date-fns
- react-hook-form, zod
- notistack
- vite, @vitejs/plugin-react
- typescript, @types/react, @types/react-dom

### Step 3: Download Face-API.js Models

Create the models directory:
```bash
mkdir -p frontend/public/models
cd frontend/public/models
```

Download the following model files from the face-api.js repository:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

**Required files:**
1. `tiny_face_detector_model-weights_manifest.json`
2. `tiny_face_detector_model-shard1`
3. `face_landmark_68_model-weights_manifest.json`
4. `face_landmark_68_model-shard1`
5. `face_recognition_model-weights_manifest.json`
6. `face_recognition_model-shard1`
7. `face_recognition_model-shard2`
8. `face_expression_model-weights_manifest.json`
9. `face_expression_model-shard1`

**Alternative: Use wget or curl**
```bash
# Example for downloading (adjust URLs as needed)
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-weights_manifest.json
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-shard1
# ... repeat for all files
```

### Step 4: Setup PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sats_db;

# Create user (optional)
CREATE USER sats_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sats_db TO sats_user;

# Exit
\q
```

**Option B: Docker PostgreSQL**
```bash
docker run --name sats-postgres \
  -e POSTGRES_DB=sats_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14
```

### Step 5: Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` file:
```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sats_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_key
JWT_REFRESH_EXPIRE=30d

CORS_ORIGIN=http://localhost:5173
FACE_MATCH_THRESHOLD=0.6
```

### Step 6: Run Database Migrations

```bash
cd backend
npm run migrate
```

**Expected output:**
```
🔄 Starting database migrations...
✅ Database connection established
✅ Users table created/verified
✅ Classes table created/verified
✅ Enrollments table created/verified
✅ Sessions table created/verified
✅ Attendance table created/verified
✅ Face Descriptors table created/verified
🎉 All migrations completed successfully!
```

### Step 7: Seed Demo Data

```bash
npm run seed
```

**Expected output:**
```
🌱 Starting database seeding...
✅ Existing data cleared
✅ Lecturers created
✅ Students created
✅ Face descriptors created
✅ Classes created
✅ Enrollments created
✅ Sessions created
✅ Attendance records created
✅ Session counts updated
✅ Enrollment percentages updated

🎉 Database seeding completed successfully!

📊 Summary:
   - Lecturers: 3
   - Students: 8
   - Classes: 4
   - Enrollments: 19
   - Sessions: 30+
   - Attendance Records: 200+

👤 Demo Accounts:
   Lecturer: john.lecturer@university.edu / lecturer123
   Student: alice.student@university.edu / student123
```

---

## 🧪 Testing Procedures

### Phase 1: Backend Testing

#### 1.1 Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ Database connection established successfully
✅ Database models synchronized
🚀 Server running on port 5000
📡 Environment: development
🔗 API URL: http://localhost:5000/api
🌐 Frontend URL: http://localhost:5173
```

#### 1.2 Test Health Endpoint

```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{
  "status": "success",
  "message": "SATS API is running",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

#### 1.3 Test Authentication

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@university.edu",
    "password": "test123",
    "role": "student",
    "studentId": "TEST001"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.lecturer@university.edu",
    "password": "lecturer123"
  }'
```

**Expected response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

#### 1.4 Test Lecturer Endpoints

**Get Dashboard (replace TOKEN with actual token):**
```bash
curl -X GET http://localhost:5000/api/lecturer/dashboard \
  -H "Authorization: Bearer TOKEN"
```

**Get Classes:**
```bash
curl -X GET http://localhost:5000/api/lecturer/classes \
  -H "Authorization: Bearer TOKEN"
```

#### 1.5 Test Student Endpoints

**Login as student first:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.student@university.edu",
    "password": "student123"
  }'
```

**Get Enrolled Classes:**
```bash
curl -X GET http://localhost:5000/api/student/classes \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

**Get Active Sessions:**
```bash
curl -X GET http://localhost:5000/api/student/sessions/active \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### Phase 2: Frontend Testing

#### 2.1 Start Frontend Server

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

#### 2.2 Access Application

Open browser and navigate to: `http://localhost:5173`

#### 2.3 Test Login Flow

1. **Navigate to Login Page**
   - Should see SATS logo and login form
   - Should have Login and Register tabs

2. **Test Lecturer Login**
   - Email: `john.lecturer@university.edu`
   - Password: `lecturer123`
   - Click "Login"
   - Should redirect to `/lecturer/dashboard`

3. **Verify Lecturer Dashboard**
   - Should see 4 stat cards (Classes, Students, Attendance Rate, Sessions)
   - Should see today's sessions (if any)
   - Should see recent activity
   - Should see quick actions

4. **Test Logout**
   - Click user avatar (top right)
   - Click "Logout"
   - Should redirect to login page

5. **Test Student Login**
   - Email: `alice.student@university.edu`
   - Password: `student123`
   - Click "Login"
   - Should redirect to `/student/dashboard`

6. **Verify Student Dashboard**
   - Should see 4 stat cards
   - Should see enrolled classes
   - Should see active sessions (if any)
   - Should see face registration alert (if not registered)

#### 2.4 Test Lecturer Features

**Class Management:**
1. Navigate to "Classes" from sidebar
2. Click "Create Class"
3. Fill in form:
   - Course Code: TEST101
   - Course Name: Test Course
   - Semester: Fall
   - Academic Year: 2024
4. Click "Create"
5. Verify class appears in list
6. Click "Edit" icon
7. Modify course name
8. Click "Update"
9. Verify changes
10. Click "Start Session"
11. Verify redirect to live monitoring

**Live Monitoring:**
1. Should see session details
2. Should see stats cards (Total, Present, Late, Absent)
3. Should see attendance rate progress bar
4. Should see student list
5. Test search functionality
6. Test filter by status
7. Click "..." menu on student
8. Select "Mark Present"
9. Verify status update
10. Click "End Session"
11. Confirm and verify redirect

**Reports:**
1. Navigate to "Reports"
2. Select report type
3. Select date range
4. Click "Generate Report"
5. Verify report preview
6. Test "Export CSV" button
7. Test "Export PDF" button

#### 2.5 Test Student Features

**Face Registration:**
1. Navigate to "Register Face"
2. Allow camera access
3. Position face in oval guide
4. Wait for "Face Detected" indicator
5. Click "Capture Photo"
6. Verify captured image
7. Check quality score
8. Click "Register"
9. Verify success message
10. Verify redirect to dashboard

**Check-In:**
1. Navigate to "Check In"
2. Select active session from list
3. Allow camera access
4. Position face for recognition
5. Wait for "Face Detected"
6. Click "Check In with Face Recognition"
7. Verify success message
8. Verify redirect to dashboard

**My Attendance:**
1. Navigate to "My Attendance"
2. Verify statistics cards for each class
3. Verify attendance history table
4. Test class filter
5. Test date range filter
6. Verify attendance records display correctly

#### 2.6 Test Real-time Features

**Setup:**
1. Open two browser windows
2. Window 1: Login as lecturer
3. Window 2: Login as student

**Test:**
1. Lecturer: Start a new session
2. Student: Navigate to Check In
3. Student: Check in to the session
4. Lecturer: Verify real-time update in live monitoring
5. Verify notification appears
6. Verify student list updates
7. Verify stats update

#### 2.7 Test Theme Switching

1. Click theme toggle icon (sun/moon) in top bar
2. Verify theme switches between light and dark
3. Verify theme persists on page reload
4. Test on both lecturer and student interfaces

#### 2.8 Test Responsive Design

1. Open browser DevTools
2. Toggle device toolbar
3. Test on various screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)
4. Verify navigation drawer behavior
5. Verify component layouts
6. Verify camera view on mobile

### Phase 3: Error Handling Testing

#### 3.1 Test Invalid Login
- Enter wrong email/password
- Verify error message displays
- Verify no redirect occurs

#### 3.2 Test Network Errors
- Stop backend server
- Try to login
- Verify error handling
- Restart backend
- Verify recovery

#### 3.3 Test Validation
- Try to create class with empty fields
- Verify validation messages
- Try to register with weak password
- Verify validation

#### 3.4 Test Camera Errors
- Deny camera permission
- Navigate to Face Registration
- Verify error message
- Verify fallback options

### Phase 4: Performance Testing

#### 4.1 Load Testing
- Create multiple sessions
- Add many students to a class
- Verify performance remains acceptable
- Check for memory leaks

#### 4.2 Face Recognition Performance
- Test face detection speed
- Test face matching accuracy
- Test with different lighting conditions
- Test with different face angles

---

## ✅ Testing Checklist

### Backend
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Migrations run successfully
- [ ] Demo data seeds correctly
- [ ] Health endpoint responds
- [ ] Authentication works (register, login)
- [ ] JWT tokens are generated
- [ ] Protected routes require authentication
- [ ] Lecturer endpoints work
- [ ] Student endpoints work
- [ ] WebSocket connections establish
- [ ] Real-time events fire correctly

### Frontend
- [ ] Development server starts
- [ ] Application loads in browser
- [ ] No console errors
- [ ] Login page renders
- [ ] Registration works
- [ ] Login works (lecturer & student)
- [ ] Routing works correctly
- [ ] Protected routes redirect
- [ ] Lecturer dashboard loads
- [ ] Student dashboard loads
- [ ] All navigation links work
- [ ] Theme switching works
- [ ] Responsive design works
- [ ] Camera access works
- [ ] Face detection works
- [ ] Face registration works
- [ ] Check-in works
- [ ] Real-time updates work
- [ ] All CRUD operations work
- [ ] Error handling works
- [ ] Loading states display
- [ ] Notifications appear

---

## 🐛 Common Issues & Solutions

### Issue: Cannot connect to database
**Solution:** 
- Verify PostgreSQL is running
- Check database credentials in .env
- Ensure database exists

### Issue: Camera not working
**Solution:**
- Check browser permissions
- Use HTTPS or localhost
- Verify camera is not in use by another app

### Issue: Face-api.js models not loading
**Solution:**
- Verify models are in `frontend/public/models/`
- Check browser console for 404 errors
- Ensure all model files are downloaded

### Issue: CORS errors
**Solution:**
- Verify CORS_ORIGIN in backend .env
- Ensure frontend URL matches
- Restart backend server

### Issue: WebSocket not connecting
**Solution:**
- Verify backend server is running
- Check Socket.IO configuration
- Check browser console for errors

---

## 📊 Expected Test Results

After completing all tests, you should have:

✅ **Backend:** Fully functional API with all endpoints working
✅ **Frontend:** Complete UI with all features operational
✅ **Database:** Populated with demo data
✅ **Authentication:** Working login/register for both roles
✅ **Real-time:** Live updates functioning
✅ **Face Recognition:** Detection and matching working
✅ **Responsive:** Mobile and desktop layouts working
✅ **Error Handling:** Graceful error messages
✅ **Performance:** Acceptable load times

---

## 🎉 Success Criteria

The application is ready for use when:

1. ✅ All backend endpoints respond correctly
2. ✅ All frontend pages load without errors
3. ✅ Users can login and access their dashboards
4. ✅ Lecturers can manage classes and sessions
5. ✅ Students can register faces and check in
6. ✅ Real-time updates work correctly
7. ✅ No critical console errors
8. ✅ Responsive design works on all devices
9. ✅ Face recognition achieves >80% accuracy
10. ✅ All demo accounts work as expected

---

**Happy Testing! 🚀**
