/* ============================================================
   WordArcade — game data
   Curated word banks, achievement defs, and real computed stats.
   The full 5-letter valid-guess dictionary (data/valid-words.json,
   14,855 words sourced from the open Wordle word list) is lazy
   loaded on first game open — see js/words.js.

   Fields on ANSWER_WORDS:
     word  — the 5-letter answer
     def   — a plain-language definition (also used as a hint/clue)
     diff  — Easy / Medium / Tricky / Hard
     cat   — a short semantic/category clue (Hint 3 + Guess-the-Word)
     ex    — an example sentence with the word blanked out as "___"
   ============================================================ */
window.ANSWER_WORDS = [
  { word: "STARE", def: "To look fixedly at something for a long time.", diff: "Medium", cat: "Something you do with your eyes", ex: "It's rude to ___ at strangers." },
  { word: "CRANE", def: "A tall lifting machine — or a long-necked wading bird.", diff: "Easy", cat: "Found on a construction site", ex: "The ___ lifted the steel beam into place." },
  { word: "PLANT", def: "A living thing that grows roots, stems and leaves.", diff: "Easy", cat: "Something found in a garden", ex: "Water the ___ twice a week." },
  { word: "BRAVE", def: "Showing courage in the face of danger.", diff: "Easy", cat: "A quality of a hero", ex: "It was ___ of her to speak up." },
  { word: "GHOST", def: "The spirit of someone who has died.", diff: "Easy", cat: "A spooky Halloween idea", ex: "The old house was said to be haunted by a ___." },
  { word: "LEMON", def: "A sour yellow citrus fruit.", diff: "Easy", cat: "Something sour you'd find in a kitchen", ex: "Squeeze a ___ into your tea." },
  { word: "MANGO", def: "A sweet, juicy tropical fruit.", diff: "Easy", cat: "A tropical fruit", ex: "The smoothie was made with fresh ___." },
  { word: "RIVER", def: "A large natural stream of flowing water.", diff: "Easy", cat: "Something found in nature", ex: "The canoe drifted down the ___." },
  { word: "STORM", def: "Violent weather with high winds and rain.", diff: "Easy", cat: "A type of weather", ex: "The forecast warned of a coming ___." },
  { word: "TIGER", def: "A large striped wild cat.", diff: "Easy", cat: "A wild animal", ex: "The ___ prowled through the tall grass." },
  { word: "WATCH", def: "To look at attentively — or a small timepiece.", diff: "Easy", cat: "Something worn on your wrist", ex: "He checked his ___ before the meeting." },
  { word: "QUIET", def: "Making very little noise.", diff: "Medium", cat: "The opposite of loud", ex: "Please keep it ___ in the library." },
  { word: "FRUIT", def: "The sweet, fleshy part of a plant eaten as food.", diff: "Easy", cat: "Something healthy you eat", ex: "Eat more ___ and vegetables." },
  { word: "HOUSE", def: "A building made for people to live in.", diff: "Easy", cat: "A place people live", ex: "They bought a ___ near the park." },
  { word: "MUSIC", def: "Sounds arranged in a pleasing sequence.", diff: "Easy", cat: "Something you listen to", ex: "She played ___ while she cooked." },
  { word: "LIGHT", def: "The natural energy that makes things visible.", diff: "Easy", cat: "The opposite of dark", ex: "Turn on the ___ in the hallway." },
  { word: "NIGHT", def: "The dark hours between sunset and sunrise.", diff: "Easy", cat: "The opposite of day", ex: "The owls hunt at ___." },
  { word: "OCEAN", def: "A vast body of salt water covering the globe.", diff: "Easy", cat: "A huge body of water", ex: "The ship sailed across the ___." },
  { word: "PIZZA", def: "A baked dish of dough, sauce and cheese.", diff: "Easy", cat: "A popular takeout food", ex: "We ordered a ___ for movie night." },
  { word: "QUEEN", def: "A female monarch, or a powerful chess piece.", diff: "Easy", cat: "Someone who wears a crown", ex: "The ___ waved to the crowd." },
  { word: "ROBOT", def: "A machine that carries out tasks automatically.", diff: "Easy", cat: "Something you might see in a factory", ex: "The ___ assembled the car parts." },
  { word: "SUGAR", def: "A sweet, crystalline substance used in cooking.", diff: "Easy", cat: "Something sweet in your pantry", ex: "Add a spoon of ___ to the coffee." },
  { word: "TRAIN", def: "A line of connected railway cars.", diff: "Easy", cat: "A way to travel", ex: "We caught the morning ___ to the city." },
  { word: "UNCLE", def: "The brother of one of your parents.", diff: "Easy", cat: "A member of your family", ex: "My ___ visits us every summer." },
  { word: "WORLD", def: "The earth, together with everyone on it.", diff: "Easy", cat: "Everything on the planet", ex: "She wants to travel the ___." },
  { word: "YOUTH", def: "The period of life when someone is young.", diff: "Medium", cat: "A stage of life", ex: "He spent his ___ in a small town." },
  { word: "ZEBRA", def: "A striped African animal related to the horse.", diff: "Easy", cat: "A striped African animal", ex: "The ___ grazed near the watering hole." },
  { word: "ANGLE", def: "The space between two lines that meet at a point.", diff: "Medium", cat: "A term used in geometry", ex: "Measure the ___ with a protractor." },
  { word: "BEACH", def: "A sandy or pebbly shore beside the sea.", diff: "Easy", cat: "A place you'd visit in summer", ex: "We spent the day at the ___." },
  { word: "CANDY", def: "A sweet confection meant to be enjoyed slowly.", diff: "Easy", cat: "Something sweet you eat", ex: "The kids traded their Halloween ___." },
  { word: "DANCE", def: "To move rhythmically, usually to music.", diff: "Easy", cat: "Something you do at a party", ex: "They danced a slow ___ together." },
  { word: "EAGLE", def: "A large, powerful bird of prey.", diff: "Easy", cat: "A bird of prey", ex: "An ___ circled high above the cliff." },
  { word: "FLAME", def: "The glowing, visible part of a fire.", diff: "Medium", cat: "Part of a fire", ex: "A single ___ lit up the dark room." },
  { word: "GRAPE", def: "A small round fruit that grows in clusters.", diff: "Easy", cat: "A fruit that grows in bunches", ex: "She popped a ___ into her mouth." },
  { word: "HONEY", def: "A sweet substance made by bees.", diff: "Easy", cat: "Made by bees", ex: "Drizzle ___ over the yogurt." },
  { word: "IVORY", def: "The hard, creamy-white material of a tusk.", diff: "Medium", cat: "A pale, creamy color", ex: "The keys were carved from ___." },
  { word: "JOKER", def: "A playing card — or someone who loves a prank.", diff: "Medium", cat: "Someone who loves pranks", ex: "He's the office ___, always cracking jokes." },
  { word: "KNIFE", def: "A tool with a sharp blade used for cutting.", diff: "Easy", cat: "A utensil in a kitchen drawer", ex: "Use a sharp ___ to slice the bread." },
  { word: "MAGIC", def: "The power of seemingly impossible events.", diff: "Easy", cat: "What a wizard performs", ex: "The children watched the ___ show in awe." },
  { word: "NURSE", def: "Someone trained to care for the sick.", diff: "Easy", cat: "Someone who works in a hospital", ex: "The ___ checked his temperature." },
  { word: "OASIS", def: "A fertile, green spot in the middle of a desert.", diff: "Medium", cat: "Found in the middle of a desert", ex: "The travelers rested at the ___." },
  { word: "PEARL", def: "A hard, lustrous sphere formed inside an oyster.", diff: "Medium", cat: "Found inside an oyster", ex: "She wore a string of ___ around her neck." },
  { word: "ROBIN", def: "A small songbird with a red-orange breast.", diff: "Easy", cat: "A small backyard bird", ex: "A ___ landed on the fence post." },
  { word: "SNAKE", def: "A long, limbless reptile.", diff: "Easy", cat: "A reptile with no legs", ex: "A ___ slithered through the grass." },
  { word: "TOAST", def: "Bread that's been browned by heat.", diff: "Easy", cat: "Something you make for breakfast", ex: "He buttered his ___ and sat down." },
  { word: "VAPOR", def: "A substance suspended in the air as a fine mist.", diff: "Medium", cat: "Related to steam or mist", ex: "___ rose gently off the hot spring." },
  { word: "WHALE", def: "A massive marine mammal.", diff: "Easy", cat: "The largest animal in the ocean", ex: "A ___ breached near the boat." },
  { word: "YIELD", def: "To give way — or the amount something produces.", diff: "Medium", cat: "A word you'd see on a traffic sign", ex: "Drivers must ___ to pedestrians." },
  { word: "ZESTY", def: "Full of bright, lively flavor.", diff: "Medium", cat: "A word that describes bold flavor", ex: "The sauce had a ___ kick of lime." },
  { word: "ARROW", def: "A pointed projectile shot from a bow.", diff: "Easy", cat: "Shot from a bow", ex: "The ___ struck the center of the target." },
  { word: "BLAZE", def: "An intense, fiercely burning fire.", diff: "Medium", cat: "A word for a raging fire", ex: "Firefighters battled the ___ for hours." },
  { word: "CROWN", def: "An ornamental headpiece worn by royalty.", diff: "Easy", cat: "Worn by royalty", ex: "The king's ___ was set with jewels." },
  { word: "DRAFT", def: "A preliminary version — or a current of air.", diff: "Medium", cat: "An early version of something written", ex: "She sent the first ___ to her editor." },
  { word: "EMBER", def: "A small glowing piece of coal or wood.", diff: "Medium", cat: "What's left after a fire dies down", ex: "A single ___ still glowed in the fireplace." },
  { word: "FROST", def: "A thin layer of ice crystals on a cold surface.", diff: "Easy", cat: "Something you'd scrape off a windshield", ex: "___ covered the grass this morning." },
  { word: "GLARE", def: "An intense, dazzling light.", diff: "Medium", cat: "Something sunglasses block", ex: "The sun's ___ made it hard to see." },
  { word: "HEART", def: "The muscular organ that pumps blood.", diff: "Easy", cat: "An organ in your chest", ex: "Exercise keeps your ___ healthy." },
  { word: "IGLOO", def: "A dome-shaped shelter built from blocks of snow.", diff: "Easy", cat: "A shelter built from snow", ex: "They built an ___ during the blizzard." },
  { word: "JOLLY", def: "Full of good humor and high spirits.", diff: "Medium", cat: "A word that describes a cheerful mood", ex: "He gave a ___ laugh and waved hello." },
  { word: "LODGE", def: "A small house, often used as a getaway.", diff: "Medium", cat: "A place you'd stay on a ski trip", ex: "We rented a cozy ski ___." },
  { word: "MOUSE", def: "A small rodent — or the device beside your keyboard.", diff: "Easy", cat: "Sits beside your keyboard", ex: "Click the ___ to open the file." },
  { word: "NOBLE", def: "Having very fine personal qualities.", diff: "Medium", cat: "A word that describes an admirable person", ex: "It was a ___ thing to do." },
  { word: "OLIVE", def: "A small oval fruit pressed for its oil.", diff: "Easy", cat: "Pressed to make an oil", ex: "The salad was topped with sliced ___." },
  { word: "PIANO", def: "A large keyboard instrument with strings inside.", diff: "Easy", cat: "A musical instrument with keys", ex: "She practiced ___ every evening." },
  { word: "RADAR", def: "A system that detects distant objects with radio waves.", diff: "Medium", cat: "Used by air traffic control", ex: "The storm showed up clearly on ___." },
  { word: "SOLAR", def: "Relating to or powered by the sun.", diff: "Easy", cat: "Powered by the sun", ex: "They installed ___ panels on the roof." },
  { word: "TEMPO", def: "The speed at which a piece of music is played.", diff: "Medium", cat: "A musical term for speed", ex: "The song picked up ___ in the chorus." },
  { word: "UNITY", def: "The state of being joined as a whole.", diff: "Medium", cat: "The opposite of division", ex: "The team celebrated with a sense of ___." },
  { word: "VIVID", def: "Producing powerful, sharp images or feelings.", diff: "Medium", cat: "A word that describes a strong memory", ex: "She had a ___ dream last night." },
  { word: "WITTY", def: "Amusingly clever in speech or writing.", diff: "Medium", cat: "A word that describes clever humor", ex: "His ___ reply made everyone laugh." },
  { word: "YACHT", def: "A medium-sized sailing or motor boat.", diff: "Tricky", cat: "A boat owned by the wealthy", ex: "They sailed the ___ around the bay." },
  { word: "BRISK", def: "Quick and energetic in movement.", diff: "Medium", cat: "A word that describes a fast walk", ex: "We took a ___ walk before breakfast." },
  { word: "CHESS", def: "A strategy game played on a checkered board.", diff: "Easy", cat: "A board game with kings and queens", ex: "They played ___ in the park." },
  { word: "DIZZY", def: "Having a spinning sensation in the head.", diff: "Medium", cat: "How you feel after spinning around", ex: "The ride left her feeling ___." },
  { word: "EARTH", def: "The planet we live on.", diff: "Easy", cat: "The planet we live on", ex: "The astronauts looked back at ___." },
  { word: "FANCY", def: "Elaborate in style — or to like something.", diff: "Medium", cat: "A word for something dressed up or elegant", ex: "They wore ___ outfits to the gala." },
  { word: "GRAND", def: "Impressive in size or style.", diff: "Medium", cat: "A word for something impressively large", ex: "The hotel had a ___ entrance." },
  { word: "HAPPY", def: "Feeling or showing pleasure and contentment.", diff: "Easy", cat: "The opposite of sad", ex: "She felt ___ after the good news." },
  { word: "JUMBO", def: "Very large compared to others of its kind.", diff: "Easy", cat: "A word for something oversized", ex: "We bought the ___ size popcorn." },
  { word: "KOALA", def: "A tree-dwelling Australian marsupial.", diff: "Easy", cat: "An Australian animal", ex: "The ___ napped in the eucalyptus tree." },
  { word: "MELON", def: "A large, sweet, round fruit with a thick rind.", diff: "Easy", cat: "A large fruit with a thick rind", ex: "They sliced the ___ for the picnic." },
  { word: "PLAZA", def: "An open public square in a city or town.", diff: "Medium", cat: "An open square in a city", ex: "Musicians played in the town ___." },
  { word: "SHARP", def: "Having a fine edge or point — or quick-witted.", diff: "Easy", cat: "The opposite of dull or blunt", ex: "Be careful, the blade is very ___." },
  { word: "SPARK", def: "A small fiery particle — or a sudden burst of energy.", diff: "Easy", cat: "What a flint and steel makes", ex: "A single ___ started the campfire." },
  { word: "SMILE", def: "A pleased or friendly facial expression.", diff: "Easy", cat: "Something you do when you're happy", ex: "Her ___ lit up the room." },
  { word: "SOUND", def: "Vibrations that travel through the air and can be heard.", diff: "Easy", cat: "Something your ears detect", ex: "The ___ of thunder rolled in the distance." },
  { word: "TWIST", def: "To turn or bend into a new shape.", diff: "Medium", cat: "A surprising turn in a story", ex: "The movie had a shocking ___ ending." },
];

