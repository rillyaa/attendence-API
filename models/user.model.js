const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name: String,
  idCard: {
    type: String,
    unique: true,
    validate: {
      validator: async function (value) {
        // Mengecek apakah idCard sudah digunakan oleh user lain
        const user = await mongoose.model('User').findOne({ idCard: value });
        return !user;
      },
      message: 'ID Card already registered'
    }
  },
  job: String,
  email: {
    type: String,
    unique: [true, 'Email already registered'],
    validate: {
      validator: (email) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(String(email))
      },
      message: 'Email format invalid'
    },
    required: [true, 'Please input your correct email']
  },
  password: {
    type: String,
    validate: {
      validator: (password) => {
        return new Promise((resolve, reject) => {
          if (/^(?=.*[a-z])(?=.*[0-9]).{6,20}$/.test(String(password))) {
            resolve()
          } else {
            const statusMessage = 'Password at least 6-20 characters and constain at least one number and one lowercase!';

            reject(statusMessage);
          }
        })
      }
    }
  },
  Department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }
}, {
  timestamps: true
});

UserSchema.pre('save', function (next) {
  bcrypt.genSalt(10, (errSalt, salt) => {
    if (!errSalt) {
      bcrypt.hash(this.password, salt, (errHash, hash) => {
        if (!errHash) {
          this.password = hash;
          next();
        } else {
          next(errHash);
        }
      })
    } else {
      next(errSalt);
    }
  })
})

const User = mongoose.model('User', UserSchema);

module.exports = User;
