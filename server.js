const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Input validation middleware
const validateRegistration = (req, res, next) => {
  const { name, email, eventId } = req.body;
  if (!name || !email || !eventId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  next();
};

app.post('/register', validateRegistration, async (req, res) => {
  try {
    const registrationData = req.body;
    // Save registration data to a database
    console.log('Registration data received:', registrationData);
    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 