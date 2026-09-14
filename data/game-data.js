/* ============================================================
   UnscrambleX — game data
   Curated word banks, achievement defs, and real computed stats.
   The full 5-letter valid-guess dictionary (data/valid-words.json,
   14,855 words sourced from the open Wordle word list) is lazy
   loaded on first game open — see js/words.js.
   ============================================================ */

/* Daily / practice answer bank — common, recognizable 5-letter
   words with a short definition and a difficulty rating.
   The word "of the day" is picked deterministically from this
   list using the day-of-year, so every visitor sees the same
   puzzle on a given date (like the real thing) without a backend. */
window.ANSWER_WORDS = [
  { word: "STARE", def: "To look fixedly at something for a long time.", diff: "Medium" },
  { word: "CRANE", def: "A tall lifting machine — or a long-necked wading bird.", diff: "Easy" },
  { word: "PLANT", def: "A living thing that grows roots, stems and leaves.", diff: "Easy" },
  { word: "BRAVE", def: "Showing courage in the face of danger.", diff: "Easy" },
  { word: "GHOST", def: "The spirit of someone who has died.", diff: "Easy" },
  { word: "LEMON", def: "A sour yellow citrus fruit.", diff: "Easy" },
  { word: "MANGO", def: "A sweet, juicy tropical fruit.", diff: "Easy" },
  { word: "RIVER", def: "A large natural stream of flowing water.", diff: "Easy" },
  { word: "STORM", def: "Violent weather with high winds and rain.", diff: "Easy" },
  { word: "TIGER", def: "A large striped wild cat.", diff: "Easy" },
  { word: "WATCH", def: "To look at attentively — or a small timepiece.", diff: "Easy" },
  { word: "QUIET", def: "Making very little noise.", diff: "Medium" },
  { word: "FRUIT", def: "The sweet, fleshy part of a plant eaten as food.", diff: "Easy" },
  { word: "HOUSE", def: "A building made for people to live in.", diff: "Easy" },
  { word: "MUSIC", def: "Sounds arranged in a pleasing sequence.", diff: "Easy" },
  { word: "LIGHT", def: "The natural energy that makes things visible.", diff: "Easy" },
  { word: "NIGHT", def: "The dark hours between sunset and sunrise.", diff: "Easy" },
  { word: "OCEAN", def: "A vast body of salt water covering the globe.", diff: "Easy" },
  { word: "PIZZA", def: "A baked dish of dough, sauce and cheese.", diff: "Easy" },
  { word: "QUEEN", def: "A female monarch, or a powerful chess piece.", diff: "Easy" },
  { word: "ROBOT", def: "A machine that carries out tasks automatically.", diff: "Easy" },
  { word: "SUGAR", def: "A sweet, crystalline substance used in cooking.", diff: "Easy" },
  { word: "TRAIN", def: "A line of connected railway cars.", diff: "Easy" },
  { word: "UNCLE", def: "The brother of one of your parents.", diff: "Easy" },
  { word: "WORLD", def: "The earth, together with everyone on it.", diff: "Easy" },
  { word: "YOUTH", def: "The period of life when someone is young.", diff: "Medium" },
  { word: "ZEBRA", def: "A striped African animal related to the horse.", diff: "Easy" },
  { word: "ANGLE", def: "The space between two lines that meet at a point.", diff: "Medium" },
  { word: "BEACH", def: "A sandy or pebbly shore beside the sea.", diff: "Easy" },
  { word: "CANDY", def: "A sweet confection meant to be enjoyed slowly.", diff: "Easy" },
  { word: "DANCE", def: "To move rhythmically, usually to music.", diff: "Easy" },
  { word: "EAGLE", def: "A large, powerful bird of prey.", diff: "Easy" },
  { word: "FLAME", def: "The glowing, visible part of a fire.", diff: "Medium" },
  { word: "GRAPE", def: "A small round fruit that grows in clusters.", diff: "Easy" },
  { word: "HONEY", def: "A sweet substance made by bees.", diff: "Easy" },
  { word: "IVORY", def: "The hard, creamy-white material of a tusk.", diff: "Medium" },
  { word: "JOKER", def: "A playing card — or someone who loves a prank.", diff: "Medium" },
  { word: "KNIFE", def: "A tool with a sharp blade used for cutting.", diff: "Easy" },
  { word: "MAGIC", def: "The power of seemingly impossible events.", diff: "Easy" },
  { word: "NURSE", def: "Someone trained to care for the sick.", diff: "Easy" },
  { word: "OASIS", def: "A fertile, green spot in the middle of a desert.", diff: "Medium" },
  { word: "PEARL", def: "A hard, lustrous sphere formed inside an oyster.", diff: "Medium" },
  { word: "ROBIN", def: "A small songbird with a red-orange breast.", diff: "Easy" },
  { word: "SNAKE", def: "A long, limbless reptile.", diff: "Easy" },
  { word: "TOAST", def: "Bread that's been browned by heat.", diff: "Easy" },
  { word: "VAPOR", def: "A substance suspended in the air as a fine mist.", diff: "Medium" },
  { word: "WHALE", def: "A massive marine mammal.", diff: "Easy" },
  { word: "YIELD", def: "To give way — or the amount something produces.", diff: "Medium" },
  { word: "ZESTY", def: "Full of bright, lively flavor.", diff: "Medium" },
  { word: "ARROW", def: "A pointed projectile shot from a bow.", diff: "Easy" },
  { word: "BLAZE", def: "An intense, fiercely burning fire.", diff: "Medium" },
  { word: "CROWN", def: "An ornamental headpiece worn by royalty.", diff: "Easy" },
  { word: "DRAFT", def: "A preliminary version — or a current of air.", diff: "Medium" },
  { word: "EMBER", def: "A small glowing piece of coal or wood.", diff: "Medium" },
  { word: "FROST", def: "A thin layer of ice crystals on a cold surface.", diff: "Easy" },
  { word: "GLARE", def: "An intense, dazzling light.", diff: "Medium" },
  { word: "HEART", def: "The muscular organ that pumps blood.", diff: "Easy" },
  { word: "IGLOO", def: "A dome-shaped shelter built from blocks of snow.", diff: "Easy" },
  { word: "JOLLY", def: "Full of good humor and high spirits.", diff: "Medium" },
  { word: "LODGE", def: "A small house, often used as a getaway.", diff: "Medium" },
  { word: "MOUSE", def: "A small rodent — or the device beside your keyboard.", diff: "Easy" },
  { word: "NOBLE", def: "Having very fine personal qualities.", diff: "Medium" },
  { word: "OLIVE", def: "A small oval fruit pressed for its oil.", diff: "Easy" },
  { word: "PIANO", def: "A large keyboard instrument with strings inside.", diff: "Easy" },
  { word: "RADAR", def: "A system that detects distant objects with radio waves.", diff: "Medium" },
  { word: "SOLAR", def: "Relating to or powered by the sun.", diff: "Easy" },
  { word: "TEMPO", def: "The speed at which a piece of music is played.", diff: "Medium" },
  { word: "UNITY", def: "The state of being joined as a whole.", diff: "Medium" },
  { word: "VIVID", def: "Producing powerful, sharp images or feelings.", diff: "Medium" },
  { word: "WITTY", def: "Amusingly clever in speech or writing.", diff: "Medium" },
  { word: "YACHT", def: "A medium-sized sailing or motor boat.", diff: "Tricky" },
  { word: "BRISK", def: "Quick and energetic in movement.", diff: "Medium" },
  { word: "CHESS", def: "A strategy game played on a checkered board.", diff: "Easy" },
  { word: "DIZZY", def: "Having a spinning sensation in the head.", diff: "Medium" },
  { word: "EARTH", def: "The planet we live on.", diff: "Easy" },
  { word: "FANCY", def: "Elaborate in style — or to like something.", diff: "Medium" },
  { word: "GRAND", def: "Impressive in size or style.", diff: "Medium" },
  { word: "HAPPY", def: "Feeling or showing pleasure and contentment.", diff: "Easy" },
  { word: "JUMBO", def: "Very large compared to others of its kind.", diff: "Easy" },
  { word: "KOALA", def: "A tree-dwelling Australian marsupial.", diff: "Easy" },
  { word: "MELON", def: "A large, sweet, round fruit with a thick rind.", diff: "Easy" },
  { word: "PLAZA", def: "An open public square in a city or town.", diff: "Medium" },
  { word: "SHARP", def: "Having a fine edge or point — or quick-witted.", diff: "Easy" },
  { word: "SPARK", def: "A small fiery particle — or a sudden burst of energy.", diff: "Easy" },
  { word: "SMILE", def: "A pleased or friendly facial expression.", diff: "Easy" },
  { word: "SOUND", def: "Vibrations that travel through the air and can be heard.", diff: "Easy" },
  { word: "TWIST", def: "To turn or bend into a new shape.", diff: "Medium" },
];

