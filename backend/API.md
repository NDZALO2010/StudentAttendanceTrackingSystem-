# SATS API Documentation

Complete API reference for the Student Attendance Tracking System.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Access:** Public

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@university.edu",
  "password": "password123",
  "role": "student",
  "studentId": "STU001",
  "department": "Computer Science",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@university.edu",
      "role": "student",
      "studentId": "STU001"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Login

Authenticate a user and receive tokens.

**Endpoint:** `POST /auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john.doe@university.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@university.edu",
      "role": "student"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Get Current User

Get the authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Access:** Private

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@university.edu",
      "role": "student",
      "studentId": "STU001",
      "department": "Computer Science"
    }
  }
}
```

### Update Profile

Update user profile information.

**Endpoint:** `PUT /auth/profile`

**Access:** Private

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "department": "Computer Science"
}
```

### Change Password

Change user password.

**Endpoint:** `PUT /auth/change-password`

**Access:** Private

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### Refresh Token

Get a new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Access:** Public

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

---

## Lecturer Endpoints

### Get Dashboard Stats

Get lecturer dashboard statistics.

**Endpoint:** `GET /lecturer/dashboard`

**Access:** Private (Lecturer)

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalClasses": 4,
    "totalStudents": 45,
    "todaySessions": [...],
    "recentActivity": [...],
    "attendanceStats": {
      "total": 200,
      "present": 150,
      "late": 30,
      "absent": 20,
      "attendanceRate": 90.0
    }
  }
}
```

### Get All Classes

Get all classes for the lecturer.

**Endpoint:** `GET /lecturer/classes`

**Access:** Private (Lecturer)

**Response:**
```json
{
  "status": "success",
  "data": {
    "classes": [
      {
        "id": "uuid",
        "courseCode": "CS101",
        "courseName": "Introduction to Programming",
        "semester": "Fall",
        "academicYear": "2024",
        "studentCount": 45
      }
    ]
  }
}
```

### Create Class

Create a new class.

**Endpoint:** `POST /lecturer/classes`

**Access:** Private (Lecturer)

**Request Body:**
```json
{
  "courseCode": "CS101",
  "courseName": "Introduction to Programming",
  "description": "Learn programming fundamentals",
  "semester": "Fall",
  "academicYear": "2024",
  "schedule": [
    {
      "day": "Monday",
      "startTime": "10:00",
      "endTime": "11:30",
      "location": "Room 101"
    }
  ],
  "maxStudents": 50,
  "department": "Computer Science",
  "credits": 3,
  "color": "#2563EB"
}
```

### Update Class

Update an existing class.

**Endpoint:** `PUT /lecturer/classes/:id`

**Access:** Private (Lecturer)

**Request Body:** Same as Create Class

### Delete Class

Delete a class.

**Endpoint:** `DELETE /lecturer/classes/:id`

**Access:** Private (Lecturer)

### Get Class Students

Get all students enrolled in a class.

**Endpoint:** `GET /lecturer/classes/:id/students`

**Access:** Private (Lecturer)

**Response:**
```json
{
  "status": "success",
  "data": {
    "students": [
      {
        "id": "uuid",
        "student": {
          "id": "uuid",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@university.edu",
          "studentId": "STU001"
        },
        "attendancePercentage": 85.5
      }
    ]
  }
}
```

### Add Student to Class

Enroll a student in a class.

**Endpoint:** `POST /lecturer/classes/:id/students`

**Access:** Private (Lecturer)

**Request Body:**
```json
{
  "studentId": "uuid"
}
```

### Create Session

Create a new attendance session.

**Endpoint:** `POST /lecturer/sessions`

**Access:** Private (Lecturer)

**Request Body:**
```json
{
  "classId": "uuid",
  "sessionDate": "2024-01-15",
  "startTime": "10:00",
  "endTime": "11:30",
  "location": "Room 101",
  "topic": "Introduction to Variables"
}
```

### Get Session Details

Get detailed information about a session.

**Endpoint:** `GET /lecturer/sessions/:id`

**Access:** Private (Lecturer)

**Response:**
```json
{
  "status": "success",
  "data": {
    "session": {
      "id": "uuid",
      "sessionDate": "2024-01-15",
      "startTime": "10:00",
      "status": "ongoing",
      "totalStudents": 45,
      "presentCount": 38,
      "lateCount": 5,
      "absentCount": 2,
      "attendanceRecords": [...]
    }
  }
}
```

### End Session

End an active attendance session.

**Endpoint:** `PUT /lecturer/sessions/:id/end`

**Access:** Private (Lecturer)

### Mark Attendance

Manually mark student attendance.

**Endpoint:** `PUT /lecturer/attendance/:id`

