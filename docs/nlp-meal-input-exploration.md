# NLP-Based Meal Input: Exploration Document

> **Status**: Exploration / RFC
> **Date**: February 4, 2026
> **Author**: Claude

## Overview

This document explores a radical redesign of the cat food tracker's meal logging experience. Instead of the current form-based approach, we propose a natural language input where users can simply type what they fed their cat and have the system extract structured data.

## Current State

### Existing Meal Logging Flow

The current implementation requires users to fill out a structured form:

1. **Date** - Auto-populated to today
2. **Meal Time** - Radio selection: Morning or Evening (auto-selected based on time of day)
3. **Food** - Searchable combobox from existing foods database
4. **Amount** - Text input with strict validation (e.g., "1 can", "50g", "1/2 cup")
5. **Notes** - Optional free-text field

### Pain Points

- Multiple fields create friction for a simple daily task
- Amount validation is strict (must match regex pattern)
- Requires precise food selection from dropdown
- Form feels heavy for what should be a quick log

## Proposed Solution

### The Vision

Replace the form with a single text input:

```
┌─────────────────────────────────────────────────────┐
│ What did you feed your cat?                         │
│                                                     │
│ "half a can of fancy feast this morning, she loved it" │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Data Extraction

From natural language input, the system would extract:

| Field | Example Input | Extracted Value |
|-------|---------------|-----------------|
| **Food** | "fancy feast" | Match to "Fancy Feast Chicken Pate" |
| **Amount** | "half a can" | "1/2 can" (normalized) |
| **Meal Time** | "this morning" | "morning" |
| **Date** | (implicit) | Today's date |
| **Notes** | "she loved it" | Stored as note |
| **Preference Hint** | "loved it" | Suggests updating to "likes" |

## Architecture Options

### Option 1: Client-Side Pattern Matching

Use regex patterns and fuzzy matching entirely on the client.

```typescript
interface ParsedMeal {
  food: { text: string; matches: Food[]; confidence: number };
  amount: { raw: string; normalized: string; confidence: number };
  mealTime: { value: "morning" | "evening"; confidence: number };
  date: { value: string; confidence: number };
  notes: { text: string | null };
  sentiment: { preference: Preference | null; confidence: number };
}
```

**Pros:**
- Instant feedback (no network latency)
- No API costs
- Works offline
- Predictable behavior

**Cons:**
- Limited understanding of variations
- Brittle to unusual phrasing
- Requires extensive pattern definitions
- Can't handle truly ambiguous cases

### Option 2: LLM-Based Parsing

Send input to a language model for extraction.

```typescript
// Example API route
const response = await llm.complete({
  prompt: `Extract meal data from: "${userInput}"
Known foods: ${foods.map(f => f.name).join(", ")}
Return JSON: { food, amount, mealTime, date, notes, sentiment }`,
});
```

**Pros:**
- Handles natural variations gracefully
- Understands context and intent
- Can suggest new food creation
- Adapts to user's writing style

**Cons:**
- API latency (200-2000ms)
- Ongoing costs
- Requires error handling for API failures
- Less predictable outputs

### Option 3: Hybrid Approach (Recommended)

Combine both approaches:

1. **Fast path**: Client-side parsing for clear, common patterns
2. **Fallback**: LLM parsing for ambiguous inputs
3. **Confirmation**: Always show parsed result for user verification

**Implementation:**
```typescript
async function parseMealInput(input: string, foods: Food[]): Promise<ParsedMeal> {
  // Try client-side first
  const clientResult = parseWithPatterns(input, foods);

  if (clientResult.confidence > 0.8) {
    return clientResult;
  }

  // Fall back to LLM for ambiguous cases
  return await parseWithLLM(input, foods);
}
```

## Parsing Challenges & Solutions

### 1. Food Name Matching

**Challenge**: User types "fancy feast" but database has "Fancy Feast Chicken Pate"

**Solutions:**
- Fuzzy matching (Levenshtein distance)
- Token-based matching (all words must appear)
- Alias support (store common abbreviations)
- Return multiple matches with confidence scores

```typescript
function matchFood(query: string, foods: Food[]): FoodMatch[] {
  return foods
    .map(food => ({
      food,
      score: fuzzyScore(query, food.name),
    }))
    .filter(m => m.score > 0.5)
    .sort((a, b) => b.score - a.score);
}
```

### 2. Amount Normalization

**Challenge**: "half a can" → "1/2 can", "a couple spoonfuls" → "2 tbsp"

**Pattern Library:**
```typescript
const AMOUNT_PATTERNS = [
  { match: /\bhalf\s+(a\s+)?(\w+)\b/i, normalize: "1/2 $2" },
  { match: /\ba\s+(can|cup|pouch)\b/i, normalize: "1 $1" },
  { match: /\b(\d+)\s+(cans?|cups?|g|ml|oz)\b/i, normalize: "$1 $2" },
  { match: /\bcouple\s+(of\s+)?(\w+)\b/i, normalize: "2 $2" },
];
```

**Special case**: "the usual" → look up last amount for that food

### 3. Time Inference

**Keywords to patterns:**
```typescript
const TIME_PATTERNS = {
  morning: /\b(morning|breakfast|am|this am|earlier)\b/i,
  evening: /\b(evening|dinner|tonight|pm|this pm|supper|night)\b/i,
};
```

**Fallback**: Use current time (before 2pm = morning, after = evening)

### 4. Date Handling

**Relative dates:**
- "yesterday" → subtract 1 day
- "this morning" → today
- "last night" → yesterday if currently morning, today if currently night
- No mention → default to today

### 5. Sentiment / Preference Hints

**Positive signals** → suggests "likes":
- "loved", "gobbled", "devoured", "favorite", "couldn't get enough"

**Negative signals** → suggests "dislikes":
- "hated", "refused", "wouldn't touch", "ignored", "left most of it"

**Neutral signals** → suggests "neutral":
- "ate", "finished", "had", "seemed fine"

## Proposed UI Flow

### Step 1: Input

```
┌─────────────────────────────────────────────────────────┐
│  🐱 What did you feed your cat?                         │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ half can fancy feast this morning she loved it    │  │
│  └───────────────────────────────────────────────────┘  │
│                                        [Log Meal →]     │
└─────────────────────────────────────────────────────────┘
```

### Step 2: Confirmation (with ability to edit)

```
┌─────────────────────────────────────────────────────────┐
│  ✓ Got it!                                              │
│                                                         │
│  📅 Today (Feb 4)           🌅 Morning                  │
│  🍽️ Fancy Feast Chicken     📏 1/2 can                  │
│  📝 "she loved it"          💚 Liked it!                │
│                                                         │
│  [Edit Details]                     [Confirm & Log]     │
└─────────────────────────────────────────────────────────┘
```

### Step 3: Success

```
┌─────────────────────────────────────────────────────────┐
│  ✅ Logged! Fancy Feast (1/2 can) this morning          │
│                                                         │
│  [Log another meal]                                     │
└─────────────────────────────────────────────────────────┘
```

### Edge Cases UI

**Multiple food matches:**
```
┌─────────────────────────────────────────────────────────┐
│  Which "Fancy Feast" did you mean?                      │
│                                                         │
│  ○ Fancy Feast Chicken Pate                             │
│  ○ Fancy Feast Turkey & Giblets                         │
│  ○ Fancy Feast Seafood Medley                           │
│  ○ + Add new food "fancy feast"                         │
└─────────────────────────────────────────────────────────┘
```

**Unknown food:**
```
┌─────────────────────────────────────────────────────────┐
│  I don't recognize "blue buffalo salmon"                │
│                                                         │
│  [Add as new food]    [Try different name]              │
└─────────────────────────────────────────────────────────┘
```

## Proposed File Structure

```
lib/
  nlp/
    index.ts              # Main exports
    meal-parser.ts        # Core parsing orchestration
    patterns.ts           # Regex patterns for extraction
    fuzzy-match.ts        # Food name matching algorithms
    amount-normalizer.ts  # Amount parsing and normalization
    time-extractor.ts     # Date/time extraction
    sentiment.ts          # Preference hint extraction
    types.ts              # TypeScript types for parsed data

