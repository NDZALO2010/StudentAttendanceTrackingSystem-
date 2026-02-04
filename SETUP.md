# SATS Setup Guide

Complete setup instructions for the Student Attendance Tracking System.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** (optional, for version control)

## Step 1: Database Setup

### Option A: Local PostgreSQL

1. **Install PostgreSQL** if not already installed

2. **Create Database**:
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

### Option B: PostgreSQL with Docker

```bash
docker run --name sats-postgres \
  -e POSTGRES_DB=sats_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14
```

### Option C: Run Backend & DB with Docker Compose

From the repository root, run (backend-only):

```bash
# run only backend + db
docker compose -f backend/docker-compose.yml up --build -d
```

This will build and start the `db` and `backend` services. The backend container runs a startup script that waits for the database to be ready, runs migrations, and seeds demo data automatically.

### Option D: Run the full stack (DB + Backend + Frontend)

To run everything (frontend served by Nginx) with one command from the repository root, run:

```bash
# runs db, backend, and frontend
docker compose up --build -d
```

To follow logs:

```bash
docker compose logs -f frontend
docker compose logs -f backend
```

To stop and remove the full-stack containers and networks:

```bash
docker compose down
```

Run the frontend dev server inside a container (hot reload)

```bash
# Start the dev frontend container that runs Vite and mounts your source files
docker compose -f docker-compose.dev.yml up --build -d

# Stop the static frontend service first if it's running (it binds port 5173)
docker compose stop frontend
```

Or use the convenience npm scripts from the repository root:

```bash
# Start frontend dev container
npm run dev:up

# Stop frontend dev container
npm run dev:down
```

This is useful if you want consistent dev environment across machines and don't want to install Node locally.

## Step 2: Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** with your database credentials:
   ```env
   NODE_ENV=development
   PORT=5000
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sats_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   JWT_SECRET=your_super_secret_jwt_key_change_this
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your_refresh_token_secret
   JWT_REFRESH_EXPIRE=30d
   
   CORS_ORIGIN=http://localhost:5173
   FACE_MATCH_THRESHOLD=0.6
   ```

5. **Run database migrations**:
   ```bash
   npm run migrate
   ```

6. **Seed demo data** (optional but recommended):
   ```bash
   npm run seed
   ```

7. **Start the backend server**:
   ```bash
   npm run dev
   ```

   The backend should now be running on `http://localhost:5000`

## Step 3: Frontend Setup

1. **Open a new terminal** and navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Download face-api.js models**:
   
   Create a `public/models` directory and download the required models:
   
   ```bash
   mkdir -p public/models
   cd public/models
   
   # Download models from face-api.js repository
   # Or use the following commands:
   ```
   
   Download these files to `public/models/`:
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`
   - `face_recognition_model-shard2`
   - `face_expression_model-weights_manifest.json`
   - `face_expression_model-shard1`

   You can download them from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   The frontend should now be running on `http://localhost:5173`

## Step 4: Access the Application

1. **Open your browser** and navigate to `http://localhost:5173`

2. **Login with demo accounts**:

   **Lecturer Account:**
   - Email: `john.lecturer@university.edu`
   - Password: `lecturer123`

   **Student Account:**
   - Email: `alice.student@university.edu`
   - Password: `student123`

## Demo Data Overview

The seeded database includes:

- **3 Lecturers**: John Smith, Sarah Johnson, Michael Brown
- **8 Students**: Alice, Bob, Charlie, Diana, Emma, Frank, Grace, Henry
- **4 Classes**: CS101, CS201, MATH201, CS301
- **Multiple Sessions**: Past 2 weeks of attendance data
- **Face Descriptors**: Pre-registered for all students

## Testing Facial Recognition

Since demo students have pre-registered face descriptors, you can:

1. Login as a student
2. Navigate to "Check-In"
3. Allow camera access
4. The system will attempt to match your face with stored descriptors

**Note**: For actual facial recognition to work, you'll need to:
- Register your own face first
- Ensure good lighting
- Face the camera directly

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Test connection
psql -U postgres -d sats_db
```

### Port Already in Use

```bash
# Backend (port 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9
```

### Face-api.js Models Not Loading

- Ensure models are in `frontend/public/models/`
- Check browser console for 404 errors
- Verify model files are not corrupted

### CORS Errors

- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check that both servers are running

## Development Workflow

### Running Both Servers Concurrently

You can use two terminal windows:

**Terminal 1 (Backend)**:
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

### Making Changes

- **Backend changes**: Server auto-restarts with nodemon
- **Frontend changes**: Hot module replacement (HMR) updates instantly

## Building for Production

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_NAME | Database name | sats_db |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | - |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRE | Token expiration | 7d |
| CORS_ORIGIN | Allowed origin | http://localhost:5173 |

### Frontend (.env)

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Next Steps

1. **Explore the Application**:
   - Try the lecturer dashboard
   - Create a new class
   - Start an attendance session
   - Check in as a student

2. **Customize**:
   - Modify color schemes in `frontend/src/theme/muiTheme.ts`
   - Add new features
   - Adjust face recognition threshold

3. **Deploy**:
   - See deployment guide for production setup
   - Configure environment for your hosting platform

## Support

For issues or questions:
- Check the README.md
- Review the code comments
- Check browser console for errors
- Verify all services are running

## Security Notes

⚠️ **Important for Production**:

1. Change all default passwords
2. Use strong JWT secrets
3. Enable HTTPS
4. Set up proper CORS policies
5. Implement rate limiting
6. Regular security updates
7. Secure face descriptor storage

## License

MIT License - See LICENSE file for details
