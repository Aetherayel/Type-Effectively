// Game-design mappings. These are thematic interpretations, not psychological diagnoses.
// Type badge colors sampled from Pokémon Scarlet & Violet's main-series type palette.
// Reference: https://bulbapedia.bulbagarden.net/wiki/Help:Color_templates
export const TYPE_COLORS = {
  Normal: '#9FA19F', Fire: '#E62829', Water: '#2980EF', Electric: '#FAC000',
  Grass: '#3FA129', Ice: '#3DCEF3', Fighting: '#FF8000', Poison: '#9141CB',
  Ground: '#915121', Flying: '#81B9EF', Psychic: '#EF4179', Bug: '#91A119',
  Rock: '#AFA981', Ghost: '#704170', Dragon: '#5060E1', Dark: '#624D4E',
  Steel: '#60A1B8', Fairy: '#EF70EF'
};

// The seventeen generated elemental identities represent ways motivations
// engage the world. Scores are game-design affinities (0–100), not measured
// probabilities or psychometric assessments. Normal remains a real Pokémon
// type for defenses and comparisons, but is not a generated identity.
export const GENERATED_TYPES = Object.freeze(
  Object.keys(TYPE_COLORS).filter(type=>type!=='Normal')
);

export const TYPE_AFFINITY = Object.freeze({
  // 1 — Reformer: principle, correction, integrity
  1: {Fire:72,Water:39,Electric:42,Grass:78,Ice:82,Fighting:86,
      Poison:42,Ground:88,Flying:30,Psychic:63,Bug:68,Rock:96,
      Ghost:39,Dragon:72,Dark:33,Steel:100,Fairy:48},

  // 2 — Helper: connection, nurture, belonging
  2: {Fire:62,Water:93,Electric:82,Grass:92,Ice:30,Fighting:40,
      Poison:27,Ground:63,Flying:57,Psychic:60,Bug:89,Rock:40,
      Ghost:52,Dragon:29,Dark:22,Steel:55,Fairy:100},

  // 3 — Achiever: effectiveness, ambition, recognition
  3: {Fire:98,Water:58,Electric:100,Grass:53,Ice:46,Fighting:92,
      Poison:54,Ground:52,Flying:74,Psychic:52,Bug:58,Rock:45,
      Ghost:32,Dragon:87,Dark:45,Steel:83,Fairy:41},

  // 4 — Individualist: identity, depth, significance
  4: {Fire:80,Water:81,Electric:40,Grass:48,Ice:57,Fighting:42,
      Poison:94,Ground:30,Flying:67,Psychic:96,Bug:46,Rock:37,
      Ghost:100,Dragon:64,Dark:97,Steel:41,Fairy:88},

  // 5 — Investigator: understanding, autonomy, observation
  5: {Fire:30,Water:42,Electric:67,Grass:38,Ice:100,Fighting:28,
      Poison:70,Ground:75,Flying:70,Psychic:98,Bug:37,Rock:74,
      Ghost:65,Dragon:55,Dark:95,Steel:82,Fairy:43},

  // 6 — Loyalist: security, vigilance, commitment
  6: {Fire:40,Water:72,Electric:53,Grass:72,Ice:90,Fighting:70,
      Poison:90,Ground:100,Flying:45,Psychic:66,Bug:98,Rock:96,
      Ghost:49,Dragon:46,Dark:72,Steel:83,Fairy:68},

  // 7 — Enthusiast: possibility, freedom, stimulation
  7: {Fire:94,Water:89,Electric:98,Grass:68,Ice:21,Fighting:53,
      Poison:52,Ground:42,Flying:100,Psychic:73,Bug:75,Rock:33,
      Ghost:34,Dragon:82,Dark:61,Steel:37,Fairy:86},

  // 8 — Challenger: agency, strength, resistance
  8: {Fire:90,Water:78,Electric:78,Grass:52,Ice:44,Fighting:99,
      Poison:98,Ground:85,Flying:45,Psychic:39,Bug:32,Rock:83,
      Ghost:35,Dragon:100,Dark:89,Steel:76,Fairy:31},

  // 9 — Peacemaker: harmony, steadiness, accommodation
  9: {Fire:28,Water:98,Electric:32,Grass:100,Ice:67,Fighting:53,
      Poison:35,Ground:91,Flying:65,Psychic:57,Bug:70,Rock:92,
      Ghost:55,Dragon:39,Dark:32,Steel:48,Fairy:83}
});

