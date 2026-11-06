/**
 * DEMO ACTIVITY LIBRARY. Seven hand-written activities for four topics.
 * Later an AI suggests and adapts these (same fields), and teachers rate them.
 * Every activity: each role is needed to finish, and roles are matched to children's strengths.
 */
export type Material = "paper" | "scissors" | "chart" | "phone";

export const MATERIAL_LABEL: Record<Material, string> = {
  paper: "Paper",
  scissors: "Scissors",
  chart: "Chart paper",
  phone: "Phone",
};

export type Role = {
  name: string;
  job: string;
  /** Strength words (see analytics.ts) that suit this role. */
  fits: string[];
};

export type Activity = {
  id: string;
  title: string;
  format: string;
  summary: string;
  topicIds: string[]; // lesson idea ids from lessons.ts
  minutes: number;
  needs: Material[]; // empty = no materials at all
  roles: Role[];
  steps: { title: string; detail: string }[];
  watchFor: string[];
  adapt: { tooHard: string; tooEasy: string; noisy: string };
  localNote: string;
};

export const ACTIVITIES: Activity[] = [
  {
    id: "roti-jigsaw",
    title: "Roti Jigsaw",
    format: "Jigsaw",
    summary: "Groups fold and cut paper rotis and prove that different pieces cover the same amount.",
    topicIds: ["maths-2-i1", "maths-2-i2"],
    minutes: 20,
    needs: ["paper", "scissors"],
    roles: [
      { name: "Cutter", job: "Folds and cuts the pieces", fits: ["building models", "drawing"] },
      { name: "Matcher", job: "Spots pieces that cover the same amount", fits: ["spotting patterns", "visual reasoning"] },
      { name: "Speaker", job: "Explains the proof aloud", fits: ["speaking", "explaining"] },
      { name: "Drawer", job: "Draws the proof", fits: ["drawing", "visual reasoning"] },
    ],
    steps: [
      { title: "Set up groups", detail: "Make groups. Hand out role cards and two paper rotis to each group." },
      { title: "Fold and cut", detail: "Cutters fold a roti in half, then in half again, and cut along the folds." },
      { title: "Find equal pieces", detail: "Matchers show which pieces cover the same amount. For example, 2 quarters and 1 half." },
      { title: "Share it aloud", detail: "Each Speaker explains one proof to the class while the Drawer shows the drawing." },
    ],
    watchFor: ["A quiet child leading through drawing or cutting.", "Groups that add the top and bottom numbers."],
    adapt: {
      tooHard: "Stay with halves and quarters only.",
      tooEasy: "Ask for eighths: how many make a half?",
      noisy: "Keep the cutting step silent. Talking is only for the share step.",
    },
    localNote: "Use real rotis if you can, and name the pieces in your own language.",
  },
  {
    id: "fraction-bazaar",
    title: "Fraction Bazaar",
    format: "Role play",
    summary: "Run a pretend kirana shop. Buyers and sellers swap equal amounts of rice, sugar and dal.",
    topicIds: ["maths-2-i1", "maths-2-i2"],
    minutes: 25,
    needs: ["paper"],
    roles: [
      { name: "Shopkeeper", job: "Sells the goods", fits: ["speaking", "explaining"] },
      { name: "Buyer", job: "Asks for an amount", fits: ["counting", "memory"] },
      { name: "Cashier", job: "Writes each amount on a slip", fits: ["letters and words", "reading aloud"] },
      { name: "Checker", job: "Says if the swap is fair", fits: ["spotting patterns", "visual reasoning"] },
    ],
    steps: [
      { title: "Set up the shop", detail: "Each group writes goods on paper slips: 1/2 kg, 2/4 kg, 1/4 kg and so on." },
      { title: "Buy and sell", detail: "Buyers ask for an amount. Shopkeepers offer a different slip that means the same." },
      { title: "Check the swaps", detail: "Checkers say if the two slips are the same amount, and why." },
      { title: "Share it aloud", detail: "Each group tells the class one swap that surprised them." },
    ],
    watchFor: ["Children who explain a swap in their own words.", "Slips that look different but are the same."],
    adapt: {
      tooHard: "Use only 1/2 and 2/4 slips.",
      tooEasy: "Add 4/8 and ask for a 'fair price' for 3/4.",
      noisy: "Let only one shop trade at a time while others watch.",
    },
    localNote: "Use the goods your children see at their local shop.",
  },
  {
    id: "fold-match-relay",
    title: "Fold and Match Relay",
    format: "Relay game",
    summary: "Teams take turns matching folded paper strips that show the same fraction.",
    topicIds: ["maths-2-i2"],
    minutes: 15,
    needs: ["paper"],
    roles: [
      { name: "Folder", job: "Folds the strips", fits: ["building models", "drawing"] },
      { name: "Runner", job: "Carries a strip to the board", fits: ["counting", "memory"] },
      { name: "Matcher", job: "Finds the strip that matches", fits: ["spotting patterns", "visual reasoning"] },
      { name: "Caller", job: "Says the fraction aloud", fits: ["speaking", "reading aloud"] },
    ],
    steps: [
      { title: "Fold strips", detail: "Each team folds strips into halves, quarters and eighths and labels them." },
      { title: "Run and match", detail: "Runners take a strip to the board. The team finds its match." },
      { title: "Say it aloud", detail: "Callers say the fractions that match, for example 'two quarters equal one half'." },
      { title: "Check together", detail: "The whole class checks the matches on the board." },
    ],
    watchFor: ["Teams that rush without checking.", "A child who becomes the team's explainer."],
    adapt: {
      tooHard: "Only use halves and quarters.",
      tooEasy: "Add thirds and sixths, and ask which strips do not match.",
      noisy: "Use a quiet signal for each turn, such as a raised hand.",
    },
    localNote: "Use old newspaper strips if you have no paper.",
  },
  {
    id: "water-walk",
    title: "Water Walk",
    format: "Walk and map",
    summary: "Groups find the water sources at school and mark which are safe to drink.",
    topicIds: ["evs-1-i1"],
    minutes: 25,
    needs: ["paper"],
    roles: [
      { name: "Spotter", job: "Finds the water sources", fits: ["spotting patterns", "visual reasoning"] },
      { name: "Mapper", job: "Draws where each one is", fits: ["drawing", "building models"] },
      { name: "Checker", job: "Asks: is it safe to drink?", fits: ["explaining", "memory"] },
      { name: "Reporter", job: "Tells the class one finding", fits: ["speaking", "reading aloud"] },
    ],
    steps: [
      { title: "Set up groups", detail: "Make groups and hand out role cards, paper and pencils." },
      { title: "Walk and look", detail: "Spotters find taps, tanks and wells. Mappers draw them." },
      { title: "Make the map", detail: "Checkers mark which water is safe to drink and why." },
      { title: "Share it aloud", detail: "Each Reporter shares one finding with the class." },
    ],
    watchFor: ["A quiet child leading through drawing the map.", "Groups who think clear-looking water is always safe."],
    adapt: {
      tooHard: "Look at only two water sources.",
      tooEasy: "Ask how each source could be made safe.",
      noisy: "Walk in a line with the teacher and stop at each source.",
    },
    localNote: "Include the water sources children use at home, such as a well or a handpump.",
  },
  {
    id: "safe-or-not-relay",
    title: "Safe or Not Safe",
    format: "Relay game",
    summary: "Teams sort water cards into safe and not safe, and explain each choice.",
    topicIds: ["evs-1-i1"],
    minutes: 15,
    needs: ["paper"],
    roles: [
      { name: "Card Reader", job: "Reads each card aloud", fits: ["reading aloud", "letters and words"] },
      { name: "Runner", job: "Carries the card to a side", fits: ["counting", "memory"] },
      { name: "Sorter", job: "Decides: safe or not safe", fits: ["spotting patterns", "visual reasoning"] },
      { name: "Explainer", job: "Says why", fits: ["speaking", "explaining"] },
    ],
    steps: [
      { title: "Make the cards", detail: "Write cards such as 'boiled and cooled', 'river water' and 'muddy pond'." },
      { title: "Read and run", detail: "The Reader reads a card. The Runner takes it to the Safe or Not Safe side." },
      { title: "Explain it", detail: "The Explainer gives one reason for each choice." },
      { title: "Check together", detail: "Go through each card with the whole class." },
    ],
    watchFor: ["Children who only judge by how the water looks.", "A reason that mentions germs or heat."],
    adapt: {
      tooHard: "Use only three cards.",
      tooEasy: "Add a card that needs two steps, such as 'filtered then boiled'.",
      noisy: "Make teams take turns, one team at a time.",
    },
    localNote: "Write the cards in the language your children use at home.",
  },
  {
    id: "number-train",
    title: "Number Train",
    format: "Whole-class game",
    summary: "Groups build big numbers from digit cards, read them aloud, and put them in order.",
    topicIds: ["maths-1-i1"],
    minutes: 20,
    needs: ["paper"],
    roles: [
      { name: "Digit Holder", job: "Holds the digit cards", fits: ["counting", "memory"] },
      { name: "Place Caller", job: "Says each place: ones, tens, hundreds, thousands", fits: ["speaking", "explaining"] },
      { name: "Reader", job: "Reads the number aloud", fits: ["reading aloud", "letters and words"] },
      { name: "Checker", job: "Checks the order of the numbers", fits: ["spotting patterns", "visual reasoning"] },
    ],
    steps: [
      { title: "Make digit cards", detail: "Each group writes the digits 0 to 9 on paper cards." },
      { title: "Build a number", detail: "Draw four cards and make a number. The Place Caller names each place." },
      { title: "Read it aloud", detail: "The Reader says the number in words." },
      { title: "Line up the train", detail: "Groups put their numbers in order from smallest to greatest." },
    ],
    watchFor: ["Mixing up thousands and hundreds.", "Children who read the digits one by one instead of as a number."],
    adapt: {
      tooHard: "Use three-digit numbers.",
      tooEasy: "Make the biggest and smallest number from the same four digits.",
      noisy: "Let only one group read at a time.",
    },
    localNote: "Use numbers children know, such as train distances or the school's student count.",
  },
  {
    id: "number-stories",
    title: "Number Stories",
    format: "Storytelling",
    summary: "Groups tell a story about a long journey and say each distance in words and digits.",
    topicIds: ["maths-1-i1"],
    minutes: 15,
    needs: [],
    roles: [
      { name: "Storyteller", job: "Tells the journey", fits: ["speaking", "explaining"] },
      { name: "Number Caller", job: "Says each distance", fits: ["counting", "reading aloud"] },
      { name: "Place Checker", job: "Says which place each digit is in", fits: ["spotting patterns", "visual reasoning"] },
      { name: "Listener", job: "Says if the story makes sense", fits: ["memory", "letters and words"] },
    ],
    steps: [
      { title: "Pick a journey", detail: "Each group picks a journey, for example a train trip." },
      { title: "Tell the story", detail: "The Storyteller tells it. The Number Caller says each distance." },
      { title: "Check the places", detail: "The Place Checker says what each digit means." },
      { title: "Listen and ask", detail: "Listeners ask one question about the numbers." },
    ],
    watchFor: ["Children who say 'two thousand one hundred' correctly.", "Groups who skip the zero."],
    adapt: {
      tooHard: "Keep distances under 1,000.",
      tooEasy: "Ask groups to compare two journeys.",
      noisy: "Groups whisper their story to a neighbour group.",
    },
    localNote: "Use journeys your children have really made, such as a bus ride to a relative.",
  },
];

   /** Activities written by the AI while the app is open. Screens find them by id like the library ones. */
   const written = new Map<string, Activity>();

   /** Keep AI-written activities so the Group activity, Groups and Run screens can open them by id. */
   export function rememberActivities(list: Activity[]) {
     for (const a of list) written.set(a.id, a);
   }

   export const getActivity = (id: string | undefined) =>
     (id ? written.get(id) : undefined) ?? ACTIVITIES.find((a) => a.id === id) ?? null;