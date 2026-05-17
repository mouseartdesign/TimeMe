const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.JWT_SECRET || 'supersecret123', { expiresIn: '3d' });
}

// Signup route
router.post('/signup', async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = await User.create({ email, password: hash, name });

        const token = createToken(user._id);

        res.status(200).json({ email, token, name: user.name });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Incorrect email' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Incorrect password' });
        }

        const token = createToken(user._id);

        res.status(200).json({ email, token, name: user.name });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