components/
  home/
    nlp-meal-input.tsx    # Main text input component
    parsed-meal-card.tsx  # Confirmation/edit display
    food-disambiguator.tsx # Multiple match selector

app/
  api/
    parse-meal/
      route.ts            # LLM parsing endpoint (if using hybrid)
```

## Implementation Phases

### Phase 1: Client-Side Parser (MVP)

- Build pattern-based parser for common cases
- Implement fuzzy food matching
- Create confirmation UI
- Handle 80% of typical inputs

**Deliverables:**
- `lib/nlp/` module with pattern matching
- New input component replacing form
- Basic confirmation flow

### Phase 2: Enhanced Matching

- Improve fuzzy matching algorithm
- Add food aliases/abbreviations support
- Better amount normalization
- Date/time relative parsing

**Deliverables:**
- Alias field on foods table
- Enhanced pattern library
- "The usual" support (remember last amount)

### Phase 3: LLM Integration (Optional)

- Add LLM fallback for low-confidence parses
- Evaluate cost/benefit of always using LLM
- Consider on-device models for privacy

**Deliverables:**
- `/api/parse-meal` endpoint
- LLM provider integration
- Confidence-based routing

## Open Questions

1. **Confirmation friction**: Should we require confirmation, or auto-submit high-confidence parses?

2. **New food creation**: Inline during logging, or redirect to food creation flow?

3. **Learning from corrections**: Should we track when users edit parsed results to improve patterns?

4. **Voice input**: Natural extension - add microphone button for voice-to-text?

5. **Batch logging**: Support "fed her breakfast and dinner" as two entries?

## Success Metrics

- **Time to log**: Reduce from ~15 seconds (form) to ~5 seconds (NLP)
- **Parse accuracy**: >90% correct on first try
- **User corrections**: <10% of logs require manual editing
- **Adoption**: Users prefer NLP input over form fallback

## Appendix: Example Inputs

| User Input | Extracted Data |
|------------|----------------|
| "half can fancy feast this morning" | FF Chicken, 1/2 can, morning, today |
| "gave her some tuna for dinner" | Tuna, (ask amount), evening, today |
| "1 pouch wellness yesterday she loved it" | Wellness, 1 pouch, (ask time), yesterday, likes |
| "the usual this morning" | (last food), (last amount), morning, today |
| "2 cans friskies, wouldn't eat it" | Friskies, 2 cans, (current time), today, dislikes |
| "breakfast" | (ask food), (ask amount), morning, today |

## Appendix: LLM Provider Options

Research into free and low-cost LLM options for the parsing task (February 2026).

### Recommended: Groq (Free Tier)

**Why it's ideal for this use case:**
- Ultra-fast inference (~200ms) due to custom LPU hardware
- OpenAI-compatible API (easy integration)
- Generous free tier with no credit card required
- Supports small, efficient models perfect for extraction

**Free tier limits:**
- Rate limits apply at organization level
- Developer tier offers 10x higher limits with 25% cost discount
- Batch processing available at 50% lower cost

**Models to consider:**
- Llama 3.3 70B (excellent for structured extraction)
- Mixtral 8x7B (fast, good at following instructions)

**Integration:**
```typescript
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const response = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [{ role: "user", content: prompt }],
  response_format: { type: "json_object" },
});
```

### Alternative: Cloudflare Workers AI

**Pros:**
- 10,000 free Neurons/day (resets at UTC midnight)
- Runs on edge (low latency, 200+ cities)
- 50+ models available
- Already using Vercel, but CF Workers could be a serverless function

**Pricing:**
- Free: 10,000 Neurons/day
- Paid: $0.011 per 1,000 Neurons

**Best for:** If you want to avoid external API dependencies and run models at the edge.

### Alternative: OpenRouter

**Pros:**
- Access to 300+ models through single API
- Dedicated free model collection
- No markup on provider pricing
- `openrouter/free` auto-routes to available free models

**Free tier limits:**
- 50 requests/day (without credits)
- 1,000 requests/day (with $10+ credits purchased)
- 20 requests/minute

**Free models available (Feb 2026):**
- Meta Llama 3.3 70B
- Qwen3-Coder-480B-A35B (for complex extraction)
- Various community fine-tunes

### Alternative: Ollama (Local/Self-Hosted)

**Pros:**
- Completely free (runs on your hardware)
- No API costs ever
- Privacy-preserving (data never leaves device)
- Native structured output support with JSON schema

**Best models for extraction:**
- Qwen2.5-7B Instruct (excellent for structured tasks)
- Gemma 3n (2-5B, designed for on-device)
- Phi-4 (14B, punches above weight class)

**Structured output example:**
```typescript
const response = await ollama.chat({
  model: "qwen2.5:7b",
  messages: [{ role: "user", content: prompt }],
  format: mealSchema, // JSON schema
  options: { temperature: 0 },
});
```

**Cons:**
- Requires server with GPU or decent CPU
- Not suitable for serverless deployment
- User would need to self-host

### Alternative: Vercel AI SDK + AI Gateway

**Pros:**
- Native integration with Next.js
- $5 free credits every 30 days
- Access to 100+ models from all providers
- Single API, switch providers with one line change

**Integration:**
```typescript
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