export const CENTERS = { gut:[8,9,1], heart:[2,3,4], head:[5,6,7] };
export const ENNEAGRAM_NAMES = {
  1:'Reformer',2:'Helper',3:'Achiever',4:'Individualist',5:'Investigator',
  6:'Loyalist',7:'Enthusiast',8:'Challenger',9:'Peacemaker'
};
export const ENNEAGRAM_AFFINITIES = {
  1:[86,61,97,78,82,45],
  2:[91,47,70,71,98,68],
  3:[76,99,65,86,58,98],
  4:[65,63,48,100,83,72],
  5:[60,42,70,100,93,37],
  6:[88,57,88,78,97,55],
  7:[71,83,49,93,58,100],
  8:[95,100,90,59,64,82],
  9:[100,43,96,65,98,35]
};

export const NATURE_BY_MBTI = {
  INTJ:'Quiet', INTP:'Modest', ENTJ:'Adamant', ENTP:'Rash',
  INFJ:'Calm', INFP:'Gentle', ENFJ:'Bold', ENFP:'Naive',
  ISTJ:'Careful', ISFJ:'Relaxed', ESTJ:'Brave', ESFJ:'Impish',
  ISTP:'Lonely', ISFP:'Mild', ESTP:'Hasty', ESFP:'Jolly'
};
export const NATURE_EFFECTS = {
  Quiet:['spa','spe'], Modest:['spa','atk'], Adamant:['atk','spa'],
  Rash:['spa','spd'], Calm:['spd','atk'], Gentle:['spd','def'],
  Bold:['def','atk'], Naive:['spe','spd'], Careful:['spd','spa'],
  Relaxed:['def','spe'], Brave:['atk','spe'], Impish:['def','spa'],
  Lonely:['atk','def'], Mild:['spa','def'], Hasty:['spe','def'], Jolly:['spe','spa']
};

export const STAT_KEYS = ['hp','atk','def','spa','spd','spe'];
export const STAT_NAMES = ['HP','Attack','Defense','Sp. Atk','Sp. Def','Speed'];
export const OCEAN_KEYS = ['openness','conscientiousness','extraversion','agreeableness','neuroticism'];
export const OCEAN_LABELS = ['Openness','Conscientiousness','Extraversion','Agreeableness','Neuroticism'];

export const ROLE_TEMPLATES = {
  Sweeper:[75,125,65,95,65,110],
  Wall:[120,55,115,55,120,70],
  Tank:[105,105,100,90,85,50],
  Pivot:[95,85,90,85,75,105],
  Support:[105,55,90,70,120,95],
  Controller:[80,65,80,115,80,115]
};
export const ROLE_DESCRIPTIONS = {
  Sweeper:'Wins by applying focused offensive pressure.',
  Wall:'Absorbs pressure, stabilizes, and outlasts.',
  Tank:'Takes a hit and answers with one of its own.',
  Pivot:'Changes the tempo and creates openings for others.',
  Support:'Protects the team and amplifies its strengths.',
  Controller:'Dictates the terms of the encounter.'
};
export const ROLE_AFFINITIES = {
  Normal:[65,65,70,78,70,65],Fire:[92,35,65,70,48,58],Water:[70,83,82,66,80,75],
  Electric:[88,34,50,97,64,91],Grass:[50,85,68,73,97,65],Ice:[82,45,76,42,49,82],
  Fighting:[92,57,95,66,40,50],Poison:[53,86,68,72,74,98],Ground:[65,87,92,45,55,67],
  Flying:[70,47,52,98,72,74],Psychic:[76,49,58,66,90,100],Bug:[62,67,44,86,77,85],
  Rock:[53,99,95,37,44,68],Ghost:[67,65,55,89,56,100],Dragon:[99,58,97,52,42,58],
  Dark:[90,49,69,90,52,91],Steel:[62,100,98,56,71,74],Fairy:[43,77,63,75,100,78]
};
export const ROLE_NAMES = Object.keys(ROLE_TEMPLATES);

