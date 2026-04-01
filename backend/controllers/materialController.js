const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');
const Subject = require('../models/Subject');
const SchoolClass = require('../models/SchoolClass');
const notificationService = require('../services/notificationService');

const MATERIAL_POPULATE = [
  { path: 'subject', select: 'name' },
  { path: 'schoolClass', select: 'name' },
  { path: 'teacher', select: 'name username email role' },
];

const hydrateMaterials = async (query) => {
  let chain = query;
  MATERIAL_POPULATE.forEach((entry) => {
    chain = chain.populate(entry);
  });
  return chain;
};

const serializeMaterial = (material) => ({
  _id: material._id,
  title: material.title,
  description: material.description,
  fileName: material.fileName,
  originalFileName: material.originalFileName,
  filePath: material.filePath,
  fileType: material.fileType,
  fileSize: material.fileSize,
  subject: material.subject,
  schoolClass: material.schoolClass,
  teacher: material.teacher,
  uploadedAt: material.uploadedAt,
  active: material.active,
  createdAt: material.createdAt,
  updatedAt: material.updatedAt,
});

const resolveVisibleMaterials = async (currentUser) => {
  if (!currentUser || currentUser.role !== 'STUDENT') {
    return hydrateMaterials(Material.find({ active: true }).sort({ uploadedAt: -1 }));
  }

  if (!currentUser.schoolClass) {
    return [];
  }

  const subjectIds = (currentUser.subjects || []).map((subjectId) => String(subjectId));
  const materials = await hydrateMaterials(
    Material.find({ active: true, schoolClass: currentUser.schoolClass }).sort({ uploadedAt: -1 })
  );

  if (subjectIds.length === 0) {
    return [];
  }

  return materials.filter((material) => subjectIds.includes(String(material.subject?._id)));
};

const listMaterials = async (req, res) => {
  try {
    const materials = await resolveVisibleMaterials(req.currentUser);
    const payload = {
      materials: materials.map(serializeMaterial),
      subjects: await Subject.find().sort({ name: 1 }),
      schoolClasses: await SchoolClass.find().sort({ name: 1 }),
      user: {
        _id: req.currentUser._id,
        name: req.currentUser.name,
        username: req.currentUser.username,
        role: req.currentUser.role,
      },
    };

    if (req.user.role === 'STUDENT' && !req.currentUser.schoolClass) {
      payload.error = 'No class assigned. Please contact your administrator.';
    } else if (req.user.role === 'STUDENT' && (!req.currentUser.subjects || req.currentUser.subjects.length === 0)) {
      payload.error = 'No subjects enrolled. Please contact your administrator.';
    }

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: `Error loading materials: ${error.message}` });
  }
};

const createMaterial = async (req, res) => {
  try {
    const title = req.body.title ? String(req.body.title).trim() : '';
    const description = req.body.description ? String(req.body.description).trim() : '';
    const subjectId = req.body.subject || req.body.subjectId;
    const schoolClassId = req.body.schoolClass || req.body.schoolClassId || req.body.classId;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!subjectId) {
      return res.status(400).json({ message: 'Subject is required' });
    }

    if (!schoolClassId) {
      return res.status(400).json({ message: 'Class is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const [subject, schoolClass] = await Promise.all([
      Subject.findById(subjectId),
      SchoolClass.findById(schoolClassId),
    ]);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (!schoolClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const material = await Material.create({
      title,
      description: description || null,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      subject: subject._id,
      schoolClass: schoolClass._id,
      teacher: req.currentUser._id,
      uploadedAt: new Date(),
      active: true,
    });

    await notificationService.createNotificationForClass({
      schoolClass,
      title: 'New Material Uploaded',
      message: `${title} for ${subject.name} is now available.`,
      type: 'SYSTEM',
    });

    const hydrated = await hydrateMaterials(Material.findById(material._id));
    res.status(201).json({ message: 'Material uploaded successfully!', material: serializeMaterial(hydrated) });
  } catch (error) {
    res.status(500).json({ message: `Failed to upload file: ${error.message}` });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const title = req.body.title ? String(req.body.title).trim() : '';
    const subjectId = req.body.subject || req.body.subjectId;
    const schoolClassId = req.body.schoolClass || req.body.schoolClassId || req.body.classId;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!subjectId) {
      return res.status(400).json({ message: 'Subject is required' });
    }

    if (!schoolClassId) {
      return res.status(400).json({ message: 'Class is required' });
    }

    const [subject, schoolClass] = await Promise.all([
      Subject.findById(subjectId),
      SchoolClass.findById(schoolClassId),
    ]);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (!schoolClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    material.title = title;
    material.description = req.body.description ? String(req.body.description).trim() : null;
    material.subject = subject._id;
    material.schoolClass = schoolClass._id;

    if (req.file) {
      material.fileName = req.file.filename;
      material.originalFileName = req.file.originalname;
      material.filePath = req.file.path;
      material.fileType = req.file.mimetype;
      material.fileSize = req.file.size;
    }

    await material.save();

    const hydrated = await hydrateMaterials(Material.findById(material._id));
    res.json({ message: 'Material updated successfully!', material: serializeMaterial(hydrated) });
  } catch (error) {
    res.status(500).json({ message: `Failed to update file: ${error.message}` });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    material.active = false;
    await material.save();
    res.json({ message: 'Material deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchMaterials = async (req, res) => {
  try {
    const title = req.query.title ? String(req.query.title).trim().toLowerCase() : '';
    const subjectId = req.query.subjectId || null;
    const classId = req.query.classId || null;

    let materials = await resolveVisibleMaterials(req.currentUser);

    if (title) {
      materials = materials.filter((material) => material.title?.toLowerCase().includes(title));
    }

    if (subjectId) {
      materials = materials.filter((material) => String(material.subject?._id) === String(subjectId));
    }

    if (classId) {
      materials = materials.filter((material) => String(material.schoolClass?._id) === String(classId));
    }

    res.json({ materials: materials.map(serializeMaterial) });
  } catch (error) {
    res.status(500).json({ message: `Error searching materials: ${error.message}` });
  }
};

const downloadMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material || !material.filePath) {
      return res.status(404).json({ message: 'Material file not found' });
    }

    const absolutePath = path.isAbsolute(material.filePath)
      ? material.filePath
      : path.join(__dirname, '..', material.filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Material file not found' });
    }

    res.download(absolutePath, material.originalFileName || material.fileName || 'material');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  searchMaterials,
  downloadMaterial,
};
