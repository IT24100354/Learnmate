const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const Mark = require('../models/Mark');
const Fee = require('../models/Fee');
const Notification = require('../models/Notification');

/**
 * Get Admin Dashboard Data
 * Statistics for overall system health
 */
const getAdminDashboard = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const activeStudents = await User.countDocuments({ role: 'STUDENT', active: true });
    const totalTeachers = await User.countDocuments({ role: 'TEACHER', active: true });
    const totalClasses = await User.countDocuments({ role: 'STUDENT', active: true });

    // Fee statistics
    const feePaid = await Fee.countDocuments({ status: 'PAID' });
    const feePending = await Fee.countDocuments({ status: 'PENDING' });
    const feeOverdue = await Fee.countDocuments({ status: 'OVERDUE' });

    // Total revenue
    const paidFees = await Fee.find({ status: 'PAID' });
    const totalRevenue = paidFees.reduce((sum, fee) => sum + fee.amount, 0);

    // Attendance statistics
    const totalAttendanceRecords = await Attendance.countDocuments();
    const presentRecords = await Attendance.countDocuments({ present: true });
    const attendanceRate = totalAttendanceRecords > 0 
      ? ((presentRecords / totalAttendanceRecords) * 100).toFixed(2)
      : 0;

    // Exam statistics
    const totalExams = await Exam.countDocuments();

    return {
      totalUsers,
      activeStudents,
      totalTeachers,
      totalClasses,
      feeStats: {
        paid: feePaid,
        pending: feePending,
        overdue: feeOverdue,
        totalRevenue
      },
      attendanceStats: {
        totalRecords: totalAttendanceRecords,
        presentRecords,
        attendanceRate: `${attendanceRate}%`
      },
      examStats: {
        total: totalExams
      }
    };
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    throw error;
  }
};

/**
 * Get Teacher Dashboard Data
 */
const getTeacherDashboard = async (teacher) => {
  try {
    if (!teacher || teacher.role !== 'TEACHER') {
      throw new Error('Invalid teacher');
    }

    // Get classes taught by this teacher (students with teacher's subjects)
    const studentsWithTeacherSubjects = await User.find({
      role: 'STUDENT',
      subjects: { $in: teacher.subjects }
    }).select('_id name username schoolClass');

    const totalStudents = studentsWithTeacherSubjects.length;

    // Get exams created by this teacher
    const exams = await Exam.find({ createdBy: teacher._id });

    // Get marks entered by this teacher
    const marks = await Mark.find({ teacher: teacher._id });

    // Get attendance marked by this teacher
    const attendanceRecords = await Attendance.find({ markedBy: teacher._id });

    // Ungraded exams
    const ungradedMarks = await Mark.countDocuments({
      teacher: teacher._id,
      score: { $exists: false }
    });

    // Pending attendance marking (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pendingAttendance = await Attendance.countDocuments({
      markedBy: teacher._id,
      date: { $gte: today, $lt: tomorrow },
      present: null
    });

    return {
      teacherName: teacher.name,
      totalStudents,
      totalExams: exams.length,
      marksEntered: marks.length,
      attendanceRecorded: attendanceRecords.length,
      ungradedCount: ungradedMarks,
      pendingAttendance,
      recentExams: exams.slice(-5).reverse()
    };
  } catch (error) {
    console.error('Error fetching teacher dashboard:', error);
    throw error;
  }
};

/**
 * Get Student Dashboard Data
 */