/* Word bank for Word Scramble / Blitz / Speed Word — playful,
   varied-length words (4-7 letters) with a category tag. */
window.SCRAMBLE_WORDS = [
  { word: "PUZZLE", cat: "Games" }, { word: "RIDDLE", cat: "Games" },
  { word: "TROPHY", cat: "Games" }, { word: "WIZARD", cat: "Fantasy" },
  { word: "DRAGON", cat: "Fantasy" }, { word: "CASTLE", cat: "Fantasy" },
  { word: "GARDEN", cat: "Nature" }, { word: "FOREST", cat: "Nature" },
  { word: "CANYON", cat: "Nature" }, { word: "ISLAND", cat: "Nature" },
  { word: "BRIDGE", cat: "Places" }, { word: "GOLDEN", cat: "Colors" },
  { word: "PLANET", cat: "Space" }, { word: "ROCKET", cat: "Space" },
  { word: "WINTER", cat: "Seasons" }, { word: "SUMMER", cat: "Seasons" },
  { word: "AUTUMN", cat: "Seasons" }, { word: "MASTER", cat: "Skill" },
  { word: "WONDER", cat: "Feelings" }, { word: "GLOBAL", cat: "World" },
  { word: "CIRCUS", cat: "Fun" }, { word: "VOYAGE", cat: "Travel" },
  { word: "TEMPLE", cat: "Places" }, { word: "VELVET", cat: "Texture" },
  { word: "ORANGE", cat: "Colors" }, { word: "PURPLE", cat: "Colors" },
  { word: "SILVER", cat: "Colors" }, { word: "MARBLE", cat: "Materials" },
  { word: "CRISP", cat: "Texture" }, { word: "STORM", cat: "Weather" },
  { word: "CLOUD", cat: "Weather" }, { word: "OCEAN", cat: "Nature" },
  { word: "TIGER", cat: "Animals" }, { word: "EAGLE", cat: "Animals" },
  { word: "PANDA", cat: "Animals" }, { word: "MANGO", cat: "Food" },
  { word: "PASTA", cat: "Food" }, { word: "BREAD", cat: "Food" },
  { word: "HONEY", cat: "Food" }, { word: "PEACH", cat: "Food" },
  { word: "BERRY", cat: "Food" }, { word: "CANDY", cat: "Food" },
  { word: "SPARK", cat: "Energy" }, { word: "FLAME", cat: "Energy" },
  { word: "COMET", cat: "Space" }, { word: "ORBIT", cat: "Space" },
  { word: "MEDAL", cat: "Games" }, { word: "QUEST", cat: "Fantasy" },
  { word: "SCROLL", cat: "Fantasy" }, { word: "SHIELD", cat: "Fantasy" },
];

