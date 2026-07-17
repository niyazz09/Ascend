const express = require('express');
const router = express.Router();

router.use((req, res) => {
  res.status(501).json({ error: "Not Implemented" });
});

module.exports = router;