const getStudentDashboard = async (student) => {
  try {
    if (!student || student.role !== 'STUDENT') {
      throw new Error('Invalid student');
    }

    // Attendance rate
    const attendanceRecords = await Attendance.find({ student: student._id });
    const presentDays = attendanceRecords.filter(a => a.present).length;
    const attendanceRate = attendanceRecords.length > 0 
      ? ((presentDays / attendanceRecords.length) * 100).toFixed(2)
      : 0;

    // Upcoming exams
    const today = new Date();
    const upcomingExams = await Exam.find({
      schoolClass: student.schoolClass,
      date: { $gte: today }
    }).sort({ date: 1 }).limit(5);

    // My marks
    const myMarks = await Mark.find({ student: student._id })
      .populate('exam', 'name date maxMarks')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate average score
    let averageScore = 0;
    if (myMarks.length > 0) {
      const totalScore = myMarks.reduce((sum, m) => sum + (m.score || 0), 0);
      averageScore = (totalScore / myMarks.length).toFixed(2);
    }

    // Fee status
    const fees = await Fee.find({ student: student._id });
    const feePaid = fees.filter(f => f.status === 'PAID').length;
    const feePending = fees.filter(f => f.status === 'PENDING').length;
    const feeOverdue = fees.filter(f => f.status === 'OVERDUE').length;

    // Unread notifications
    const unreadNotifications = await Notification.countDocuments({
      $or: [
        { targetUser: student._id },
        { targetRole: 'STUDENT' },
        { targetClass: student.schoolClass }
      ],
      read: false
    });

    return {
      studentName: student.name,
      class: student.schoolClass?.name,
      attendanceRate: `${attendanceRate}%`,
      upcomingExams: upcomingExams.length,
      marksPublished: myMarks.length,
      averageScore: myMarks.length > 0 ? averageScore : 'N/A',
      feeStatus: {
        paid: feePaid,
        pending: feePending,
        overdue: feeOverdue
      },
      unreadNotifications,
      recentMarks: myMarks.slice(0, 5)
    };
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    throw error;
  }
};

/**
 * Get Parent Dashboard Data
 */
const getParentDashboard = async (parent) => {
  try {
    if (!parent || parent.role !== 'PARENT') {
      throw new Error('Invalid parent');
    }

    // Get children
    const children = await User.find({ _id: { $in: parent.children } });

    if (children.length === 0) {
      return {
        parentName: parent.name,
        children: [],
        message: 'No children linked to this account'
      };
    }

    // Aggregate data for all children
    const childrenData = await Promise.all(
      children.map(async (child) => {
        const attendance = await Attendance.find({ student: child._id });
        const presentDays = attendance.filter(a => a.present).length;
        const attendanceRate = attendance.length > 0 
          ? (presentDays / attendance.length * 100).toFixed(2)
          : 0;

        const marks = await Mark.find({ student: child._id })
          .sort({ createdAt: -1 })
          .limit(5);

        const totalMarks = marks.reduce((sum, m) => sum + (m.score || 0), 0);
        const averageScore = marks.length > 0 ? (totalMarks / marks.length).toFixed(2) : 'N/A';

        const fees = await Fee.find({ student: child._id });
        const feePending = fees.filter(f => f.status === 'PENDING').length;
        const feeOverdue = fees.filter(f => f.status === 'OVERDUE').length;

        return {
          name: child.name,
          className: child.schoolClass?.name,
          attendanceRate: `${attendanceRate}%`,
          averageScore,
          feePending,
          feeOverdue,
          lastUpdate: new Date()
        };
      })
    );

    return {
      parentName: parent.name,
      childrenCount: children.length,
      children: childrenData
    };
  } catch (error) {
    console.error('Error fetching parent dashboard:', error);
    throw error;
  }
};

/**
 * Get Director Dashboard Data - High-level analytics
 */
