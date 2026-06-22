const router = require("express").Router();
const auth = require("../middleware/auth");
const Report = require("../models/Report");

router.use(auth);

// GET /api/reports — last 30 days summary for dashboard charts
router.get("/", async (req, res) => {
  try {
    // safety check (must come BEFORE using req.user)
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const reports = await Report.find({ owner: req.user.id })
      .sort({ date: -1 })
      .limit(30);

    // Aggregate totals
    const totals = reports.reduce(
      (acc, r) => {
        acc.threatsBlocked += r.threatsBlocked || 0;
        acc.adsBlocked += r.adsBlocked || 0;
        acc.phishingAttempts += r.phishingAttempts || 0;
        acc.dataLeaksPrevented += r.dataLeaksPrevented || 0;
        return acc;
      },
      {
        threatsBlocked: 0,
        adsBlocked: 0,
        phishingAttempts: 0,
        dataLeaksPrevented: 0,
      },
    );

    res.json({ reports, totals });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/reports/sync — called by Android app once per day
router.put("/sync", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      date,
      threatsBlocked,
      adsBlocked,
      phishingAttempts,
      dataLeaksPrevented,
      topBlockedDomains,
    } = req.body;

    if (!date) {
      return res.status(400).json({ error: "date (YYYY-MM-DD) is required" });
    }

    const report = await Report.findOneAndUpdate(
      { owner: req.user.id, date },
      {
        threatsBlocked,
        adsBlocked,
        phishingAttempts,
        dataLeaksPrevented,
        topBlockedDomains,
      },
      { upsert: true, new: true, runValidators: true },
    );

    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
