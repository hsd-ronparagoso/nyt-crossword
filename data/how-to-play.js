/* ============================================================
   UnscrambleX — How to Play + Hints content
   Single source of truth for both the "How to Play" modals and
   the live in-game hint panels, so the two never drift apart.
   Each game's `hints` array lists id/icon/label/desc/cost only —
   the actual reveal logic (`apply`) is wired per-game in games.js
   because it needs live access to that round's word/state.
   ============================================================ */

window.HOW_TO_PLAY = {

  "daily": {
    title: "Daily Word", icon: "ph-calendar-check", difficulty: "Varies daily",
    tagline: "One shared puzzle, six tries, a new word at midnight.",
    goal: "Guess the hidden 5-letter word before you run out of attempts.",
    steps: [
      "Type a 5-letter word and submit it.",
      "Each tile flips to a color that tells you how close you were.",
      "Use those colors to narrow down your next guess.",
      "Solve it within 6 tries to win.",
    ],
    example: "wordle",
    scoring: [
      "Solving the word: +100 XP base reward.",
      "Bonus XP for every try you have left when you win.",
      "Using a hint reduces your final reward, but never below 0.",
    ],
    tips: [
      "Open with a word that has a lot of common letters and 2+ vowels — like CRANE or STARE.",
      "A gray letter is only gray for that guess — it just means try a different letter next time.",
      "Don't repeat a gray letter, but do reuse yellow letters in a new position.",
    ],
    tutorial: [
      { title: "Guess a word", body: "Type any real 5-letter word and press Enter to submit your first guess." },
      { title: "Watch the tiles change color", body: "Green means correct spot, yellow means wrong spot, gray means not in the word." },
      { title: "Use the clues", body: "Build your next guess around what you just learned." },
      { title: "Solve it before you run out", body: "You get 6 tries total — the board tracks how many are left." },
      { title: "Earn your score and streak", body: "Winning banks XP and keeps your daily streak alive." },
    ],
    hints: [
      { id: "vowels", icon: "ph-drop", label: "Vowel Check", desc: "Reveal how many vowels are in the word.", cost: 10, unit: "xp" },
      { id: "letter", icon: "ph-text-aa", label: "Reveal a Letter", desc: "Reveal one correct letter and its position.", cost: 20, unit: "xp" },
      { id: "category", icon: "ph-shapes", label: "Category Clue", desc: "Get a semantic clue about the word.", cost: 30, unit: "xp" },
      { id: "first", icon: "ph-flag", label: "First Letter", desc: "Reveal the word's first letter.", cost: 40, unit: "xp" },
    ],
  },

  "six-tries": {
    title: "Six Tries", icon: "ph-arrows-clockwise", difficulty: "Medium",
    tagline: "The classic format, unlimited practice — a fresh word every round.",
    goal: "Guess the hidden 5-letter word within six attempts.",
    steps: [
      "Type a 5-letter word and submit it.",
      "Green = correct letter, correct spot. Yellow = correct letter, wrong spot. Gray = not in the word.",
      "Refine your guess using those clues.",
      "Win within 6 tries — then play again with a brand-new word.",
    ],
    example: "wordle",
    scoring: [
      "Solving the word: +40 XP base reward.",
      "Bonus XP for every try you have left when you win.",
      "Hints reduce your final reward for that round.",
    ],
    tips: [
      "This is unlimited practice — there's no downside to experimenting with your opener.",
      "Try a completely different set of letters on guess two to test more of the alphabet.",
    ],
    tutorial: [
      { title: "Guess a word", body: "Type any real 5-letter word and press Enter." },
      { title: "Watch the tiles change color", body: "Green, yellow and gray tell you exactly what to do next." },
      { title: "Use the clues to improve", body: "Each guess should use everything you've learned so far." },
      { title: "Solve it before you run out", body: "You have 6 tries — then a brand-new word is waiting." },
    ],
    hints: [
      { id: "vowels", icon: "ph-drop", label: "Vowel Check", desc: "Reveal how many vowels are in the word.", cost: 10, unit: "xp" },
      { id: "letter", icon: "ph-text-aa", label: "Reveal a Letter", desc: "Reveal one correct letter and its position.", cost: 20, unit: "xp" },
      { id: "category", icon: "ph-shapes", label: "Category Clue", desc: "Get a semantic clue about the word.", cost: 30, unit: "xp" },
      { id: "first", icon: "ph-flag", label: "First Letter", desc: "Reveal the word's first letter.", cost: 40, unit: "xp" },
    ],
  },

  "word-scramble": {
    title: "Word Scramble", icon: "ph-shuffle", difficulty: "Easy",
    tagline: "Rearrange jumbled letters back into the correct word.",
    goal: "Unscramble the letters into a real word across 5 relaxed rounds.",
    steps: [
      "Look at the scrambled letters — they're all real letters from the answer.",
      "Tap letters in order to build your answer in the slots above.",
      "Fill every slot to check it automatically.",
      "A wrong guess just resets the slots — tap Shuffle for a fresh look.",
    ],
    example: "scramble",
    scoring: [
      "Each correctly unscrambled word: +20 XP.",
      "Finish all 5 rounds to complete the game.",
      "Hints reduce the XP for that particular word.",
    ],
    tips: [
      "Look for common endings first, like -ING, -ER or -ED.",
      "Isolate any vowels — most words alternate consonants and vowels.",
    ],
    tutorial: [
      { title: "Look at the scrambled letters", body: "Every tile belongs somewhere in the final word." },
      { title: "Tap letters to build your answer", body: "Tap a letter tile to move it into the next open slot." },
      { title: "Fill every slot", body: "Once all slots are full, we check it for you automatically." },
      { title: "Earn points and move on", body: "A correct word banks XP and starts the next round." },
    ],
    hints: [
      { id: "first", icon: "ph-flag", label: "First Letter", desc: "Reveal the word's first letter.", cost: 10, unit: "xp" },
      { id: "length", icon: "ph-ruler", label: "Word Length", desc: "Confirm how many letters are in the word.", cost: 5, unit: "xp" },
      { id: "definition", icon: "ph-book-open", label: "Definition", desc: "Show the meaning of the word.", cost: 20, unit: "xp" },
      { id: "placement", icon: "ph-cursor-click", label: "Letter Placement", desc: "Reveal the correct letter for your next empty slot.", cost: 25, unit: "xp" },
    ],
  },

  "blitz": {
    title: "Blitz", icon: "ph-timer", difficulty: "Hard",
    tagline: "Unscramble as many words as you can before the clock runs out.",
    goal: "Solve as many scrambled words as possible in 60 seconds.",
    steps: [
      "A scrambled word appears with the clock already running.",
      "Tap letters to build your answer — solving one instantly loads the next.",
      "Keep going until the 60-second timer hits zero.",
      "Your final score is how many words you solved.",
    ],
    example: "timer",
    scoring: [
      "Each correct word: +15 XP.",
      "There's no penalty for a wrong guess — the slots just reset.",
      "Hints cost you precious seconds instead of XP, since every second counts here.",
    ],
    tips: [
      "Don't overthink short words — quick pattern recognition beats careful analysis.",
      "If you're stuck, skip the definition hint and just try letter combinations.",
    ],
    tutorial: [
      { title: "A word challenge appears", body: "The 60-second timer starts the moment you begin." },
      { title: "Build your answer", body: "Tap the scrambled letters into the slots as fast as you can." },
      { title: "Get the next word instantly", body: "Solve one and the next scrambled word loads immediately." },
      { title: "Beat the clock", body: "Keep solving until time runs out — every word counts." },
    ],
    hints: [
      { id: "first", icon: "ph-flag", label: "First Letter", desc: "Reveal the word's first letter.", cost: 5, unit: "sec" },
      { id: "definition", icon: "ph-book-open", label: "Definition", desc: "Show the meaning of the word.", cost: 8, unit: "sec" },
    ],
  },

  "speed-word": {
    title: "Speed Word", icon: "ph-lightning", difficulty: "Expert",
    tagline: "Solve before the countdown hits zero — three lives, then it's over.",
    goal: "Unscramble each word before its individual 12-second timer expires.",
    steps: [
      "A scrambled word appears with a 12-second bar above it.",
      "Build your answer by tapping the letters into place.",
      "Solve it in time to move to the next word.",
      "Run out of time on a word and you lose one of your three lives.",
    ],
    example: "timer",
    scoring: [
      "Each correct word: +20 XP.",
      "Lose all 3 lives and the round ends — your score is words solved.",
    ],
    tips: [
      "Glance at the word length first to gauge how much time you'll need.",
      "The Time Bonus hint is worth it early — a few extra seconds can save a life.",
    ],
    tutorial: [
      { title: "A word appears", body: "You have a limited amount of time — watch the bar." },
      { title: "Type the answer", body: "Tap letters into the slots to build your guess." },
      { title: "Beat the clock", body: "The faster you solve it, the higher your score." },
      { title: "Watch your lives", body: "Running out of time costs a life — you only get three." },
    ],
    hints: [
      { id: "first", icon: "ph-flag", label: "First Letter", desc: "Reveal the word's first letter.", cost: 8, unit: "xp" },
      { id: "time", icon: "ph-clock-clockwise", label: "Time Bonus", desc: "Add 5 seconds to this word's clock.", cost: 12, unit: "xp" },
      { id: "next", icon: "ph-cursor-click", label: "Highlight Next Letter", desc: "Spotlight the correct next letter to tap.", cost: 15, unit: "xp" },
      { id: "definition", icon: "ph-book-open", label: "Definition", desc: "Show the meaning of the word.", cost: 10, unit: "xp" },
    ],
  },

  "letter-rush": {
    title: "Letter Rush", icon: "ph-brain", difficulty: "Hard",
    tagline: "One pool of letters, ninety seconds — find every word hiding inside it.",
    goal: "Build as many valid words as you can from one shared letter pool.",
    steps: [
      "You're given a pool of 8-9 letters.",
      "Tap letters in order to spell a word of 3 or more letters.",
      "Submit it — valid words are added to your found list.",
      "Keep building new words until the 90-second timer ends.",
    ],
    example: "timer",
    scoring: [
      "3-letter word: 50 XP · 4-letter: 100 XP · 5-letter: 200 XP · 6+ letters: 300+ XP.",
      "Longer words are always worth more — hunt for the big ones.",
    ],
    tips: [
      "Start with short, easy words to build a base score, then hunt for longer ones.",
      "Common endings like -ER, -ING or -EST often unlock a longer word.",
    ],
    tutorial: [
      { title: "Look at your letter pool", body: "Every word you build must use only these letters." },
      { title: "Build a word", body: "Tap letters in order — 3 letters minimum." },
      { title: "Submit it", body: "A valid word joins your found list and scores points." },
      { title: "Keep hunting", body: "Longer words score much more — find them before time runs out." },
    ],
    hints: [
      { id: "example", icon: "ph-lightbulb", label: "Valid Word", desc: "Reveal an example word you can still make.", cost: 15, unit: "xp" },
      { id: "start", icon: "ph-flag", label: "First Letter", desc: "Highlight a useful letter to start with.", cost: 8, unit: "xp" },
      { id: "length", icon: "ph-ruler", label: "Word Length", desc: "Suggest the length of an available word.", cost: 10, unit: "xp" },
    ],
  },

  "guess-word": {
    title: "Guess the Word", icon: "ph-magnifying-glass", difficulty: "Medium",
    tagline: "Clues unlock one at a time. The fewer you need, the bigger the reward.",
    goal: "Identify the hidden word using as few clues as possible.",
    steps: [
      "You start with one free clue.",
      "Type your guess into the box and submit it.",
      "Guessed wrong? Reveal another clue to narrow it down.",
      "Solve it with fewer clues for a bigger reward.",
    ],
    example: "clues",
    scoring: [
      "You start with a potential reward of 100 XP.",
      "Each extra clue you reveal lowers that reward by 20 XP (minimum 20).",
    ],
    tips: [
      "Don't reveal a clue you don't need — guess as soon as you have a strong idea.",
      "The category clue is often the biggest shortcut.",
    ],
    tutorial: [
      { title: "Read your first clue", body: "You always start with one clue for free." },
      { title: "Make a guess", body: "Type what you think the word is and submit." },
      { title: "Reveal more clues if needed", body: "Each one narrows things down, but lowers your reward." },
      { title: "Solve it", body: "Fewer clues used means a bigger XP reward." },
    ],
    hints: [
      { id: "category", icon: "ph-shapes", label: "Category", desc: "Reveal a semantic clue about the word.", cost: 20, unit: "xp" },
      { id: "first", icon: "ph-flag", label: "First Letter", desc: "Reveal the word's first letter.", cost: 20, unit: "xp" },
      { id: "example", icon: "ph-quotes", label: "Example Sentence", desc: "See the word used in a sentence.", cost: 20, unit: "xp" },
      { id: "definition", icon: "ph-book-open", label: "Definition", desc: "Reveal the full definition.", cost: 20, unit: "xp" },
    ],
  },

  "mini-crossword": {
    title: "Mini Crossword", icon: "ph-grid-nine", difficulty: "Easy",
    tagline: "Five quick clues, one satisfying little grid.",
    goal: "Fill in every answer correctly to complete the mini crossword.",
    steps: [
      "Select a clue from the list.",
      "Read it, then type your answer into its boxes.",
      "Correct answers lock in and turn green.",
      "Finish all 5 clues to complete the puzzle.",
    ],
    example: "crossword",
    scoring: [
      "Each clue you type correctly yourself: +15 XP.",
      "Revealing an answer instead of solving it earns no XP for that clue.",
    ],
    tips: [
      "Shorter answers (4 letters) are usually the quickest win — start there.",
      "Use the Check Letter hint before Reveal Letter if you just want confirmation.",
    ],
    tutorial: [
      { title: "Select a clue", body: "Tap into any answer's boxes to start typing." },
      { title: "Read the clue", body: "Each clue describes exactly one short answer." },
      { title: "Enter your answer", body: "Letters lock in and turn green once correct." },
      { title: "Complete the grid", body: "Solve all 5 to finish the mini crossword." },
    ],
    hints: [
      { id: "reveal-letter", icon: "ph-text-aa", label: "Reveal Letter", desc: "Reveal one letter in the selected clue.", cost: 10, unit: "xp" },
      { id: "check-letter", icon: "ph-check-square", label: "Check Letter", desc: "Find out if your current letters are correct.", cost: 5, unit: "xp" },
      { id: "easy-clue", icon: "ph-lightbulb", label: "Easier Clue", desc: "Get a simpler rephrasing of the clue.", cost: 8, unit: "xp" },
      { id: "reveal-word", icon: "ph-eye", label: "Reveal Word", desc: "Reveal the entire answer for this clue.", cost: 15, unit: "xp" },
    ],
  },
};

/* Display order for the global "How to Play" hub. */
window.HOW_TO_PLAY_ORDER = [
  "daily", "six-tries", "mini-crossword", "guess-word",
  "blitz", "speed-word", "word-scramble", "letter-rush",
];