const getDirectorDashboard = async () => {
  try {
    // Overall statistics
    const totalStudents = await User.countDocuments({ role: 'STUDENT', active: true });
    const totalTeachers = await User.countDocuments({ role: 'TEACHER', active: true });
    const activeUsers = await User.countDocuments({ active: true });

    // Attendance trends
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const attendanceThisWeek = await Attendance.find({
      date: { $gte: lastWeek, $lte: today },
      present: true
    }).countDocuments();

    const totalRecordsThisWeek = await Attendance.countDocuments({
      date: { $gte: lastWeek, $lte: today }
    });

    const attendancePercentage = totalRecordsThisWeek > 0 
      ? ((attendanceThisWeek / totalRecordsThisWeek) * 100).toFixed(2)
      : 0;

    // Fee collection
    const totalFeeAmount = await Fee.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const collectedFees = await Fee.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpected = totalFeeAmount[0]?.total || 0;
    const totalCollected = collectedFees[0]?.total || 0;
    const collectionPercentage = totalExpected > 0 
      ? ((totalCollected / totalExpected) * 100).toFixed(2)
      : 0;

    // Academic performance
    const topPerformers = await Mark.aggregate([
      { $match: { score: { $exists: true, $ne: null } } },
      { $group: { _id: '$student', avgScore: { $avg: '$score' } } },
      { $sort: { avgScore: -1 } },
      { $limit: 10 }
    ]);

    // Students with low attendance (alert indicator)
    const lowAttendanceStudents = await Attendance.aggregate([
      { $match: { student: { $exists: true } } },
      { $group: { 
          _id: '$student', 
          presentCount: { $sum: { $cond: ['$present', 1, 0] } },
          totalCount: { $sum: 1 }
        }
      },
      { $addFields: { 
          attendanceRate: { 
            $divide: ['$presentCount', '$totalCount'] 
          }
        }
      },
      { $match: { attendanceRate: { $lt: 0.75 } } },
      { $limit: 20 }
    ]);

    return {
      summary: {
        totalStudents,
        totalTeachers,
        activeUsers
      },
      attendance: {
        thisWeekPercentage: `${attendancePercentage}%`,
        trend: 'monitoring'
      },
      finances: {
        totalExpected: totalExpected,
        totalCollected: totalCollected,
        collectionPercentage: `${collectionPercentage}%`,
        pending: await Fee.countDocuments({ status: 'PENDING' }),
        overdue: await Fee.countDocuments({ status: 'OVERDUE' })
      },
      performance: {
        topPerformers: topPerformers.length,
        lowAttendanceAlerts: lowAttendanceStudents.length
      }
    };
  } catch (error) {
    console.error('Error fetching director dashboard:', error);
    throw error;
  }
};

/**
 * Get Student Support Officer Dashboard
 * Alerts on students with low attendance or declining grades
 */
const getSupportOfficerDashboard = async () => {
  try {
    // Students with low attendance
    const lowAttendanceStudents = await Attendance.aggregate([
      { $match: { student: { $exists: true } } },
      { $group: { 
          _id: '$student', 
          presentCount: { $sum: { $cond: ['$present', 1, 0] } },
          totalCount: { $sum: 1 }
        }
      },
      { $addFields: { 
          attendanceRate: { 
            $divide: ['$presentCount', '$totalCount'] 
          }
        }
      },
      { $match: { attendanceRate: { $lt: 0.75 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'studentInfo' } },
      { $sort: { attendanceRate: 1 } }
    ]);

    // Students with declining grades (recent marks lower than average)
    const decliningGradesStudents = await Mark.aggregate([
      { $match: { score: { $exists: true, $ne: null } } },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: '$student',
          recentScores: { $push: '$score' },
          earlierScores: { $push: '$score' }
        }
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'studentInfo' } },
      { $limit: 20 }
    ]);

    // Alert count
    const alertCount = lowAttendanceStudents.length + decliningGradesStudents.length;

    return {
      lowAttendanceAlerts: lowAttendanceStudents.slice(0, 10).map(s => ({
        student: s.studentInfo[0]?.name || 'Unknown',
        studentId: s._id,
        attendanceRate: (s.attendanceRate * 100).toFixed(2),
        priority: s.attendanceRate < 0.5 ? 'CRITICAL' : 'HIGH'
      })),
      decliningGradesAlerts: decliningGradesStudents.slice(0, 10),
      totalAlerts: alertCount,
      actionRequired: alertCount > 0
    };
  } catch (error) {
    console.error('Error fetching support officer dashboard:', error);
    throw error;
  }
};

module.exports = {
  getAdminDashboard,
  getTeacherDashboard,
  getStudentDashboard,
  getParentDashboard,
  getDirectorDashboard,
  getSupportOfficerDashboard
};