export const ABILITIES = [
  {name:'Analytic',roles:['Tank','Controller'],types:['Ice','Psychic','Steel'],desc:'Powers up moves when you act after your opponent.'},
  {name:'Sturdy',roles:['Wall','Tank'],types:['Steel','Rock','Ground'],desc:'Can survive one knockout blow from full health.'},
  {name:'Technician',roles:['Sweeper','Pivot'],types:['Steel','Bug','Fighting'],desc:'Boosts weaker moves into precise tools.'},
  {name:'Regenerator',roles:['Pivot','Wall','Support'],types:['Grass','Water','Normal'],desc:'Recovers HP when switching out.'},
  {name:'Prankster',roles:['Controller','Support'],types:['Dark','Ghost','Fairy'],desc:'Raises the priority of status moves.'},
  {name:'Motor Drive',roles:['Sweeper','Pivot'],types:['Electric'],desc:'Turns Electric attacks into extra Speed.'},
  {name:'Infiltrator',roles:['Controller','Sweeper'],types:['Ghost','Dark','Flying'],desc:'Ignores protective barriers such as Substitute.'},
  {name:'Clear Body',roles:['Wall','Tank'],types:['Steel','Ice'],desc:'Prevents opponents from lowering your stats.'},
  {name:'Intimidate',roles:['Tank','Pivot'],types:['Dragon','Fighting','Dark'],desc:'Lowers an opponent\'s Attack on entry.'},
  {name:'Natural Cure',roles:['Support','Pivot','Wall'],types:['Grass','Water','Fairy'],desc:'Cures status conditions when switching out.'},
  {name:'Adaptability',roles:['Sweeper','Tank'],types:['Normal','Dragon','Fire'],desc:'Strengthens same-type attack bonuses.'},
  {name:'Multiscale',roles:['Wall','Tank'],types:['Dragon','Flying'],desc:'Reduces damage taken at full HP.'},
  {name:'Pressure',roles:['Controller','Wall'],types:['Ice','Ghost','Dark'],desc:'Makes the opponent expend more PP.'},
  {name:'Sheer Force',roles:['Sweeper','Tank'],types:['Fire','Ground','Poison'],desc:'Boosts certain attacks by removing added effects.'},
  {name:'Friend Guard',roles:['Support'],types:['Fairy','Normal','Bug'],desc:'Reduces damage taken by allies in doubles.'},
  {name:'Cursed Body',roles:['Controller','Wall'],types:['Ghost','Poison'],desc:'May disable a move that hits you.'},
  {name:'Serene Grace',roles:['Support','Controller'],types:['Fairy','Psychic','Normal'],desc:'Doubles the chance of additional move effects.'},
  {name:'Levitate',roles:['Pivot','Wall'],types:['Ghost','Psychic','Electric'],desc:'Grants immunity to Ground-type attacks.'},
  {name:'Unaware',roles:['Wall','Support'],types:['Water','Normal','Fairy'],desc:'Ignores opposing stat boosts in damage calculations.'},
  {name:'Ice Scales',roles:['Wall','Tank'],types:['Ice'],desc:'Halves incoming special move damage.'},
  {name:'Speed Boost',roles:['Sweeper','Pivot'],types:['Bug','Flying','Electric'],desc:'Raises Speed at the end of each turn.'},
  {name:'Guts',roles:['Tank','Sweeper'],types:['Fighting','Normal'],desc:'Raises Attack while affected by a status condition.'}
];

