// Collection of daily prompts organized by categories
const dailyPrompts = {
  reflection: [
    "What's one thing you learned about yourself recently?",
    "If you could give your past self one piece of advice, what would it be?",
    "What moment from today are you most likely to remember in 5 years?",
    "How have your priorities changed over the last year?",
    "What's a belief you held strongly that has evolved over time?"
  ],
  gratitude: [
    "What three things are you most grateful for today?",
    "Who made a positive impact on your day and how?",
    "What's something simple that brought you joy recently?",
    "What personal strength are you thankful for?",
    "What comfort or convenience are you grateful to have?"
  ],
  creativity: [
    "If you had a completely free day with no responsibilities, how would you spend it?",
    "What's a creative idea you've been thinking about lately?",
    "Describe your ideal living space in detail.",
    "If you could master any skill instantly, what would it be and why?",
    "What would you create if you knew you couldn't fail?"
  ],
  goals: [
    "What's one small step you can take today toward a bigger goal?",
    "What does success look like to you right now?",
    "What habit would you like to develop or break?",
    "Where would you like to be in 6 months, and what needs to happen to get there?",
    "What's been holding you back from pursuing something you want?"
  ],
  mindfulness: [
    "What emotions are present for you right now, without judgment?",
    "What sensations do you notice in your body at this moment?",
    "When did you feel most present and engaged today?",
    "What thought patterns have you noticed recently?",
    "How can you be kinder to yourself today?"
  ],
  relationships: [
    "Who inspires you and why?",
    "What quality do you appreciate most in your closest relationships?",
    "How can you show appreciation to someone important in your life?",
    "What's a relationship that has shaped who you are today?",
    "How do you nurture meaningful connections in your life?"
  ],
  growth: [
    "What's a challenge you're currently facing, and what is it teaching you?",
    "What would you do differently if you were more confident?",
    "What's an area of your life where you'd like to grow?",
    "What feedback have you received that could help you improve?",
    "How do you handle setbacks or failures?"
  ]
};

// Function to get a random prompt based on user preferences
export const getRandomPrompt = (categories = ['reflection', 'gratitude', 'creativity', 'goals', 'mindfulness']) => {
  // Select a random category from user preferences
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  // Get prompts from selected category
  const categoryPrompts = dailyPrompts[randomCategory] || dailyPrompts.reflection;
  
  // Select random prompt from category
  const randomPrompt = categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
  
  return {
    prompt: randomPrompt,
    category: randomCategory,
    id: `${randomCategory}-${Date.now()}`
  };
};

// Function to get today's date in YYYY-MM-DD format
export const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

// Function to check if user has completed prompt today
export const hasCompletedPromptToday = (user) => {
  if (!user.lastPromptDate) return false;
  return user.lastPromptDate === getTodayDateString();
};

export default dailyPrompts;