/* Word bank for Word Scramble / Blitz / Speed Word — playful,
   varied-length words (4-7 letters) with a category tag and a
   short definition used for the in-game Definition hint. */
window.SCRAMBLE_WORDS = [
  { word: "PUZZLE", cat: "Games", def: "A game or problem that tests your thinking." },
  { word: "RIDDLE", cat: "Games", def: "A tricky question posed as a puzzle." },
  { word: "TROPHY", cat: "Games", def: "A prize awarded for winning." },
  { word: "WIZARD", cat: "Fantasy", def: "A person with magical powers." },
  { word: "DRAGON", cat: "Fantasy", def: "A mythical fire-breathing creature." },
  { word: "CASTLE", cat: "Fantasy", def: "A large fortified building, often with a king." },
  { word: "GARDEN", cat: "Nature", def: "A patch of ground for growing plants." },
  { word: "FOREST", cat: "Nature", def: "A large area densely covered in trees." },
  { word: "CANYON", cat: "Nature", def: "A deep gorge, often carved by a river." },
  { word: "ISLAND", cat: "Nature", def: "A piece of land surrounded by water." },
  { word: "BRIDGE", cat: "Places", def: "A structure built to cross a river or gap." },
  { word: "GOLDEN", cat: "Colors", def: "Having the rich yellow color of gold." },
  { word: "PLANET", cat: "Space", def: "A large body that orbits a star." },
  { word: "ROCKET", cat: "Space", def: "A vehicle propelled into space or the air." },
  { word: "WINTER", cat: "Seasons", def: "The coldest season of the year." },
  { word: "SUMMER", cat: "Seasons", def: "The warmest season of the year." },
  { word: "AUTUMN", cat: "Seasons", def: "The season between summer and winter." },
  { word: "MASTER", cat: "Skill", def: "Someone with complete skill in something." },
  { word: "WONDER", cat: "Feelings", def: "A feeling of amazement and admiration." },
  { word: "GLOBAL", cat: "World", def: "Relating to the whole world." },
  { word: "CIRCUS", cat: "Fun", def: "A traveling show with acrobats and clowns." },
  { word: "VOYAGE", cat: "Travel", def: "A long journey, especially by sea." },
  { word: "TEMPLE", cat: "Places", def: "A building used for worship." },
  { word: "VELVET", cat: "Texture", def: "A soft fabric with a dense, short pile." },
  { word: "ORANGE", cat: "Colors", def: "The color between red and yellow — also a fruit." },
  { word: "PURPLE", cat: "Colors", def: "A color made by mixing red and blue." },
  { word: "SILVER", cat: "Colors", def: "A shiny, grayish-white precious metal." },
  { word: "MARBLE", cat: "Materials", def: "A hard stone used in sculpture and buildings." },
  { word: "CRISP", cat: "Texture", def: "Pleasantly firm, dry or crunchy." },
  { word: "STORM", cat: "Weather", def: "Violent weather with wind and rain." },
  { word: "CLOUD", cat: "Weather", def: "A visible mass of water vapor in the sky." },
  { word: "OCEAN", cat: "Nature", def: "A vast body of salt water." },
  { word: "TIGER", cat: "Animals", def: "A large striped wild cat." },
  { word: "EAGLE", cat: "Animals", def: "A large, powerful bird of prey." },
  { word: "PANDA", cat: "Animals", def: "A black-and-white bear from China." },
  { word: "MANGO", cat: "Food", def: "A sweet, juicy tropical fruit." },
  { word: "PASTA", cat: "Food", def: "An Italian food made from dough." },
  { word: "BREAD", cat: "Food", def: "A baked food made from flour and water." },
  { word: "HONEY", cat: "Food", def: "A sweet substance made by bees." },
  { word: "PEACH", cat: "Food", def: "A soft, fuzzy-skinned orange fruit." },
  { word: "BERRY", cat: "Food", def: "A small, juicy, round fruit." },
  { word: "CANDY", cat: "Food", def: "A sweet confection." },
  { word: "SPARK", cat: "Energy", def: "A small fiery particle." },
  { word: "FLAME", cat: "Energy", def: "The glowing part of a fire." },
  { word: "COMET", cat: "Space", def: "An icy body that streaks through space." },
  { word: "ORBIT", cat: "Space", def: "The curved path of an object around a star or planet." },
  { word: "MEDAL", cat: "Games", def: "A metal disc awarded for an achievement." },
  { word: "QUEST", cat: "Fantasy", def: "A long search or journey toward a goal." },
  { word: "SCROLL", cat: "Fantasy", def: "A roll of paper or parchment with writing on it." },
  { word: "SHIELD", cat: "Fantasy", def: "A piece of armor held up to block attacks." },
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
   the site's original "peek at three" teaser mechanic. `easyClue`
   is a softer rephrasing used by the "Reveal Clue" hint. */
window.MINI_CROSSWORD = [
  { num: "1A", clue: "Fill the role of", easyClue: "Perform a part in a play", answer: "ACTAS" },
  { num: "4A", clue: "Informed", easyClue: "Made aware of something", answer: "TOLD" },
  { num: "6A", clue: "River in which baby Moses was found", easyClue: "Famous Egyptian river", answer: "NILE" },
  { num: "8A", clue: "Sound of a contented cat", easyClue: "Sound a happy kitten makes", answer: "PURR" },
  { num: "10A", clue: "Not any", easyClue: "Zero of something", answer: "NONE" },
];
