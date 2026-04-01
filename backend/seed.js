const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const SchoolClass = require('./models/SchoolClass');
const Subject = require('./models/Subject');
const Exam = require('./models/Exam');
const Timetable = require('./models/Timetable');
const Mark = require('./models/Mark');
const Fee = require('./models/Fee');
const Notification = require('./models/Notification');

// Connect to DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learnmate')
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => {
    console.error('Connection error', err);
    process.exit(1);
  });

const seedDatabase = async () => {
  try {
    // Clear existing data to ensure a clean database
    await Fee.deleteMany({});
    await Notification.deleteMany({});
    await Mark.deleteMany({});
    await Timetable.deleteMany({});
    await Exam.deleteMany({});
    await Subject.deleteMany({});
    await SchoolClass.deleteMany({});
    await User.deleteMany({});
    console.log('Existing data cleared');

    // 1. Create Subjects
    const subjects = await Subject.insertMany([
      { name: 'Science' },
      { name: 'Mathematics' },
      { name: 'ICT' },
      { name: 'History' },
      { name: 'Spanish' },
      { name: 'English' }
    ]);
    console.log(`${subjects.length} Subjects created`);

    // 2. Create School Classes (Grade 6 to 11)
    const class6 = await SchoolClass.create({ name: 'Grade 6', description: 'Middle School' });
    const class7 = await SchoolClass.create({ name: 'Grade 7', description: 'Middle School' });
    const class8 = await SchoolClass.create({ name: 'Grade 8', description: 'Middle School' });
    const class9 = await SchoolClass.create({ name: 'Grade 9', description: 'High School' });
    const class10 = await SchoolClass.create({ name: 'Grade 10', description: 'High School' });
    const class11 = await SchoolClass.create({ name: 'Grade 11', description: 'High School' });
    
    console.log('6 School Classes created');

    // 3. Create Users (Admin, Parent, Teacher & Students)
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      username: 'admin',
      email: 'admin@learnmate.com',
      password: password,
      name: 'System Admin',
      role: 'ADMIN'
    });

    const teacher = await User.create({
      username: 'mr_smith',
      email: 'smith@teacher.com',
      password: password,
      name: 'John Smith',
      role: 'TEACHER'
    });

    const student1 = await User.create({
      username: 'alice_w',
      email: 'alice@student.com',
      password: password,
      name: 'Alice Wonderland',
      role: 'STUDENT',
      schoolClass: class10._id,
      subjects: [subjects[0]._id, subjects[1]._id]
    });

    const student2 = await User.create({
      username: 'bob_b',
      email: 'bob@student.com',
      password: password,
      name: 'Bob Builder',
      role: 'STUDENT',
      schoolClass: class10._id,
      subjects: [subjects[0]._id, subjects[2]._id]
    });

    const student3 = await User.create({
      username: 'charlie_d',
      email: 'charlie@student.com',
      password: password,
      name: 'Charlie Davis',
      role: 'STUDENT',
      schoolClass: class11._id,
      subjects: [subjects[2]._id]
    });

    const parent = await User.create({
      username: 'parent',
      email: 'parent@learnmate.com',
      password: password,
      name: 'P. Wonderland & Builder',
      role: 'PARENT',
      children: [student1._id, student2._id]
    });

    // Update students to reference parent
    student1.parents.push(parent._id);
    await student1.save();
    student2.parents.push(parent._id);
    await student2.save();

    console.log('Users (Admin, Parent, Teacher and Students) created');

    // Update classes with student references
    class10.students.push(student1._id, student2._id);
    await class10.save();
    class11.students.push(student3._id);
    await class11.save();

    // 4. Create Timetable Entries
    const timetables = await Timetable.insertMany([
      {
        schoolClass: class10._id,
        teacher: teacher._id,
        subject: subjects[0]._id,
        title: 'Math Double Period',
        day: 'MONDAY',
        startTime: '08:00',
        endTime: '09:30',
        room: 'Room 101'
      },
      {
        schoolClass: class10._id,
        teacher: teacher._id,
        subject: subjects[1]._id,
        title: 'Physics Practical',
        day: 'TUESDAY',
        startTime: '10:00',
        endTime: '11:00',
        room: 'Lab 2'
      },
      {
        schoolClass: class11._id,
        teacher: teacher._id,
        subject: subjects[2]._id,
        title: 'ICT Theory',
        day: 'WEDNESDAY',
        startTime: '11:30',
        endTime: '12:30',
        room: 'Computer Lab'
      },
      {
        schoolClass: class10._id,
        teacher: teacher._id,
        subject: subjects[0]._id,
        title: 'Math Revision',
        day: 'THURSDAY',
        startTime: '13:00',
        endTime: '14:00',
        room: 'Room 101'
      },
      {
        schoolClass: class11._id,
        teacher: teacher._id,
        subject: subjects[2]._id,
        title: 'ICT Practice',
        day: 'FRIDAY',
        startTime: '09:00',
        endTime: '10:30',
        room: 'Computer Lab'
      }
    ]);
    console.log(`${timetables.length} Timetable entries created`);

    // 5. Create an Exam to link Marks to
    const mathExam = await Exam.create({
      subject: subjects[0]._id,
      teacher: teacher._id,
      schoolClass: class10._id,
      date: new Date(),
      title: 'Mid-Term Mathematics',
      maxMarks: 100,
      passMark: 40
    });

    const ictExam = await Exam.create({
      subject: subjects[2]._id,
      teacher: teacher._id,
      schoolClass: class11._id,
      date: new Date(),
      title: 'Mid-Term ICT',
      maxMarks: 100,
      passMark: 40
    });

    console.log('Exams created');

    // 6. Create Marks
    const marks = await Mark.insertMany([
      {
        student: student1._id,
        exam: mathExam._id,
        score: 85,
        remarks: 'Excellent work'
      },
      {
        student: student2._id,
        exam: mathExam._id,
        score: 72,
        remarks: 'Good progress'
      },
      {
        student: student3._id,
        exam: ictExam._id,
        score: 91,
        remarks: 'Outstanding performance'
      }
    ]);
    console.log(`${marks.length} Mark entries created`);

    // 7. Create Fee Records
    const fees = await Fee.insertMany([
      {
        student: student1._id,
        subject: subjects[0]._id, // Math
        schoolClass: class10._id,
        amount: 150.00,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next month
        status: 'PENDING'
      },
      {
        student: student1._id,
        subject: subjects[1]._id, // Physics
        schoolClass: class10._id,
        amount: 200.00,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: 'PAID',
        paymentDate: new Date()
      },
      {
        student: student2._id,
        subject: subjects[0]._id, // Math
        schoolClass: class10._id,
        amount: 150.00,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'PENDING'
      }
    ]);
    console.log(`${fees.length} Fee records created`);

    // 8. Create Notifications
    const notifications = await Notification.insertMany([
      {
        title: 'Welcome to Term 2',
        message: 'Welcome everyone! Classes begin formally on Monday. Please ensure all late fees are settled.',
        type: 'SYSTEM',
        createdBy: admin._id
      },
      {
        title: 'Physics Practical Delay',
        message: 'The physics lab is currently undergoing maintenance. Practicals are delayed by one week.',
        type: 'MANUAL',
        targetClass: class10._id,
        createdBy: teacher._id
      }
    ]);
    console.log(`${notifications.length} Notifications created`);

    console.log('--- Database Seeding Completed Successfully ---');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