// Hidden Abilities are selected from ABILITIES by visible typing, role,
// supporting fixes and stat fit. No off-type one-to-one mapping is used.

export const TYPE_ATTACKS = {
  Normal:[['Body Slam','physical'],['Hyper Voice','special']],
  Fire:[['Flare Blitz','physical'],['Flamethrower','special']],
  Water:[['Liquidation','physical'],['Surf','special']],
  Electric:[['Wild Charge','physical'],['Thunderbolt','special']],
  Grass:[['Leaf Blade','physical'],['Energy Ball','special']],
  Ice:[['Icicle Crash','physical'],['Ice Beam','special']],
  Fighting:[['Close Combat','physical'],['Aura Sphere','special']],
  Poison:[['Poison Jab','physical'],['Sludge Bomb','special']],
  Ground:[['Earthquake','physical'],['Earth Power','special']],
  Flying:[['Brave Bird','physical'],['Air Slash','special']],
  Psychic:[['Zen Headbutt','physical'],['Psychic','special']],
  Bug:[['X-Scissor','physical'],['Bug Buzz','special']],
  Rock:[['Stone Edge','physical'],['Power Gem','special']],
  Ghost:[['Shadow Claw','physical'],['Shadow Ball','special']],
  Dragon:[['Dragon Claw','physical'],['Dragon Pulse','special']],
  Dark:[['Crunch','physical'],['Dark Pulse','special']],
  Steel:[['Iron Head','physical'],['Flash Cannon','special']],
  Fairy:[['Play Rough','physical'],['Moonblast','special']]
};

// Each role has a distinct set of real Pokémon moves, with elemental and
// motivational affinities below. Physical/special describes the build's
// offensive orientation; these role moves are predominantly status moves.
export const ROLE_MOVES = {
  Sweeper:{
    physical:['Swords Dance','Dragon Dance','Flame Charge','Agility','Bulk Up','Hone Claws'],
    special:['Nasty Plot','Calm Mind','Quiver Dance','Growth','Agility','Charge Beam']
  },
  Wall:{
    physical:['Iron Defense','Protect','Curse','Amnesia','Stockpile','Cotton Guard'],
    special:['Light Screen','Aurora Veil','Amnesia','Reflect','Mist','Protect']
  },
  Tank:{
    physical:['Bulk Up','Drain Punch','Coil','Curse','Dragon Dance','Iron Defense'],
    special:['Calm Mind','Cosmic Power','Aqua Ring','Acid Armor','Charge','Amnesia']
  },
  // Pivoting repositions the *user's* team. Baton Pass is treated as a
  // setup-transfer/growth move; Dragon Tail phazes, Rapid Spin clears hazards,
  // and Tailwind supports Speed without switching the user.
  Pivot:{
    physical:['U-turn','Flip Turn','Parting Shot','Shed Tail','Chilly Reception','Teleport'],
    special:['Volt Switch','Chilly Reception','Parting Shot','Teleport','Shed Tail','U-turn']
  },
  Support:{
    physical:['Helping Hand','Reflect','Synthesis','Wish','Aromatherapy','Safeguard'],
    special:['Light Screen','Life Dew','Tailwind','Grassy Terrain','Heal Bell','Wish']
  },
  Controller:{
    physical:['Taunt','Thunder Wave','Toxic','Spikes','Will-O-Wisp','Encore'],
    special:['Thunder Wave','Haze','Trick Room','Will-O-Wisp','Spore','Taunt']
  }
};

