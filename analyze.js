const express = require('express');
const router = express.Router();
const { sql } = require('../db');
const auth = require('../middleware/auth');

// ✅ YOUR AI FUNCTION
function analyzeStartup(data) {
  let score = 0;
  let risks = [];
  let suggestions = [];
  let predictions = [];

  if (data.marketDemand === "Very High") score += 10;
  else if (data.marketDemand === "High") score += 20;
  else if (data.marketDemand === "Medium") {
    score += 35;
    risks.push("Moderate market demand may limit growth");
    suggestions.push("Validate demand with real users before scaling");
  } else {
    score += 50;
    risks.push("Low demand is a major risk");
    suggestions.push("Focus on solving a stronger real-world problem");
  }

  if (data.competition === "Very High") {
    score += 40;
    risks.push("Heavy competition from established players");
    suggestions.push("Differentiate your product strongly");
  } else if (data.competition === "High") {
    score += 30;
    risks.push("Strong competition may affect growth");
    suggestions.push("Build unique value proposition");
  } else if (data.competition === "Medium") {
    score += 20;
  } else {
    score += 10;
    predictions.push("Low competition increases success chances");
  }

  if (data.budget.includes("Under")) {
    score += 30;
    risks.push("Low budget may limit execution");
    suggestions.push("Start with MVP and bootstrap carefully");
  } else if (data.budget.includes("$10K")) {
    score += 20;
  } else if (data.budget.includes("$50K")) {
    score += 15;
  } else {
    score += 10;
    predictions.push("Strong budget supports scaling");
  }

  if (data.description.length < 50) {
    risks.push("Idea is not clearly defined");
    suggestions.push("Provide a detailed business plan");
    score += 15;
  } else {
    predictions.push("Well-described idea improves clarity");
  }

  if (data.description.toLowerCase().includes("ai")) {
    predictions.push("AI-based startups have high future potential");
  }

  if (data.description.toLowerCase().includes("delivery")) {
    risks.push("Logistics and operations can be complex");
  }

  if (data.description.toLowerCase().includes("health")) {
    risks.push("Healthcare startups face strict regulations");
  }

  score = Math.min(100, score);

  let level = "Medium";
  if (score < 35) level = "Low";
  else if (score > 65) level = "High";

  return {
    riskScore: score,
    riskLevel: level,
    verdict:
      level === "Low"
        ? "This startup idea has strong potential with manageable risks."
        : level === "Medium"
        ? "This idea is feasible but requires improvements."
        : "This startup idea is high risk and needs careful planning.",
    innovationComment:
      data.description.length > 100
        ? "The idea shows good innovation and clarity."
        : "The idea needs more uniqueness and detail.",
    risks: risks.join(", ") || "No major risks identified",
    predictions:
      predictions.join(", ") ||
      "Startup success depends on execution and market conditions",
    suggestions:
      suggestions.join(", ") ||
      "Focus on validation, marketing, and strong execution"
  };
}

// ✅ API ROUTE
router.post('/', auth, async (req, res) => {
  try {
    const result = analyzeStartup(req.body);

    const saved = await sql`
      INSERT INTO analyses (
        user_id, startup_name, industry, budget, market_demand, competition, description,
        risk_score, risk_level, verdict, innovation_comment, risks, predictions, suggestions
      )
      VALUES (
        ${req.user.id},
        ${req.body.startupName},
        ${req.body.industry},
        ${req.body.budget},
        ${req.body.marketDemand},
        ${req.body.competition},
        ${req.body.description},
        ${result.riskScore},
        ${result.riskLevel},
        ${result.verdict},
        ${result.innovationComment},
        ${result.risks},
        ${result.predictions},
        ${result.suggestions}
      )
      RETURNING *
    `;

    res.json(saved[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

// ✅ IMPORTANT (THIS FIXES YOUR ERROR)
module.exports = router;