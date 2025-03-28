const router = require('express').Router();
const { createToken } = require('../controllers/authController');

router.post('/', createToken);

module.exports = router;