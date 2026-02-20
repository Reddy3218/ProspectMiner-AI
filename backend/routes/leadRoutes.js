const router = require("express").Router();
const Lead = require("../models/Lead");

router.post("/", async (req, res) => {
  const newLead = new Lead(req.body);
  const savedLead = await newLead.save();
  res.json(savedLead);
});

router.get("/", async (req, res) => {
  const leads = await Lead.find();
  res.json(leads);
});

module.exports = router;