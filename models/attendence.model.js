const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  clockIn: {
    type: Date,
    required: true
  },
  clockOut: {
    type: Date
  },
  description: String,
  image: {
    data: Buffer,
    contentType: String // Assuming store the file path or URL to the photo
  },
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Attendence = mongoose.model('Attendence', AttendanceSchema);

module.exports = Attendence;
