/* ===========================================================
   Demo Route — Great Commission Quest
   Shared data: checkpoint content, team sequences, passage
   =========================================================== */

const CP_DATA = {
  1: {
    name: "The Garage",
    where: "Head to the grassy area near the building, close to the gate. Look for the House interpretive signboard &mdash; you can't miss its distinctive emblem at the top.",
    riddle: "On the board, find the passage near the bottom. Its headline reads: <em>&ldquo;Galaxy New ___.&rdquo;</em> Read the board on site and fill in the missing last word of that headline &mdash; that word is your keyword.",
    pattern: 5,
    answer: "known",
    map: "assets/images/cp1-map.jpg",
    board: "assets/images/cp1-board.jpg"
  },
  2: {
    name: "Evolution Garden",
    where: "Head towards the Garden, following the marked route. Once inside, look for the Monkey Genealogy panel, which tells the story of how monkeys came to dominate the garden.",
    riddle: "On the board, read the final sentence of the English paragraph: <em>&ldquo;&hellip;supervised the ___ of the monkey.&rdquo;</em> Count backwards from the very last word of that sentence (&ldquo;feet&rdquo; is the 1st word from the end). The hidden word is the <strong>5th word from the end</strong> of the sentence.",
    pattern: 7,
    answer: "mission",
    map: "assets/images/cp2-map.jpg",
    board: "assets/images/cp2-board.jpg"
  }
};

// Each team's checkpoint order (CP numbers, in the order they must visit them)
const TEAMS = {
  "Demo": { label: "Team Demo", sequence: [1, 2] }
};

// The Master Passage. {n} marks the blank fed by the CP whose answer maps to blank n.
const PASSAGE_TEMPLATE = "Ralph D. Winter, is a prominent 20th-century American missiologist and Presbyterian missionary. He became well {1} as the advocate for pioneer outreach among unreached people groups. Billy Graham once wrote: “Ralph Winter has not only helped promote evangelism among many {2} boards around the world, but by his research, training and publishing he has accelerated world evangelization.”";

// Maps blank number -> which CP number supplies that answer
const BLANK_SOURCE_CP = { 1: 1, 2: 2 };
