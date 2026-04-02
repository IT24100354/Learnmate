const PDFDocument = require('pdfkit');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Fee = require('../models/Fee');
const User = require('../models/User');

/**
 * Generate Attendance Report PDF
 */
const generateAttendanceReportPDF = async () => {
  try {
    const attendances = await Attendance.find()
      .populate('student', 'name username')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(20).font('Helvetica-Bold').text('Attendance Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      // Table headers
      const columns = ['Date', 'Student', 'Username', 'Marked By', 'Status'];
      const colWidths = [80, 100, 100, 80, 80];
      let yPosition = doc.y;

      // Draw header row
      doc.font('Helvetica-Bold').fontSize(9);
      let xPosition = 50;
      for (let i = 0; i < columns.length; i++) {
        doc.text(columns[i], xPosition, yPosition, { width: colWidths[i] });
        xPosition += colWidths[i];
      }

      doc.moveTo(50, yPosition + 12).lineTo(550, yPosition + 12).stroke();
      doc.font('Helvetica').fontSize(8);
      yPosition += 20;

      // Draw data rows
      for (const attendance of attendances) {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        xPosition = 50;
        const dateStr = new Date(attendance.date).toLocaleDateString();
        const status = attendance.present ? 'Present' : 'Absent';

        doc.text(dateStr, xPosition, yPosition, { width: colWidths[0] });
        xPosition += colWidths[0];
        doc.text(attendance.student?.name || 'N/A', xPosition, yPosition, { width: colWidths[1] });
        xPosition += colWidths[1];
        doc.text(attendance.student?.username || 'N/A', xPosition, yPosition, { width: colWidths[2] });
        xPosition += colWidths[2];
        doc.text(attendance.markedBy?.name || 'N/A', xPosition, yPosition, { width: colWidths[3] });
        xPosition += colWidths[3];
        doc.text(status, xPosition, yPosition, { width: colWidths[4] });

        yPosition += 15;
      }

      // Summary
      doc.moveDown(2);
      doc.font('Helvetica-Bold').fontSize(10);
      const presentCount = attendances.filter(a => a.present).length;
      const totalCount = attendances.length;
      const percentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(2) : 0;

      doc.text(`Total Records: ${totalCount}`);
      doc.text(`Present: ${presentCount}`);
      doc.text(`Absent: ${totalCount - presentCount}`);
      doc.text(`Overall Attendance Rate: ${percentage}%`);

      doc.end();
    });
  } catch (error) {
    console.error('Error generating attendance PDF:', error);
    throw error;
  }
};

/**
 * Generate Attendance Report CSV
 */
const generateAttendanceReportCSV = async () => {
  try {
    const attendances = await Attendance.find()
      .populate('student', 'name username')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    let csv = 'Date,Student,Username,Marked By,Status\n';

    for (const attendance of attendances) {
      const dateStr = new Date(attendance.date).toLocaleDateString();
      const status = attendance.present ? 'Present' : 'Absent';
      const row = [
        `"${dateStr}"`,
        `"${attendance.student?.name || 'N/A'}"`,
        `"${attendance.student?.username || 'N/A'}"`,
        `"${attendance.markedBy?.name || 'N/A'}"`,
        status
      ].join(',');
      csv += row + '\n';
    }

    return csv;
  } catch (error) {
    console.error('Error generating attendance CSV:', error);
    throw error;
  }
};

/**
 * Generate Marks Report PDF
 */
const generateMarksReportPDF = async () => {
  try {
    const marks = await Mark.find()
      .populate('student', 'name username')
      .populate('exam', 'name date maxMarks subject')
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(20).font('Helvetica-Bold').text('Marks Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      // Table headers
      const columns = ['Exam', 'Student', 'Teacher', 'Score', 'Max', 'Published'];
      const colWidths = [100, 100, 80, 60, 60, 80];
      let yPosition = doc.y;

      doc.font('Helvetica-Bold').fontSize(9);
      let xPosition = 40;
      for (let i = 0; i < columns.length; i++) {
        doc.text(columns[i], xPosition, yPosition, { width: colWidths[i] });
        xPosition += colWidths[i];
      }

      doc.moveTo(40, yPosition + 12).lineTo(540, yPosition + 12).stroke();
      doc.font('Helvetica').fontSize(8);
      yPosition += 20;

      // Draw data rows
      for (const mark of marks) {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        xPosition = 40;
        const examName = mark.exam?.name || 'N/A';
        const studentName = mark.student?.name || 'N/A';
        const teacherName = mark.teacher?.name || 'N/A';
        const score = mark.score !== null && mark.score !== undefined ? mark.score : 'N/A';
        const maxMarks = mark.exam?.maxMarks || 'N/A';
        const published = mark.published ? 'Yes' : 'No';

        doc.text(examName, xPosition, yPosition, { width: colWidths[0] });
        xPosition += colWidths[0];
        doc.text(studentName, xPosition, yPosition, { width: colWidths[1] });
        xPosition += colWidths[1];
        doc.text(teacherName, xPosition, yPosition, { width: colWidths[2] });
        xPosition += colWidths[2];
        doc.text(String(score), xPosition, yPosition, { width: colWidths[3] });
        xPosition += colWidths[3];
        doc.text(String(maxMarks), xPosition, yPosition, { width: colWidths[4] });
        xPosition += colWidths[4];
        doc.text(published, xPosition, yPosition, { width: colWidths[5] });

        yPosition += 15;
      }

      doc.end();
    });
  } catch (error) {
    console.error('Error generating marks PDF:', error);
    throw error;
  }
};