const { object } = await generateObject({
  model: openai("gpt-4o-mini"),
  schema: mealSchema,
  prompt: userInput,
});
```

**Best for:** Staying within Vercel ecosystem, easy provider switching.

### Small Language Models for Extraction

Research shows small models (3-7B parameters) can achieve 86-96% accuracy on structured extraction tasks when fine-tuned or properly prompted:

| Model | Parameters | Accuracy | Speed |
|-------|------------|----------|-------|
| Qwen2.5-7B | 7B | ~90% | Fast |
| Gemma 3n | 2-5B | ~85% | Very fast |
| Phi-4 | 14B | ~92% | Medium |
| SmolLM3 | 3B | ~82% | Very fast |

### Cost Comparison (1,000 meal parses/month)

| Provider | Model | Est. Cost |
|----------|-------|-----------|
| Groq (free) | Llama 3.3 70B | $0 |
| Cloudflare (free) | Workers AI | $0 |
| OpenRouter (free) | Free models | $0 |
| Ollama (self-host) | Qwen2.5-7B | $0 (+ hosting) |
| Vercel AI Gateway | GPT-4o-mini | ~$0.50 |
| OpenAI direct | GPT-4o-mini | ~$0.60 |

### Recommendation

For this cat food tracker use case, **Groq's free tier** is the best starting point:

1. **Speed**: LPU inference is fast enough for real-time UX
2. **Cost**: Free tier is generous for personal use
3. **Quality**: Llama 3.3 70B handles extraction well
4. **Integration**: OpenAI-compatible API, works with Vercel AI SDK

**Fallback strategy:**
1. Primary: Groq free tier
2. Backup: OpenRouter free models (if Groq is down)
3. Future: Consider Ollama for privacy-conscious users

### References

- [Groq Pricing](https://groq.com/pricing)
- [Cloudflare Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [OpenRouter Free Models](https://openrouter.ai/collections/free-models)
- [Ollama Structured Outputs](https://docs.ollama.com/capabilities/structured-outputs)
- [Vercel AI SDK](https://ai-sdk.dev/)
- [Free LLM API Resources (GitHub)](https://github.com/cheahjs/free-llm-api-resources)

---

## References

- Current meal schema: `lib/db/schema.ts`
- Current validation: `lib/validations.ts`
- Current form: `components/home/home-page-client.tsx`
- Meal API: `app/api/meals/route.ts`
