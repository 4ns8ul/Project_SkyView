import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/model', (req, res) => {
  res.render('model');
});

export default router;
