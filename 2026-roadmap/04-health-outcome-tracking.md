# Health Outcome Tracking

**Category:** New Feature
**Quarter:** Q2
**T-shirt Size:** L

## Why This Matters

Food tracking in isolation has limited value. The real question cat owners care about is: "Is this food good for my cat?" Currently, preference tracking answers "Does my cat like it?" but not "Is it helping them thrive?" By connecting food data to health outcomes, we transform the app from a preference logger into a comprehensive nutrition management system.

This is especially critical for cats with health conditions. Cats with chronic kidney disease need low-phosphorus diets. Diabetic cats need low-carb, high-protein meals. Overweight cats need portion control. Without health tracking, owners can't correlate their feeding choices with health outcomes—they're flying blind.

The long-term vision is connecting food choices to veterinary outcomes: "Since switching to Brand X, Whiskers' kidney values have stabilized." This creates genuine health impact and positions the app as an essential tool, not just a nice-to-have.

## Current State

- Nutritional data exists (phosphorus, protein, fat, fiber on dry matter basis)
- No health outcome data collection
- No weight tracking
- No vet visit records
- No connection between food and health
- No health goals or targets
- No alerts for concerning patterns
- Preference is the only "outcome" measured

## Proposed Future State

A comprehensive health tracking system including:

**Health Profile (per cat):**
- Current weight with history tracking
- Health conditions (CKD, diabetes, IBD, allergies, etc.)
- Dietary restrictions and goals
- Target weight range
- Vet contact information
- Medication tracking (food-related: phosphorus binders, etc.)

**Regular Logging:**
- Weight check entries (weekly encouraged, not required)
- Stool quality tracking (TMI but critical for digestive health)
- Energy level observations
- Vomiting/digestive upset incidents
- Coat quality notes
- Hydration observations (water intake, wet vs. dry food ratio)

**Vet Integration:**
- Vet visit records with date, type, notes
- Lab value tracking (BUN, creatinine, phosphorus, glucose, etc.)
- Vaccination records
- Medication changes

**Correlation Engine:**
- Visualize health metrics alongside dietary changes
- Alert when concerning patterns emerge (weight dropping, frequent vomiting)
- Suggest potential food-health connections (not medical advice, pattern observation)
- Generate reports for vet visits

**Smart Recommendations:**
- Flag foods that may conflict with health conditions (high-phosphorus for CKD)
- Suggest foods that fit dietary requirements
- Portion recommendations based on weight goals

## Key Deliverables

- [ ] Design health tracking schema (health_conditions, weight_logs, vet_visits, health_events, lab_results)
- [ ] Create cat health profile UI (conditions, goals, restrictions)
- [ ] Build weight tracking interface with charts
- [ ] Implement health event logging (quick log for vomiting, low energy, etc.)
- [ ] Create vet visit record management
- [ ] Build lab value tracking and visualization
- [ ] Implement correlation visualizations (food timeline + health events)
- [ ] Create health alerts system
- [ ] Build nutritional compliance checker (flag foods that don't fit restrictions)
- [ ] Create vet visit preparation report generator
- [ ] Add health condition database (common feline conditions with dietary implications)
- [ ] Implement privacy controls (health data is sensitive)
- [ ] Create reminder system for regular weight checks
- [ ] Build health dashboard tab

## Prerequisites

- Multi-Cat Support (#01) - Health tracking must be per-cat
- Analytics Dashboard (#03) - Visualization infrastructure

## Risks & Open Questions

- **Medical liability**: We must be extremely clear this is not medical advice. Need disclaimers, careful UX copy, and deference to veterinary guidance.
- **Data sensitivity**: Health data is more sensitive than food preferences. Need to consider HIPAA-like protections even though not legally required for pets.
- **Complexity creep**: Health tracking could become overwhelming. Need progressive disclosure—start simple, reveal complexity as needed.
- **User compliance**: Logging health events requires diligence. How to encourage without nagging?
- **Condition database**: Building a comprehensive list of feline health conditions with dietary implications is non-trivial. Consider medical advisory input.
- **Integration with vet systems**: Long-term, could we pull data from vet clinic systems? This is Q4+ at earliest.

## Notes

Database schema additions:
```
health_conditions (id, cat_id, condition_name, diagnosed_date, notes, is_active)
weight_logs (id, cat_id, weight, measured_at, notes)
health_events (id, cat_id, event_type, severity, occurred_at, food_id?, notes)
vet_visits (id, cat_id, visit_date, visit_type, clinic_name, notes)
lab_results (id, vet_visit_id, cat_id, test_name, value, unit, reference_range, notes)
dietary_restrictions (id, cat_id, restriction_type, target_value, max_value, notes)
```

Key design principle: Low-friction logging. Health events should be loggable in 2 taps (type + optional severity). Weight should be one field. Don't require completion of optional fields.

Files to create:
- `components/health/*` - Health tracking UI components
- `app/health/page.tsx` - Health dashboard
- `app/api/health/*` - Health data endpoints
- Modify `lib/db/schema.ts` - Health-related tables

This initiative enables: AI-Powered Prediction (#08), which can factor in health outcomes
