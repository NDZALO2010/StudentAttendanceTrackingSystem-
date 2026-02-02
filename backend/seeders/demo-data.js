const sequelize = require('../config/database');
const {
  User,
  Class,
  Enrollment,
  Session,
  Attendance,
  FaceDescriptor
} = require('../models');

// Generate random face descriptor (128-dimensional vector)
const generateFaceDescriptor = () => {
  return Array.from({ length: 128 }, () => Math.random() * 2 - 1);
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (in development only)
    if (process.env.NODE_ENV === 'development') {
      await Attendance.destroy({ where: {}, force: true });
      await Session.destroy({ where: {}, force: true });
      await Enrollment.destroy({ where: {}, force: true });
      await FaceDescriptor.destroy({ where: {}, force: true });
      await Class.destroy({ where: {}, force: true });
      await User.destroy({ where: {}, force: true });
      console.log('✅ Existing data cleared');
    }

    // Create Lecturers
    const lecturers = await User.bulkCreate([
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.lecturer@university.edu',
        password: 'lecturer123',
        role: 'lecturer',
        employeeId: 'EMP001',
        department: 'Computer Science',
        phoneNumber: '+1234567890',
        isActive: true
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.lecturer@university.edu',
        password: 'lecturer123',
        role: 'lecturer',
        employeeId: 'EMP002',
        department: 'Mathematics',
        phoneNumber: '+1234567891',
        isActive: true
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.lecturer@university.edu',
        password: 'lecturer123',
        role: 'lecturer',
        employeeId: 'EMP003',
        department: 'Computer Science',
        phoneNumber: '+1234567892',
        isActive: true
      }
    ]);
    console.log('✅ Lecturers created');

    // Create Students
    const students = await User.bulkCreate([
      {
        firstName: 'Alice',
        lastName: 'Williams',
        email: 'alice.student@university.edu',
        password: 'student123',
        role: 'student',
        studentId: 'STU001',
        department: 'Computer Science',
        phoneNumber: '+1234567893',
        isActive: true
      },
      {
        firstName: 'Bob',
        lastName: 'Davis',
        email: 'bob.student@university.edu',
        password: 'student123',
        role: 'student',
        studentId: 'STU002',
        department: 'Computer Science',
        phoneNumber: '+1234567894',
        isActive: true
      },
      {
        firstName: 'Charlie',
        lastName: 'Miller',
        email: 'charlie.student@university.edu',
        password: 'student123',
        role: 'student',
        studentId: 'STU003',
        department: 'Computer Science',
        phoneNumber: '+1234567895',
        isActive: true
      },
      {
        firstName: 'Diana',
        lastName: 'Wilson',
        email: 'diana.student@university.edu',
        password: 'student123',
        role: 'student',
        studentId: 'STU004',
        department: 'Mathematics',
        phoneNumber: '+1234567896',
        isActive: true
      },
      {
        firstName: 'Emma',
        lastName: 'Moore',
        email: 'emma.student@university.edu',
        password: 'student123',
        role: 'student',
        studentId: 'STU005',
        department: 'Computer Science',
        phoneNumber: '+1234567897',
        isActive: true
      },
      {
        firstName: 'Frank',
        lastName: 'Taylor',
        email: 'frank.student@university.edu',
        password: 'student123',
        role: 'student',
        studentId: 'STU006',
        department: 'Computer Science',
        phoneNumber: '+1234567898',
        isActive: true
      },
      {
        firstName: 'Grace',
        lastName: 'Anderson',
        email: 'grace.student@university.edu',
        password: 'student123',
        role: 'student',
        studentId: 'STU007',
        department: 'Mathematics',
        phoneNumber: '+1234567899',
        isActive: true
      },
      {
        firstName: 'Henry',
        lastName: 'Thomas',
        email: 'henry.student@university.edu',
        password: 'student123',
        role: 'student',
        studentId: 'STU008',
        department: 'Computer Science',
        phoneNumber: '+1234567800',
        isActive: true
      }
    ]);
    console.log('✅ Students created');

    // Create Face Descriptors for students
    const faceDescriptors = students.map(student => ({
      studentId: student.id,
      descriptor: generateFaceDescriptor(),
      qualityScore: 0.85 + Math.random() * 0.15,
      isActive: true
    }));
    await FaceDescriptor.bulkCreate(faceDescriptors);
    console.log('✅ Face descriptors created');

    // Create Classes
    const classes = await Class.bulkCreate([
      {
        courseCode: 'CS101',
        courseName: 'Introduction to Programming',
        description: 'Learn the fundamentals of programming using Python',
        lecturerId: lecturers[0].id,
        semester: 'Fall',
        academicYear: '2024',
        schedule: [
          { day: 'Monday', startTime: '10:00', endTime: '11:30', location: 'Room 101' },
          { day: 'Wednesday', startTime: '10:00', endTime: '11:30', location: 'Room 101' }
        ],
        maxStudents: 50,
        department: 'Computer Science',
        credits: 3,
        color: '#2563EB',
        isActive: true
      },
      {
        courseCode: 'CS201',
        courseName: 'Data Structures and Algorithms',
        description: 'Advanced data structures and algorithm design',
        lecturerId: lecturers[0].id,
        semester: 'Fall',
        academicYear: '2024',
        schedule: [
          { day: 'Tuesday', startTime: '14:00', endTime: '15:30', location: 'Room 202' },
          { day: 'Thursday', startTime: '14:00', endTime: '15:30', location: 'Room 202' }
        ],
        maxStudents: 40,
        department: 'Computer Science',
        credits: 4,
        color: '#10B981',
        isActive: true
      },
      {
        courseCode: 'MATH201',
        courseName: 'Calculus II',
        description: 'Integration and series',
        lecturerId: lecturers[1].id,
        semester: 'Fall',
        academicYear: '2024',
        schedule: [
          { day: 'Monday', startTime: '09:00', endTime: '10:30', location: 'Room 301' },
          { day: 'Wednesday', startTime: '09:00', endTime: '10:30', location: 'Room 301' },
          { day: 'Friday', startTime: '09:00', endTime: '10:00', location: 'Room 301' }
        ],
        maxStudents: 45,
        department: 'Mathematics',
        credits: 4,
        color: '#F59E0B',
        isActive: true
      },
      {
        courseCode: 'CS301',
        courseName: 'Database Systems',
        description: 'Database design and SQL',
        lecturerId: lecturers[2].id,
        semester: 'Fall',
        academicYear: '2024',
        schedule: [
          { day: 'Tuesday', startTime: '10:00', endTime: '11:30', location: 'Lab 1' },
          { day: 'Thursday', startTime: '10:00', endTime: '11:30', location: 'Lab 1' }
        ],
        maxStudents: 35,
        department: 'Computer Science',
        credits: 3,
        color: '#EF4444',
        isActive: true
      }
    ]);
    console.log('✅ Classes created');

    // Create Enrollments
    const enrollments = [];
    
    // CS101 - 6 students
    for (let i = 0; i < 6; i++) {
      enrollments.push({
        studentId: students[i].id,
        classId: classes[0].id,
        status: 'active',
        attendancePercentage: 0
      });
    }

    // CS201 - 5 students
    for (let i = 0; i < 5; i++) {
      enrollments.push({
        studentId: students[i].id,
        classId: classes[1].id,
        status: 'active',
        attendancePercentage: 0
      });
    }

    // MATH201 - 4 students
    enrollments.push(
      { studentId: students[3].id, classId: classes[2].id, status: 'active', attendancePercentage: 0 },
      { studentId: students[4].id, classId: classes[2].id, status: 'active', attendancePercentage: 0 },
      { studentId: students[5].id, classId: classes[2].id, status: 'active', attendancePercentage: 0 },
      { studentId: students[6].id, classId: classes[2].id, status: 'active', attendancePercentage: 0 }
    );

    // CS301 - 4 students
    for (let i = 0; i < 4; i++) {
      enrollments.push({
        studentId: students[i].id,
        classId: classes[3].id,
        status: 'active',
        attendancePercentage: 0
      });
    }

    await Enrollment.bulkCreate(enrollments);
    console.log('✅ Enrollments created');

    // Create Sessions (past and present)
    const today = new Date();
    const sessions = [];

    // Create sessions for the past 2 weeks
    for (let i = 14; i >= 0; i--) {
      const sessionDate = new Date(today);
      sessionDate.setDate(sessionDate.getDate() - i);
      const dateStr = sessionDate.toISOString().split('T')[0];
      const dayOfWeek = sessionDate.getDay();

      // CS101 - Monday and Wednesday
      if (dayOfWeek === 1 || dayOfWeek === 3) {
        sessions.push({
          classId: classes[0].id,
          sessionDate: dateStr,
          startTime: '10:00:00',
          endTime: '11:30:00',
          location: 'Room 101',
          topic: `CS101 Lecture - Week ${Math.floor(i / 7) + 1}`,
          status: i === 0 ? 'ongoing' : 'completed',
          totalStudents: 6,
          isActive: i === 0
        });
      }

      // CS201 - Tuesday and Thursday
      if (dayOfWeek === 2 || dayOfWeek === 4) {
        sessions.push({
          classId: classes[1].id,
          sessionDate: dateStr,
          startTime: '14:00:00',
          endTime: '15:30:00',
          location: 'Room 202',
          topic: `CS201 Lecture - Week ${Math.floor(i / 7) + 1}`,
          status: 'completed',
          totalStudents: 5,
          isActive: false
        });
      }

      // MATH201 - Monday, Wednesday, Friday
      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
        sessions.push({
          classId: classes[2].id,
          sessionDate: dateStr,
          startTime: '09:00:00',
          endTime: dayOfWeek === 5 ? '10:00:00' : '10:30:00',
          location: 'Room 301',
          topic: `MATH201 Lecture - Week ${Math.floor(i / 7) + 1}`,
          status: 'completed',
          totalStudents: 4,
          isActive: false
        });
      }
    }

    const createdSessions = await Session.bulkCreate(sessions);
    console.log('✅ Sessions created');

    // Create Attendance Records
    const attendanceRecords = [];
    
    for (const session of createdSessions) {
      const classEnrollments = enrollments.filter(e => e.classId === session.classId);
      
      for (const enrollment of classEnrollments) {
        const random = Math.random();
        let status, checkInTime = null, checkInMethod = null;
        
        if (session.status === 'completed') {
          // Past sessions - varied attendance
          if (random < 0.75) {
            status = 'present';
            checkInTime = new Date(`${session.sessionDate}T${session.startTime}`);
            checkInTime.setMinutes(checkInTime.getMinutes() + Math.floor(Math.random() * 10));
            checkInMethod = 'facial_recognition';
          } else if (random < 0.85) {
            status = 'late';
            checkInTime = new Date(`${session.sessionDate}T${session.startTime}`);
            checkInTime.setMinutes(checkInTime.getMinutes() + 15 + Math.floor(Math.random() * 20));
            checkInMethod = 'facial_recognition';
          } else {
            status = 'absent';
          }
        } else {
          // Ongoing session - some already checked in
          if (random < 0.5) {
            status = 'present';
            checkInTime = new Date();
            checkInMethod = 'facial_recognition';
          } else {
            status = 'absent';
          }
        }

        attendanceRecords.push({
          sessionId: session.id,
          studentId: enrollment.studentId,
          status,
          checkInTime,
          checkInMethod,
          faceMatchConfidence: checkInMethod === 'facial_recognition' ? 0.85 + Math.random() * 0.15 : null
        });
      }
    }

    await Attendance.bulkCreate(attendanceRecords);
    console.log('✅ Attendance records created');

    // Update session counts
    for (const session of createdSessions) {
      const sessionAttendance = attendanceRecords.filter(a => a.sessionId === session.id);
      const presentCount = sessionAttendance.filter(a => a.status === 'present').length;
      const lateCount = sessionAttendance.filter(a => a.status === 'late').length;
      const absentCount = sessionAttendance.filter(a => a.status === 'absent').length;

      await session.update({
        presentCount,
        lateCount,
        absentCount
      });
    }
    console.log('✅ Session counts updated');

    // Update enrollment attendance percentages
    for (const enrollment of enrollments) {
      const studentAttendance = attendanceRecords.filter(
        a => a.studentId === enrollment.studentId
      );
      const sessionIds = studentAttendance.map(a => a.sessionId);
      const relevantSessions = createdSessions.filter(
        s => s.classId === enrollment.classId && sessionIds.includes(s.id)
      );

      if (relevantSessions.length > 0) {
        const present = studentAttendance.filter(
          a => a.status === 'present' || a.status === 'late'
        ).length;
        const percentage = ((present / relevantSessions.length) * 100).toFixed(2);
        
        await Enrollment.update(
          { attendancePercentage: percentage },
          { where: { studentId: enrollment.studentId, classId: enrollment.classId } }
        );
      }
    }
    console.log('✅ Enrollment percentages updated');

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Lecturers: ${lecturers.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Classes: ${classes.length}`);
    console.log(`   - Enrollments: ${enrollments.length}`);
    console.log(`   - Sessions: ${createdSessions.length}`);
    console.log(`   - Attendance Records: ${attendanceRecords.length}`);
    console.log('\n👤 Demo Accounts:');
    console.log('   Lecturer: john.lecturer@university.edu / lecturer123');
    console.log('   Student: alice.student@university.edu / student123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
