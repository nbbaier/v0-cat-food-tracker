# AI-Powered Preference Prediction

**Category:** New Feature
**Quarter:** Q3
**T-shirt Size:** XL

## Why This Matters

Cat owners face a frustrating guessing game: "Will my cat like this new food?" They buy cans, the cat rejects them, money and food are wasted. The app currently tracks preferences reactively—after the cat has already rejected the food. But with enough data, we can predict preferences proactively.

AI-powered prediction transforms the app from a record keeper into an advisor. Based on a cat's preference history, nutritional sensitivities, and patterns, the system can predict how likely they are to accept a new food before the owner buys it. "Based on Whiskers' history, she has a 78% chance of liking this chicken paté—she prefers poultry-based patés and dislikes fish."

This is the feature that makes the app indispensable. No other cat food app does this. It directly saves money, reduces waste, and makes cat feeding less stressful.

## Current State

- Preferences tracked manually (likes, neutral, dislikes, unknown)
- No pattern detection across preferences
- No food attribute extraction (flavor, texture, brand, ingredients)
- No similarity analysis between foods
- No prediction capabilities
- Meal data exists but not analyzed for patterns
- Health data would be valuable but doesn't exist yet (#04)

## Proposed Future State

**Food Intelligence Layer:**
- Rich food metadata: brand, flavor profile, texture (paté, shreds, chunks), protein source, ingredients
- Food similarity engine based on attributes
- Community-sourced food database (from #10)
- Automatic attribute extraction from product names/descriptions

**Preference Pattern Detection:**
- Identify patterns: "Prefers chicken over fish", "Likes paté, dislikes chunks"
- Texture preferences (some cats are texture-sensitive)
- Brand affinities
- Protein source correlations
- Time-of-day patterns (prefers wet food in morning)
- Sensitivity patterns (certain ingredients cause issues)

**Prediction Engine:**
- ML model trained on cat's preference history
- Input: food attributes of new food
- Output: Predicted preference score (0-100%) with confidence interval
- Explanation: "Similar to [foods cat liked] because of [shared attributes]"
- Factor breakdown: "+15% for chicken protein, -10% for fish oil ingredient"

**User Experience:**
- Prediction shown when adding new foods
- "Find foods like this" discovery feature
- "Foods to avoid" based on negative patterns
- Shopping assistant: scan barcode, get prediction
- "Why did you predict this?" explainability

**Learning Loop:**
- Predictions improve as user logs more preferences
- Feedback on predictions ("Was this prediction accurate?")
- Transfer learning: learn from similar cats (with privacy)

## Key Deliverables

- [ ] Design food attributes schema (brand, flavor, texture, protein_sources, ingredients)
- [ ] Build food attribute extraction from names (NLP/regex + LLM fallback)
- [ ] Create food similarity algorithm
- [ ] Implement preference pattern detection engine
- [ ] Train initial ML model (collaborative filtering + content-based hybrid)
- [ ] Build prediction API endpoint
- [ ] Create prediction display UI (score, confidence, explanation)
- [ ] Implement "Find similar foods" feature
- [ ] Add prediction when adding new food
- [ ] Build barcode scanning (camera + UPC database integration)
- [ ] Create prediction feedback loop
- [ ] Implement "Factors that matter" visualization
- [ ] Build "Foods to avoid" warning system
- [ ] Add prediction accuracy tracking
- [ ] Create cold-start strategy for new cats with few preferences

## Prerequisites

- Multi-Cat Support (#01) - Predictions must be per-cat
- Analytics Dashboard (#03) - Visualization infrastructure
- Health Outcome Tracking (#04) - Health factors improve predictions (optional but valuable)
- Sufficient preference data - More accurate with 20+ food preferences logged

## Risks & Open Questions

- **Cold start problem**: New cats have no preference data. Solutions: start with general heuristics, transfer from similar cats, require minimum data before predictions.
- **Data sparsity**: Most users won't log 100+ foods. Need algorithms that work with 20-50 data points.
- **Feature engineering**: What attributes actually matter for prediction? Needs experimentation.
- **Explainability vs. accuracy tradeoff**: Simpler models are more explainable but less accurate. Need to balance.
- **Food database**: Where does food metadata come from? Manual entry? Community sourcing? API?
- **Barcode database**: UPC database subscriptions are expensive. Alternatives: community-sourced, camera OCR for text.
- **Privacy for transfer learning**: Can we learn from aggregate patterns without exposing individual data?
- **Prediction accountability**: What if prediction is very wrong? Need appropriate expectation-setting.

## Notes

Recommended ML approach:
1. **Content-based filtering**: Recommend foods similar to liked foods based on attributes
2. **Collaborative filtering**: Find cats with similar taste, recommend what they liked (requires scale)
3. **Hybrid approach**: Combine both for best results

Starting model (before scale):
- Feature vector per food: protein type (one-hot), texture (one-hot), brand embedding, ingredient list embedding
- Per-cat model: logistic regression or small neural net on feature vectors
- Output: probability of preference > neutral

Database additions:
```sql
food_attributes (
  food_id FK,
  brand,
  flavor_profile,
  texture enum('pate', 'shreds', 'chunks', 'gravy', 'dry_kibble'),
  primary_protein,
  secondary_proteins[],
  ingredients[],
  upc_code,
  extracted_at
)

predictions (
  id,
  cat_id FK,
  food_id FK,
  predicted_preference,
  confidence,
  factors jsonb,
  actual_preference (nullable - filled when known),
  predicted_at
)
```

Files to create:
- `lib/ml/` - Machine learning utilities
- `lib/food-attributes.ts` - Attribute extraction
- `components/prediction/*` - Prediction UI
- `app/api/predict/route.ts` - Prediction endpoint
- Consider: Cloud ML endpoint for model inference (if complex model)

This is the flagship differentiating feature of the product roadmap.