// Growth always retains the meaning of the core Enneagram lesson, but can be
// expressed through different moves as other motivations and elements change.
export const GROWTH_MOVES = {
  1:{choices:['Rest','Protect','Calm Mind','Helping Hand','Work Up'],
     reason:'Learning that worth is not earned by constant correction.'},
  2:{choices:['Recover','Life Dew','Helping Hand','Wish','Protect'],
     reason:'Making room for your own needs, not only those of others.'},
  3:{choices:['Helping Hand','Work Up','Baton Pass','Rest','Agility'],
     reason:'Making success shared rather than merely visible.'},
  4:{choices:['Calm Mind','Reflect','Rest','Heal Bell','Substitute'],
     reason:'Discovering steadiness beyond the pursuit of uniqueness.'},
  5:{choices:['Baton Pass','Helping Hand','Trick Room','Calm Mind','Teleport'],
     reason:'Letting understanding become a gift to others.'},
  6:{choices:['Substitute','Protect','Reflect','Endure','Safeguard'],
     reason:'Acting with courage even when certainty is incomplete.'},
  7:{choices:['Endure','Rest','Protect','Growth','Calm Mind'],
     reason:'Learning that freedom also includes the ability to remain.'},
  8:{choices:['Protect','Helping Hand','Bulk Up','Endure','Safeguard'],
     reason:'Using strength to protect instead of always control.'},
  9:{choices:['Work Up','Taunt','Swords Dance','Agility','Growth'],
     reason:'Choosing to take up space and act with intention.'}
};

