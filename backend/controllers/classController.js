const SchoolClass = require('../models/SchoolClass');
const Timetable = require('../models/Timetable');
const User = require('../models/User');

const getTeacherClasses = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const timetables = await Timetable.find({ teacher: teacherId }).populate('schoolClass');
    
    const seen = new Set();
    const classes = [];
    timetables.forEach((entry) => {
      if (entry.schoolClass?._id) {
        const key = String(entry.schoolClass._id);
        if (!seen.has(key)) {
          seen.add(key);
          classes.push(entry.schoolClass);
        }
      }
    });

    if (classes.length === 0) {
      // If no timetables assigned, might fallback or just return empty. The Java logic returned all classes if 0 in some places, but returning empty array is safer.
      const all = await SchoolClass.find().sort({ name: 1 });
      return res.json(all);
    }

    res.json(classes.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''))));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClassStudents = async (req, res) => {
  try {
    const classId = req.params.id;
    const students = await User.find({ schoolClass: classId, role: 'STUDENT' })
      .select('_id name username email role');
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createClass = async (req, res) => {
  try {
    const newClass = await SchoolClass.create(req.body);
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClasses = async (req, res) => {
  try {
    const classes = await SchoolClass.find().populate('students', 'name email role');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClassById = async (req, res) => {
  try {
    const schoolClass = await SchoolClass.findById(req.params.id).populate('students', 'name email role');
    if (!schoolClass) return res.status(404).json({ message: 'Class not found' });
    res.json(schoolClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateClass = async (req, res) => {
  try {
    const updatedClass = await SchoolClass.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClass) return res.status(404).json({ message: 'Class not found' });
    res.json(updatedClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteClass = async (req, res) => {
  try {
    const deletedClass = await SchoolClass.findByIdAndDelete(req.params.id);
    if (!deletedClass) return res.status(404).json({ message: 'Class not found' });
    res.json({ message: 'Class removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createClass, getClasses, getClassById, updateClass, deleteClass, getTeacherClasses, getClassStudents };