/* Seed pools for Letter Rush — 8-9 letter words chosen because
   they contain a rich set of smaller valid English words. */
window.LETTER_RUSH_SEEDS = [
  "GARDENER", "PAINTING", "SANDWICH", "MOUNTAIN", "CAMPFIRE",
  "SUNLIGHT", "KEYBOARD", "ADVENTURE", "CHILDREN", "BUTTERFLY",
  "STRAWBERRY", "SNOWFLAKE", "TREASURE", "FOOTBALL", "RAINBOW",
];

/* Achievement definitions. `check(s)` receives the persisted
   player-state object and returns true once earned. */
window.ACHIEVEMENTS = [
  {
    id: "first-steps", icon: "ph-seedling", title: "First Steps",
    desc: "Solve your very first word.",
    check: function (s) { return s.wordsSolved >= 1; },
  },
  {
    id: "on-fire", icon: "ph-fire", title: "On Fire",
    desc: "Reach a 7-day streak.",
    check: function (s) { return s.streakBest >= 7; },
  },
  {
    id: "speed-solver", icon: "ph-lightning", title: "Speed Solver",
    desc: "Solve a word in under 30 seconds.",
    check: function (s) { return s.fastestSolveSec != null && s.fastestSolveSec <= 30; },
  },
  {
    id: "word-master", icon: "ph-brain", title: "Word Master",
    desc: "Solve 50 words in total.",
    check: function (s) { return s.wordsSolved >= 50; },
  },
  {
    id: "perfect-guess", icon: "ph-target", title: "Perfect Guess",
    desc: "Win a puzzle on your very first try.",
    check: function (s) { return s.perfectWins >= 1; },
  },
  {
    id: "daily-champion", icon: "ph-star", title: "Daily Champion",
    desc: "Complete 30 daily challenges.",
    check: function (s) { return s.dailyCompletedCount >= 30; },
  },
  {
    id: "no-help-needed", icon: "ph-lock-open", title: "No Help Needed",
    desc: "Win a puzzle without using a single hint.",
    check: function (s) { return s.noHintWins >= 1; },
  },
  {
    id: "century-club", icon: "ph-medal", title: "Century Club",
    desc: "Earn 1,000 lifetime XP.",
    check: function (s) { return s.xp >= 1000; },
  },
];

/* XP required cumulative to reach each level (index = level - 1). */
window.LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 5000, 6200, 7600, 9200];

/* Real letter-frequency stats — the % of valid 5-letter Wordle
   words that contain each letter at least once, computed directly
   from the 14,855-word dictionary this site ships (data/valid-words.json). */
window.LETTER_FREQUENCY = [
  { letter: "S", pct: 44.0 }, { letter: "E", pct: 42.8 }, { letter: "A", pct: 42.1 },
  { letter: "O", pct: 30.7 }, { letter: "R", pct: 29.9 }, { letter: "I", pct: 28.0 },
  { letter: "L", pct: 23.4 }, { letter: "T", pct: 22.9 }, { letter: "N", pct: 22.0 },
  { letter: "U", pct: 19.1 },
];

/* Mini Crossword clues — short across-only clue set, evolved from
   the site's original "peek at three" teaser mechanic. */
window.MINI_CROSSWORD = [
  { num: "1A", clue: "Fill the role of", answer: "ACTAS" },
  { num: "4A", clue: "Informed", answer: "TOLD" },
  { num: "6A", clue: "River in which baby Moses was found", answer: "NILE" },
  { num: "8A", clue: "Sound of a contented cat", answer: "PURR" },
  { num: "10A", clue: "Not any", answer: "NONE" },
];
