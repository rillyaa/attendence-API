const jwt = require('jsonwebtoken');

module.exports = {
  authentication: (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: 'User unauthenticated!' });
    }

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Authentication Error:', error);
      res.status(401).json({ message: 'Invalid Token' });
    }
  }
}