/**
 * Generate Marks Report CSV
 */
const generateMarksReportCSV = async () => {
  try {
    const marks = await Mark.find()
      .populate('student', 'name username')
      .populate('exam', 'name date maxMarks subject')
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });

    let csv = 'Exam,Student,Username,Teacher,Score,Max Marks,Published,Comments\n';

    for (const mark of marks) {
      const examName = mark.exam?.name || 'N/A';
      const studentName = mark.student?.name || 'N/A';
      const studentUsername = mark.student?.username || 'N/A';
      const teacherName = mark.teacher?.name || 'N/A';
      const score = mark.score !== null && mark.score !== undefined ? mark.score : 'N/A';
      const maxMarks = mark.exam?.maxMarks || 'N/A';
      const published = mark.published ? 'Yes' : 'No';
      const comments = mark.comments || '';

      const row = [
        `"${examName}"`,
        `"${studentName}"`,
        `"${studentUsername}"`,
        `"${teacherName}"`,
        score,
        maxMarks,
        published,
        `"${comments}"`
      ].join(',');
      csv += row + '\n';
    }

    return csv;
  } catch (error) {
    console.error('Error generating marks CSV:', error);
    throw error;
  }
};

/**
 * Generate Fees Report PDF
 */
const generateFeesReportPDF = async () => {
  try {
    const fees = await Fee.find()
      .populate('student', 'name username')
      .populate('subject', 'name')
      .populate('schoolClass', 'name')
      .sort({ dueDate: -1 });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(20).font('Helvetica-Bold').text('Fees Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      // Table headers
      const columns = ['Student', 'Subject', 'Amount', 'Due Date', 'Status', 'Paid Date'];
      const colWidths = [100, 80, 70, 80, 70, 80];
      let yPosition = doc.y;

      doc.font('Helvetica-Bold').fontSize(9);
      let xPosition = 40;
      for (let i = 0; i < columns.length; i++) {
        doc.text(columns[i], xPosition, yPosition, { width: colWidths[i] });
        xPosition += colWidths[i];
      }

      doc.moveTo(40, yPosition + 12).lineTo(540, yPosition + 12).stroke();
      doc.font('Helvetica').fontSize(8);
      yPosition += 20;

      // Draw data rows
      for (const fee of fees) {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        xPosition = 40;
        const studentName = fee.student?.name || 'N/A';
        const subjectName = fee.subject?.name || 'N/A';
        const dueDate = fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A';
        const paidDate = fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : 'N/A';

        doc.text(studentName, xPosition, yPosition, { width: colWidths[0] });
        xPosition += colWidths[0];
        doc.text(subjectName, xPosition, yPosition, { width: colWidths[1] });
        xPosition += colWidths[1];
        doc.text(`₹${fee.amount}`, xPosition, yPosition, { width: colWidths[2] });
        xPosition += colWidths[2];
        doc.text(dueDate, xPosition, yPosition, { width: colWidths[3] });
        xPosition += colWidths[3];
        doc.text(fee.status, xPosition, yPosition, { width: colWidths[4] });
        xPosition += colWidths[4];
        doc.text(paidDate, xPosition, yPosition, { width: colWidths[5] });

        yPosition += 15;
      }

      // Summary
      doc.moveDown(2);
      doc.font('Helvetica-Bold').fontSize(10);
      const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
      const paidAmount = fees
        .filter(f => f.status === 'PAID')
        .reduce((sum, f) => sum + f.amount, 0);
      const pendingAmount = fees
        .filter(f => f.status === 'PENDING')
        .reduce((sum, f) => sum + f.amount, 0);

      doc.text(`Total Expected: ₹${totalAmount}`);
      doc.text(`Total Collected: ₹${paidAmount}`);
      doc.text(`Pending: ₹${pendingAmount}`);
      doc.text(`Collection Rate: ${totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(2) : 0}%`);

      doc.end();
    });
  } catch (error) {
    console.error('Error generating fees PDF:', error);
    throw error;
  }
};

/**
 * Generate Fees Report CSV
 */
const generateFeesReportCSV = async () => {
  try {
    const fees = await Fee.find()
      .populate('student', 'name username')
      .populate('subject', 'name')
      .populate('schoolClass', 'name')
      .sort({ dueDate: -1 });

    let csv = 'Student,Username,Class,Subject,Amount,Due Date,Status,Paid Date\n';

    for (const fee of fees) {
      const studentName = fee.student?.name || 'N/A';
      const studentUsername = fee.student?.username || 'N/A';
      const className = fee.schoolClass?.name || 'N/A';
      const subjectName = fee.subject?.name || 'N/A';
      const dueDate = fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A';
      const paidDate = fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : 'N/A';

      const row = [
        `"${studentName}"`,
        `"${studentUsername}"`,
        `"${className}"`,
        `"${subjectName}"`,
        fee.amount,
        dueDate,
        fee.status,
        paidDate
      ].join(',');
      csv += row + '\n';
    }

    return csv;
  } catch (error) {
    console.error('Error generating fees CSV:', error);
    throw error;
  }
};

module.exports = {
  generateAttendanceReportPDF,
  generateAttendanceReportCSV,
  generateMarksReportPDF,
  generateMarksReportCSV,
  generateFeesReportPDF,
  generateFeesReportCSV
};
