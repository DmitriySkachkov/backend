const router = require('express').Router();
const userRouter = require('./users');
const bookRouter = require('./books');

router.use('/users', userRouter);
router.use('/books', bookRouter);

module.exports = router;

