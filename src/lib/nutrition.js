/**
 * Système de scoring nutritionnel personnalisé et recommandations IA.
 */

export const calculateHealthScore = (product) => {
  let score = 5; // Base score on 10 or 5? Let's go with 0-10, starting at 5.
  
  const proteins = product.protein || 0;
  const sugars = product.sugars || 0;
  const nova = product.nova_group || 0;
  const nutriscore = product.nutriscore_grade?.toLowerCase() || '';

  // Étape B — Système de scoring perso :
  // +2 si protéines > 10g
  if (proteins > 10) score += 2;
  
  // -2 si sucres > 15g
  if (sugars > 15) score -= 2;
  
  // -3 si ultra transformé (NOVA 4)
  if (nova === 4) score -= 3;
  
  // +1 si NutriScore A/B
  if (['a', 'b'].includes(nutriscore)) score += 1;

  // Clamp score between 0 and 10
  return Math.max(0, Math.min(10, score));
};

export const getAIRecommendation = (product, userGoal = 'maintain') => {
  const score = calculateHealthScore(product);
  const proteins = product.protein || 0;
  const sugars = product.sugars || 0;
  
  let recommendation = "";
  let badge = "";

  if (userGoal === 'build_muscle') {
    if (proteins > 15) {
      recommendation = "Excellent pour votre prise de masse. Riche en protéines !";
      badge = "TOP GAINER";
    } else if (proteins > 8) {
      recommendation = "Bon snack protéiné pour compléter votre journée.";
      badge = "BON SNACK";
    } else {
      recommendation = "Un peu faible en protéines pour votre objectif actuel.";
      badge = "BOOST REQUIS";
    }
  } else if (userGoal === 'lose_weight') {
    if (sugars > 15) {
      recommendation = "Attention, trop sucré pour une perte de poids optimale.";
      badge = "TROP SUCRÉ";
    } else if (product.calories < 100) {
      recommendation = "Faible calorie, parfait pour caler une petite faim.";
      badge = "LIGHT";
    } else {
      recommendation = "Produit correct, à consommer avec modération.";
      badge = "MODÉRATION";
    }
  } else {
    // Maintain or Other
    if (score >= 8) {
      recommendation = "Excellent choix pour une alimentation équilibrée.";
      badge = "SANTÉ+";
    } else if (score >= 5) {
      recommendation = "Snack équilibré, s'intègre bien dans votre journée.";
      badge = "ÉQUILIBRÉ";
    } else {
      recommendation = "Consommation occasionnelle recommandée.";
      badge = "OCCASIONNEL";
    }
  }

  return { recommendation, badge, score };
};
