const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');

require('dotenv').config();

const { authentication } = require('./middlewares/auth')

const User = require('./models/user.model');
const Attendance = require('./models/attendence.model')

const port = process.env.PORT;

mongoose.connect(process.env.MONGODB_URL);

// DB Connection
const app = express();
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Database Connection Successfully!')
});

app.use(cors());
app.use(morgan('dev'));
app.use(express.json()); // untuk req body
app.use(express.urlencoded({ extended: false }));

// StorageImage
const Storage = multer.diskStorage({
  destination: '/uploads',
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  }
});

const upload = multer({
  storage: Storage
}).single('image')

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Users API
app.post('/users/register', (req, res) => {
  const payload = req.body;

  User.create(payload).then((data) => {
    res.json({
      success: 1,
      message: 'User Created Successfully!',
      data
    })
  }).catch((error) => {
    res.json({
      success: 0,
      message: error.message
    })
  })
})

app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      // Perhatikan penggunaan await di bawah ini
      const hashed = await bcrypt.compare(password, user.password);

      if (hashed) {
        const payload = {
          email: user.email,
          job: user.job,
          idCard: user.idCard
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY);

        res.json({
          message: 'Login Successfully!',
          data: {
            token,
            payload
          }
        });
      } else {
        res.json({
          success: 0,
          message: 'Email or Password invalid'
        });
      }
    } else {
      res.json({
        success: 0,
        message: 'User not found'
      });
    }
  } catch (error) {
    res.json({
      success: 0,
      message: error.message
    });
  }
});

app.get('/users', authentication, (req, res) => {
  User.find().then((data) => {
    res.json({
      message: 'Get All Users in List',
      data
    })
  }).catch((error) => {
    res.json({
      success: 0,
      message: error.message
    })
  })
});

app.get('/users/:idCard', authentication, async (req, res) => {
  try {
    const idCard = req.params.idCard;

    const user = await User.findOne({ idCard });

    if (user) {
      res.json({
        message: 'Get User by ID-Card',
        data: user
      });
    } else {
      res.json({
        success: 0,
        message: 'User not found'
      });
    }
  } catch (error) {
    res.json({
      success: 0,
      message: error.message
    });
  }
});

app.put('/users/:id/update', authentication, (req, res) => {
  const payload = req.body;
  const id = req.params.id;

  User.updateOne({ _id: id }, payload).then((data) => {
    res.json({
      message: 'User Updated Successfully!',
      data
    })
  }).catch((error) => {
    res.json({
      success: 0,
      message: error.message
    })
  })
})

app.delete('/users/:id/delete', authentication, (req, res) => {
  const id = req.params.id;

  User.deleteOne({ _id: id }).then((data) => {
    res.json({
      message: 'User Deleted Successfully!',
      data
    })
  }).catch((error) => {
    res.json({
      success: 0,
      message: error.message
    })
  })
})

// Attendance API
app.post('/users/attendance', authentication, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: 0, message: 'Error uploading image' });
    } else {
      const In = new Date(req.body.clockIn);
      const Out = new Date(req.body.clockOut);

      const newAttendance = new Attendance({
        date: req.body.date,
        clockIn: In,
        clockOut: Out,
        description: req.body.description,
        image: {
          data: req.file.filename,
          contentType: 'image/jpg'
        },
        User: req.user._id
      });
      newAttendance.save()
        .then(() => res.send('Successfully Attending!'))
        .catch(err => console.log(err))
    }
  });
});

app.listen(port, () => {
  console.log('Server ready on port : ' + port);
})
