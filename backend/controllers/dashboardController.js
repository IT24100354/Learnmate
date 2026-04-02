const dashboardService = require('../services/dashboardService');

/**
 * Main Dashboard Routing
 * Routes users to their role-specific dashboard
 */
const getDashboard = async (req, res) => {
  try {
    const user = req.currentUser;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let dashboardData;

    switch (user.role) {
      case 'ADMIN':
        dashboardData = await dashboardService.getAdminDashboard();
        break;
      case 'TEACHER':
        dashboardData = await dashboardService.getTeacherDashboard(user);
        break;
      case 'STUDENT':
        dashboardData = await dashboardService.getStudentDashboard(user);
        break;
      case 'PARENT':
        dashboardData = await dashboardService.getParentDashboard(user);
        break;
      case 'DIRECTOR':
        dashboardData = await dashboardService.getDirectorDashboard();
        break;
      case 'STUDENT_SUPPORT_OFFICER':
        dashboardData = await dashboardService.getSupportOfficerDashboard();
        break;
      default:
        return res.status(403).json({ message: 'Unknown user role' });
    }

    res.json({
      role: user.role,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Admin Dashboard
 */
const getAdminDashboard = async (req, res) => {
  try {
    const user = req.currentUser;
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admin can access this' });
    }

    const dashboardData = await dashboardService.getAdminDashboard();
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Teacher Dashboard
 */
const getTeacherDashboard = async (req, res) => {
  try {
    const user = req.currentUser;
    if (user.role !== 'TEACHER') {
      return res.status(403).json({ message: 'Only teachers can access this' });
    }

    const dashboardData = await dashboardService.getTeacherDashboard(user);
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Student Dashboard
 */
const getStudentDashboard = async (req, res) => {
  try {
    const user = req.currentUser;
    if (user.role !== 'STUDENT') {
      return res.status(403).json({ message: 'Only students can access this' });
    }

    const dashboardData = await dashboardService.getStudentDashboard(user);
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Parent Dashboard
 */
const getParentDashboard = async (req, res) => {
  try {
    const user = req.currentUser;
    if (user.role !== 'PARENT') {
      return res.status(403).json({ message: 'Only parents can access this' });
    }

    const dashboardData = await dashboardService.getParentDashboard(user);
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Director Dashboard
 */
const getDirectorDashboard = async (req, res) => {
  try {
    const user = req.currentUser;
    if (user.role !== 'DIRECTOR') {
      return res.status(403).json({ message: 'Only director can access this' });
    }

    const dashboardData = await dashboardService.getDirectorDashboard();
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Student Support Officer Dashboard
 */
const getSupportOfficerDashboard = async (req, res) => {
  try {
    const user = req.currentUser;
    if (user.role !== 'STUDENT_SUPPORT_OFFICER') {
      return res.status(403).json({ message: 'Only student support officers can access this' });
    }

    const dashboardData = await dashboardService.getSupportOfficerDashboard();
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboard,
  getAdminDashboard,
  getTeacherDashboard,
  getStudentDashboard,
  getParentDashboard,
  getDirectorDashboard,
  getSupportOfficerDashboard
};
