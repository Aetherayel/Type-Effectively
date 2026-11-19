// Game-design mappings. These are thematic interpretations, not psychological diagnoses.
export const TYPE_COLORS = {
  Normal: '#A8A29E', Fire: '#F97352', Water: '#5B9FE7', Electric: '#F5C84C',
  Grass: '#68BA85', Ice: '#78CBE6', Fighting: '#D67C65', Poison: '#B17AD2',
  Ground: '#D7AC75', Flying: '#94B6E7', Psychic: '#E78DB8', Bug: '#93B85C',
  Rock: '#BAA482', Ghost: '#9683CE', Dragon: '#8277DF', Dark: '#74718E',
  Steel: '#92A8BD', Fairy: '#E8A9D5'
};

export const PAIR_TYPES = {
  '1-2':'Fairy','1-3':'Steel','1-4':'Ice','1-5':'Psychic','1-6':'Rock','1-7':'Electric','1-8':'Fighting','1-9':'Ground',
  '2-3':'Fire','2-4':'Water','2-5':'Bug','2-6':'Fairy','2-7':'Flying','2-8':'Dragon','2-9':'Grass',
  '3-4':'Fire','3-5':'Steel','3-6':'Normal','3-7':'Electric','3-8':'Dragon','3-9':'Normal',
  '4-5':'Ghost','4-6':'Dark','4-7':'Ghost','4-8':'Poison','4-9':'Water',
  '5-6':'Psychic','5-7':'Flying','5-8':'Poison','5-9':'Ice',
  '6-7':'Bug','6-8':'Fighting','6-9':'Rock',
  '7-8':'Dark','7-9':'Grass','8-9':'Ground'
};

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

export const HIDDEN_ABILITY_BY_TYPE = {
  Normal:'Adaptability',Fire:'Flash Fire',Water:'Water Absorb',Electric:'Motor Drive',
  Grass:'Natural Cure',Ice:'Ice Scales',Fighting:'Inner Focus',Poison:'Poison Heal',
  Ground:'Sand Force',Flying:'Gale Wings',Psychic:'Magic Guard',Bug:'Swarm',
  Rock:'Solid Rock',Ghost:'Cursed Body',Dragon:'Multiscale',Dark:'Infiltrator',
  Steel:'Clear Body',Fairy:'Friend Guard'
};

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

export const ROLE_MOVES = {
  Sweeper:{physical:['Swords Dance','Agility'],special:['Nasty Plot','Agility']},
  Wall:{physical:['Iron Defense','Protect'],special:['Light Screen','Protect']},
  Tank:{physical:['Bulk Up','Drain Punch'],special:['Calm Mind','Protect']},
  Pivot:{physical:['U-turn','Baton Pass'],special:['Volt Switch','Baton Pass']},
  Support:{physical:['Helping Hand','Reflect'],special:['Light Screen','Helping Hand']},
  Controller:{physical:['Taunt','Thunder Wave'],special:['Thunder Wave','Haze']}
};
export const GROWTH_MOVES = {
  1:{name:'Rest',reason:'Learning that worth is not earned by constant correction.'},
  2:{name:'Recover',reason:'Making room for your own needs, not only those of others.'},
  3:{name:'Helping Hand',reason:'Making success shared rather than merely visible.'},
  4:{name:'Calm Mind',reason:'Discovering steadiness beyond the pursuit of uniqueness.'},
  5:{name:'Baton Pass',reason:'Letting understanding become a gift to others.'},
  6:{name:'Substitute',reason:'Acting with courage even when certainty is incomplete.'},
  7:{name:'Endure',reason:'Learning that freedom also includes the ability to remain.'},
  8:{name:'Protect',reason:'Using strength to protect instead of always control.'},
  9:{name:'Work Up',reason:'Choosing to take up space and act with intention.'}
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
    enneagram:[74,24,50,83,18,28,92,31,40],
    bigfive:[77,39,89,54,52],
    typeOverride:'ESFP',tritypeOverride:'714'
  }
};