// Meaningful types and fixes, rather than a global move-order preference,
// determine which move best represents an individual's role and growth.
// Missing affinities simply receive no preference bonus.
export const MOVE_SYNERGIES = {
  'Swords Dance':{types:['Steel','Fighting','Dragon'],fixes:[1,3,8]},
  'Dragon Dance':{types:['Dragon','Fire','Flying'],fixes:[3,7,8]},
  'Flame Charge':{types:['Fire','Electric','Fighting'],fixes:[3,7,8]},
  'Agility':{types:['Electric','Flying','Psychic'],fixes:[3,5,7]},
  'Bulk Up':{types:['Fighting','Rock','Ground'],fixes:[1,6,8]},
  'Hone Claws':{types:['Dark','Steel','Poison'],fixes:[3,5,8]},
  'Nasty Plot':{types:['Dark','Ghost','Poison'],fixes:[3,4,5]},
  'Calm Mind':{types:['Psychic','Ice','Fairy'],fixes:[1,4,5,9]},
  'Quiver Dance':{types:['Bug','Fairy','Flying'],fixes:[2,4,7]},
  'Growth':{types:['Grass','Water','Fairy'],fixes:[2,7,9]},
  'Charge Beam':{types:['Electric','Steel'],fixes:[3,5,7]},
  'Iron Defense':{types:['Steel','Rock','Ground'],fixes:[1,6,9]},
  'Protect':{types:['Rock','Steel','Water','Grass'],fixes:[1,2,6,8,9]},
  'Curse':{types:['Ghost','Rock','Steel'],fixes:[1,4,6]},
  'Amnesia':{types:['Water','Psychic','Ice'],fixes:[5,6,9]},
  'Stockpile':{types:['Poison','Ground','Rock'],fixes:[5,6,9]},
  'Cotton Guard':{types:['Grass','Fairy'],fixes:[2,6,9]},
  'Light Screen':{types:['Psychic','Fairy','Electric'],fixes:[2,5,6]},
  'Aurora Veil':{types:['Ice','Fairy'],fixes:[1,4,6]},
  'Reflect':{types:['Psychic','Steel','Fairy'],fixes:[1,2,6]},
  'Mist':{types:['Ice','Water'],fixes:[4,6,9]},
  'Drain Punch':{types:['Fighting','Grass'],fixes:[2,8,9]},
  'Coil':{types:['Poison','Ground','Dragon'],fixes:[3,6,8]},
  'Cosmic Power':{types:['Psychic','Rock','Fairy'],fixes:[4,5,9]},
  'Aqua Ring':{types:['Water','Ice'],fixes:[2,6,9]},
  'Acid Armor':{types:['Poison','Water','Ice'],fixes:[4,6,9]},
  'Charge':{types:['Electric','Steel'],fixes:[3,5,6]},
  'U-turn':{types:['Bug','Flying'],fixes:[2,3,7]},
  'Flip Turn':{types:['Water','Ice'],fixes:[2,7,9]},
  'Parting Shot':{types:['Dark','Poison','Ghost'],fixes:[4,5,8]},
  'Shed Tail':{types:['Grass','Poison','Dragon','Ghost'],fixes:[2,5,6,9]},
  'Baton Pass':{types:['Psychic','Fairy','Bug'],fixes:[2,3,5]},
  'Dragon Tail':{types:['Dragon','Fighting'],fixes:[6,8]},
  'Rapid Spin':{types:['Ground','Rock','Steel'],fixes:[1,6,9]},
  'Volt Switch':{types:['Electric','Steel'],fixes:[3,7]},
  'Chilly Reception':{types:['Ice','Ghost','Dark'],fixes:[4,5,7]},
  'Teleport':{types:['Psychic','Ghost','Flying'],fixes:[4,5,9]},
  'Tailwind':{types:['Flying','Electric','Fairy'],fixes:[2,3,7]},
  'Helping Hand':{types:['Fairy','Grass','Bug'],fixes:[2,3,5,8]},
  'Synthesis':{types:['Grass','Water'],fixes:[2,6,9]},
  'Wish':{types:['Fairy','Water','Psychic'],fixes:[2,4,9]},
  'Aromatherapy':{types:['Grass','Fairy'],fixes:[2,6,9]},
  'Safeguard':{types:['Fairy','Steel','Ground'],fixes:[1,2,6,8]},
  'Life Dew':{types:['Water','Fairy'],fixes:[2,6,9]},
  'Grassy Terrain':{types:['Grass','Ground'],fixes:[2,6,9]},
  'Heal Bell':{types:['Fairy','Grass','Water'],fixes:[2,4,9]},
  'Taunt':{types:['Dark','Fighting','Fire'],fixes:[3,7,8,9]},
  'Thunder Wave':{types:['Electric','Steel'],fixes:[3,6,7]},
  'Toxic':{types:['Poison','Dark'],fixes:[4,6,8]},
  'Spikes':{types:['Ground','Rock','Steel'],fixes:[1,5,6]},
  'Will-O-Wisp':{types:['Fire','Ghost'],fixes:[4,6,8]},
  'Encore':{types:['Fairy','Psychic'],fixes:[2,3,7]},
  'Haze':{types:['Water','Ice','Poison'],fixes:[4,6,9]},
  'Trick Room':{types:['Psychic','Ghost'],fixes:[4,5,6]},
  'Spore':{types:['Grass','Bug'],fixes:[2,5,9]},
  'Rest':{types:['Ice','Grass','Water','Rock'],fixes:[1,5,6,7,9]},
  'Recover':{types:['Water','Fairy','Psychic'],fixes:[2,5,9]},
  'Work Up':{types:['Fire','Fighting','Electric'],fixes:[1,3,8,9]},
  'Substitute':{types:['Ghost','Dark','Poison'],fixes:[4,5,6]},
  'Endure':{types:['Rock','Fighting','Grass'],fixes:[6,7,8]}
};

export const TEST_LINKS = {
  mbti:'https://www.16personalities.com/free-personality-test',
  enneagram:'https://findmynine.com/test',
  bigfive:'https://oceantest.net/test'
};

export const DEMOS = {
  architect:{
    mbti:[86,84,22,16,30],
    enneagram:[42,18,68,35,94,55,24,28,81],
    bigfive:[80,90,20,60,15],
    typeOverride:'INTJ',tritypeOverride:'593'
  },
  catalyst:{
    mbti:[16,30,78,87,68],
    enneagram:[84,24,50,74,18,28,92,31,40],
    bigfive:[77,39,89,54,52],
    typeOverride:'ESFP',tritypeOverride:'714'
  }
};
