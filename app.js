const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const MongoStore = require('connect-mongo');
const Expense = require('./models/Expense');
const User = require('./models/User');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// MongoDB Atlas Connection
const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/expense_DB';
mongoose
  .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session Configuration
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: DB_URI, // Updated to use Atlas URI
    }),
  })
);

// Authentication Middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login-signup');
  }
};

// Routes

// Signup
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Signup successful!' });
  } catch (error) {
    res.status(400).json({ error: 'Error during signup' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.session.userId = user._id;
    res.status(200).json({ message: 'Login successful!', username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'Error during login' });
  }
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// User Data
app.get('/user-data', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.json({ username: user.username });
});

// Add Expense
app.post('/add', isAuthenticated, async (req, res) => {
  const { title, amount, date, category } = req.body;
  try {
    const newExpense = await Expense.create({
      title,
      amount,
      date,
      category,
      userId: req.session.userId,
    });
    res.json(newExpense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Fetch User Expenses
app.get('/user-expenses', isAuthenticated, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.session.userId });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Expense Summary
app.get('/expense-summary', isAuthenticated, async (req, res) => {
  const today = new Date();
  const userId = new mongoose.Types.ObjectId(req.session.userId);

  try {
    const totalExpenses = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);

    const dailyExpenses = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: new Date(today.setHours(0, 0, 0, 0)) },
        },
      },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);

    const weeklyExpenses = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: new Date(today.setDate(today.getDate() - 7)) },
        },
      },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);

    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: new Date(today.setMonth(today.getMonth() - 1)) },
        },
      },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);

    res.json({
      total: totalExpenses[0]?.totalAmount || 0,
      daily: dailyExpenses[0]?.totalAmount || 0,
      weekly: weeklyExpenses[0]?.totalAmount || 0,
      monthly: monthlyExpenses[0]?.totalAmount || 0,
    });
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    res.status(500).json({ error: 'Failed to fetch expense summary' });
  }
});

// Static Pages
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.get('/login-signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login-signup.html'));
});

app.get('/', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
