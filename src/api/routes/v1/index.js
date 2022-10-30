const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const communityRoutes = require('./community.route');

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));

router.use('/uploads', express.static('./public/uploads'));

router.use('/auth', authRoutes);

router.use('/users', userRoutes);

router.use('/communities', communityRoutes);

module.exports = router;
