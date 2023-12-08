const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: String,
  description: String
}, {
  timestamps: true
});

const Department = mongoose.model('Department', DepartmentSchema);

module.exports = Department;