**Access:** Private (Lecturer)

**Request Body:**
```json
{
  "status": "present",
  "notes": "Arrived late but excused"
}
```

---

## Student Endpoints

### Register Face

Register facial recognition data.

**Endpoint:** `POST /student/face/register`

**Access:** Private (Student)

**Request Body:**
```json
{
  "descriptor": [0.123, 0.456, ...], // 128-dimensional array
  "imageUrl": "data:image/jpeg;base64,...",
  "qualityScore": 0.95
}
```

### Get Face Status

Check if face is registered.

**Endpoint:** `GET /student/face/status`

**Access:** Private (Student)

**Response:**
```json
{
  "status": "success",
  "data": {
    "isRegistered": true,
    "faceDescriptor": {
      "id": "uuid",
      "registrationDate": "2024-01-01",
      "qualityScore": 0.95
    }
  }
}
```

### Check In

Check in to an attendance session.

**Endpoint:** `POST /student/checkin`

**Access:** Private (Student)

**Request Body:**
```json
{
  "sessionId": "uuid",
  "faceDescriptor": [0.123, 0.456, ...],
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Check-in successful! You are marked as present.",
  "data": {
    "attendance": {
      "id": "uuid",
      "status": "present",
      "checkInTime": "2024-01-15T10:05:00Z",
      "faceMatchConfidence": 0.92
    },
    "session": {
      "courseCode": "CS101",
      "courseName": "Introduction to Programming"
    }
  }
}
```

### Get Enrolled Classes

Get all classes the student is enrolled in.

**Endpoint:** `GET /student/classes`

**Access:** Private (Student)

**Response:**
```json
{
  "status": "success",
  "data": {
    "enrollments": [
      {
        "id": "uuid",
        "class": {
          "courseCode": "CS101",
          "courseName": "Introduction to Programming",
          "lecturer": {
            "firstName": "John",
            "lastName": "Smith"
          }
        },
        "attendancePercentage": 85.5
      }
    ]
  }
}
```

### Get Active Sessions

Get today's active sessions.

**Endpoint:** `GET /student/sessions/active`

**Access:** Private (Student)

**Response:**
```json
{
  "status": "success",
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "sessionDate": "2024-01-15",
        "startTime": "10:00",
        "class": {
          "courseCode": "CS101",
          "courseName": "Introduction to Programming"
        },
        "attendanceRecords": [
          {
            "status": "absent"
          }
        ]
      }
    ]
  }
}
```

### Get Attendance History

Get student's attendance history.

**Endpoint:** `GET /student/attendance`

**Access:** Private (Student)

**Query Parameters:**
- `classId` (optional): Filter by class
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "status": "success",
  "data": {
    "attendance": [...],
    "statistics": {
      "total": 20,
      "present": 15,
      "late": 3,
      "absent": 2,
      "attendanceRate": "90.00"
    }
  }
}
```

### Get Attendance Statistics

Get attendance statistics by class.

**Endpoint:** `GET /student/attendance/stats`

**Access:** Private (Student)

**Response:**
```json
{
  "status": "success",
  "data": {
    "classStats": [
      {
        "class": {
          "courseCode": "CS101",
          "courseName": "Introduction to Programming"
        },
        "statistics": {
          "total": 20,
          "present": 15,
          "late": 3,
          "absent": 2,
          "attendanceRate": "90.00"
        }
      }
    ]
  }
}
```

---

## WebSocket Events

### Connection

Connect to WebSocket server:

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token' }
});
```

### Events

#### Join Session Room

```javascript
socket.emit('join-session', sessionId);
```

#### Leave Session Room

```javascript
socket.emit('leave-session', sessionId);
```

#### Session Started

```javascript
socket.on('session-started', (data) => {
  // data: { sessionId, classId, totalStudents }
});
```

#### Session Ended

```javascript
socket.on('session-ended', (data) => {
  // data: { sessionId }
});
```

#### Student Checked In

```javascript
socket.on('student-checked-in', (data) => {
  // data: { studentId, studentName, status, checkInTime }
});
```

#### Attendance Updated

```javascript
socket.on('attendance-updated', (data) => {
  // data: { attendanceId, status }
});
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Default limits:

- Authentication endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

---

## Testing with cURL

### Login Example

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.lecturer@university.edu",
    "password": "lecturer123"
  }'
```

### Get Dashboard (with auth)

```bash
curl -X GET http://localhost:5000/api/lecturer/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Postman Collection

Import the API into Postman for easy testing:

1. Create a new collection
2. Add environment variables:
   - `base_url`: http://localhost:5000/api
   - `token`: (will be set after login)
3. Import endpoints from this documentation

---

## Support

For API issues or questions, please refer to the main README.md or contact the development team.
