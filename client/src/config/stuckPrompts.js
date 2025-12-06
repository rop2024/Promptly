/**
 * Stuck Prompts Configuration
 * 
 * These are sentence starters that appear when users pause while writing.
 * They help overcome writer's block by suggesting ways to continue their thought.
 * 
 * Format: Lowercase, no ellipses, complete phrase
 * Usage: Display as-is in the UI
 */

export const PROMPT_POOL = [
  "this is important because",
  "that interesting because",
  "that resonates because",
  "that reminds me of",
  "this stands out because",
  "this connects to",
  "a key takeaway here is",
  "this could lead to",
  "what this reveals is",
  "this aligns with",
  "the significance of this is",
  "this challenges the idea that",
  "a pattern i notice is",
  "this raises the question of"
];

/**
 * Get a random prompt from the pool
 * @returns {string} A random stuck prompt
 */
export const getRandomPrompt = () => {
  const randomIndex = Math.floor(Math.random() * PROMPT_POOL.length);
  return PROMPT_POOL[randomIndex];
};

/**
 * Get multiple random prompts (non-repeating)
 * @param {number} count - Number of prompts to return
 * @returns {string[]} Array of random prompts
 */
export const getRandomPrompts = (count = 3) => {
  const shuffled = [...PROMPT_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, PROMPT_POOL.length));
};
