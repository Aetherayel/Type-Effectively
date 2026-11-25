// A playful, evidence-linked field report for the generated creature.
// Returned text never includes exact raw personality scores; the user already supplied them.
// Every statement is a metaphor about this generated build, not a diagnosis.
import { ENNEAGRAM_NAMES, STAT_KEYS, STAT_NAMES, toReferenceStats } from './data.mjs';
import { getDefensiveMatchups } from './matchups.mjs';
import { facetFieldObservations } from './facet-outcomes.mjs';

const words=n=>ENNEAGRAM_NAMES[n] || 'Unknown';
// Archetype gifts are complete third-person sentences: “Finds a route.”
// Convert the first verb only when explicitly adding “This Pokémon” as subject.
const lowerInitial=text=>text.charAt(0).toLowerCase()+text.slice(1);
const sentence=text=>/[.!?]$/.test(text.trim())?text.trim():text.trim()+'.';
const join=xs=>xs.length<2 ? xs.join('') : xs.length===2 ? xs.join(' and ') : xs.slice(0,-1).join(', ')+', and '+xs.at(-1);
const highs=['openness','conscientiousness','extraversion','agreeableness','neuroticism'];
const oceanNotes={
  openness:['a fondness for new angles, unusual ideas, and unexplored map tiles','a preference for familiar routes and ideas that have earned their keep'],
  conscientiousness:['a tendency to organize the inventory before entering the cave','a willingness to improvise instead of filing a permit for every quest'],
  extraversion:['energy for rapid exchanges and sharing the spotlight','a preference for thinking before broadcasting every thought'],
  agreeableness:['a habit of making room for teammates','a readiness to challenge the party when the plan seems wrong'],
  neuroticism:['a sharper sensitivity to potential trouble','an easier time keeping the panic soundtrack muted']
};
const ROLE_FLAIR={
  Sweeper:'gets results by striking before an opponent settles in',
  Wall:'wins by staying power, patience, and refusing to be conveniently knocked over',
  Tank:'takes a hit and still has a point to make',
  Pivot:'changes the angle, creates an opening, and hands the next turn to the right teammate',
  Support:'makes everyone else look suspiciously well prepared',
  Controller:'changes the terms of the fight rather than merely trading blows'
};

const DEX_ROLE={
  Sweeper:'strikes before its opponents can settle into a strategy',
  Wall:'stands its ground while the entire battle changes around it',
  Tank:'takes a hit, studies the situation, and answers in kind',
  Pivot:'appears wherever the next opening is about to form',
  Support:'quietly makes nearby teammates considerably harder to defeat',
  Controller:'rearranges the battlefield until opponents forget whose turn it was'
};
const DEX_QUIRK={
  strategist:'Wild specimens have been seen rehearsing encounters that have not happened yet',
  steward:'It keeps track of its companions’ supplies, including supplies they insist they do not need',
  pathfinder:'It investigates every side path, occasionally discovering the one it started on',
  sentinel:'It examines suspicious patches of grass before accepting an entirely ordinary Berry',
  catalyst:'It has been known to begin the next battle before its trainer finishes counting down',
  artisan:'It collects peculiar combinations of ideas, several of which unexpectedly work'
};
const ROLE_DRILLS={
  Sweeper:'Practice recognizing the opening before committing to the strike.',
  Wall:'Reward smart endurance and knowing when to let an ally take the turn.',
  Tank:'Practice staying effective after taking a hit; trading damage is not the only available strategy.',
  Pivot:'Drill the switch and handoff. Leaving at the right moment is part of winning.',
  Support:'Reward well-timed help rather than judging success by personal damage.',
  Controller:'Practice changing the opponent’s options without trapping the whole team in the plan.'
};
const ROLE_PARTNERS={
  Sweeper:'Pair it with a teammate that can create safe attacking windows.',
  Wall:'Pair it with an ally that can convert all that protected time into progress.',
  Tank:'Pair it with a partner that can cover its blind spots while it holds the line.',
  Pivot:'Pair it with a teammate that benefits from the openings it creates.',
  Support:'Pair it with an ally that can turn support into a decisive finish.',
  Controller:'Pair it with an ally that can capitalize when the opponent runs out of good options.'
};

const ROLE_TEAM={
  Sweeper:'Bring a teammate that sets up openings. This Pokémon specializes in the follow-through.',
  Wall:'Use its staying power to buy the party time, then let someone else turn that time into progress.',
  Tank:'Let it handle the messy middle; a partner that covers weak matchups keeps the pressure useful.',
  Pivot:'Use it to connect good positions to better ones. Keeping it in forever defeats the point.',
  Support:'Let it improve the party’s odds; support is a battle role, not a reason to bench its own strengths.',
  Controller:'Let it shape the field, then give allies room to act inside the new conditions.'
};
const motivationNotes={
  1:'quality and integrity',2:'connection and contribution',3:'effectiveness and achievement',
  4:'distinctiveness and meaning',5:'understanding and competence',6:'security and trustworthy commitments',
  7:'possibility and freedom',8:'agency and resolve',9:'peace and steadiness'
};

export function composeFieldReport(build,{bigFive,mbtiScores,facetContrasts=null}) {
  const {archetype:a,role,baseStats,effectiveStats,types,core,second,third}=build;
  const ranked=STAT_KEYS.map((key,i)=>({key,label:STAT_NAMES[i],value:effectiveStats[key]}))
    .sort((x,y)=>y.value-x.value || STAT_KEYS.indexOf(x.key)-STAT_KEYS.indexOf(y.key));
  const top=ranked.slice(0,2).map(x=>x.label);
  const bottom=ranked.at(-1);
  const defense=getDefensiveMatchups(types);
  const severe=defense.quadWeak.map(x=>x.type);
  const weak=defense.weak.map(x=>x.type);
  const safe=[...defense.immune,...defense.strongResist].map(x=>x.type);
  const risk=severe.length ? 'Watch out for '+join(severe)+' attacks: that is a four-times weakness, not a personality flaw.' :
    weak.length ? 'Watch out for '+join(weak.slice(0,3))+' attacks. The type chart does not care how confident this Pokémon feels.' :
    'The typing avoids ordinary weaknesses. This is an excellent excuse to check the rest of the battle mechanics.';
  const shield=safe.length?'On the upside, '+join(safe.slice(0,3))+' gives you some particularly favorable defensive matchups.':'';
  const style=build.mbti.startsWith('I')?'more inward-facing':'more outward-facing';
  const pattern=build.mbti[1]==='N'?'possibility-oriented':'concrete-detail-oriented';
  const decisions=build.mbti[2]==='T'?'analysis-first':'people-aware';
  const workflow=build.mbti[3]==='J'?'plan-friendly':'adaptable';
  const cognitive='Expect a '+style+', '+pattern+', '+decisions+', '+workflow+
    ' approach, reflecting its '+build.mbti+' preference. Offer it room to use that style without assuming every encounter will play the same way.';
  let temperament;
  let twist;
  if(!bigFive){
    temperament='No measured Big Five scores were supplied for this specimen. Its temperament was estimated with neutral placeholders; do not mistake the Professor’s guesswork for observed behavior.';
    twist='The temperament data is missing. Treat this as a provisional field guide: get some actual observations before declaring what makes this Pokémon tick.';
  } else if(build.facetScoring.activeDomains.length) {
    temperament='This Pokémon has detailed IPIP-NEO evidence for '+build.facetScoring.activeDomains.join(', ')+
      '. The Trainer’s Guide looks at the specific facet signals rather than pretending a broad-domain average tells the whole story.';
    twist='Its modeled affinities and final battle stats describe different things. A strong personality tendency can still receive fewer of the fixed 600 battle-stat points when other tendencies dominate.';
  } else {
    const strong=bigFive.map((value,i)=>({value,key:highs[i],index:i}))
      .filter(item=>Math.abs(item.value-50)>=15)
      .sort((a,b)=>Math.abs(b.value-50)-Math.abs(a.value-50)||a.index-b.index).slice(0,3);
    temperament=strong.length ?
      'In training, watch for '+join(strong.map(item=>oceanNotes[item.key][item.value>=50?0:1]))+
      '. Work with these tendencies; do not turn them into rigid commands.' :
      'The five OCEAN scores sit fairly close to the midpoint. Observe how this Pokémon handles different situations before declaring an elaborate temperament based on a 51.';
    if(bigFive[0]>=65 && bigFive[1]>=65)
      twist='Interesting combination: high curiosity with high structure. The mind wants an unexplored region; the calendar wants the expedition planned.';
    else if(bigFive[0]>=65 && bigFive[1]<=40)
      twist='Curiosity has the keys and structure is riding in the back seat. Wonderful for discovery; bring a save point.';
    else if(bigFive[2]<=35 && toReferenceStats(effectiveStats).spe>=100)
      twist='A quieter social profile somehow produced a fast-moving Pokémon. Apparently talking less does not require taking fewer turns.';
    else if(bigFive[4]<=30 && severe.length)
      twist='Low reported stress sensitivity, high vulnerability to '+severe[0]+'. Confidence does not cancel the damage chart.';
    else if(bigFive[1]>=75 && role.primary.name==='Pivot')
      twist='A structured temperament paired with a Pivot role: it may prefer a plan, yet its best move is knowing when to change positions.';
    else
      twist='Its strongest stats are '+join(top)+', but '+bottom.label+' trails behind. A 600-point creature cannot have everything. Train its actual strengths instead of trying to make all six numbers 180.';
  }
  // Distinct facet patterns provide specific field observations, not generic
  // rewards. Most facets are expressed through the stats, archetype or item;
  // only conspicuous additional nuances receive a small trainer note.
  const facetObservations=facetFieldObservations(facetContrasts);
  if(facetObservations.length)temperament+=' The detailed IPIP-NEO report suggests a couple of quirks: '+
    facetObservations.map(item=>item.text).join(' ')+
    ' These are striking reported facet scores relative to a neutral game reference, not fixed behavior.';
  const motivations='This species is primarily driven by '+motivationNotes[core]+' (Enneagram '+core+', '+words(core)+
    '). Its '+second+' ('+words(second)+') and '+third+' ('+words(third)+
    ') fixes add supporting instincts. Trainer tip: understand what gets it moving before asking it to act against that instinct.'+
    (build.typingWing!=null?' An evidenced '+build.typingWing+' wing slightly influences its primary typing.':' No unverified wing was assumed for typing.');
  const combat='Deploy this '+types.join(' / ')+' Pokémon as a '+role.primary.name+': it '+ROLE_FLAIR[role.primary.name]+
    '. Its strongest effective stats are '+join(top)+'. '+build.nature+' Nature modifies the base spread after the fixed 600-point budget.'+
    (role.secondary?' '+role.secondary.name+' is a close alternative style; keep a second plan in the bag.':'');
  const growth='Teach and reinforce '+build.moves[3].name+', the growth move associated with core '+core+'. '+
    sentence(build.moves[3].why)+' The goal is to expand the Pokémon’s options beyond its favorite trick, not to schedule it a therapy appointment.';
  const titleWhy=a.title+' pairs '+a.modeLabel.toLowerCase()+' with a '+a.role+' battle expression. '+
    'The field guide sums up its pattern as “'+a.signature+'”. Other close classifications for this specimen were '+
    join(a.alternatives.slice(0,2).map(item=>item.title))+
    '. All are game-design similarities, not odds of being that kind of person.';
  const confidence=a.margin<=1?'This was a photo finish: a tiny change could pick another title. That is a feature of close scoring, not an identity crisis.':
    a.margin<=3?'A few archetypes are close. Apparently even fictional creatures contain multitudes.':
    'This title has a clearer lead over the nearest alternative in the authored scoring model.';
  const dexEntry='This '+types.join(' / ')+'-type Pokémon '+DEX_ROLE[role.primary.name]+'. '+DEX_QUIRK[a.mode]+'.';
  const roleMove=build.moves[2].name;
  const growthMove=build.moves[3].name;
  const matchups=severe.length?'Keep it away from '+join(severe)+' attacks (4× damage), or bring a partner that can take the hit.':
    weak.length?'Plan a safe switch against '+join(weak.slice(0,3))+' attacks, where it takes extra damage.':
    'It has no ordinary type weaknesses, but do not confuse a favorable chart with invincibility.';
  const trainerTips=[
    {label:'HONE ITS EDGE',title:'Train the job it already does well',
      text:'Practice '+roleMove+' in '+role.primary.name+' scenarios. '+ROLE_DRILLS[role.primary.name]+
        ' Work with its strongest effective stats: '+join(top)+'.'},
    {label:'PACK COVERAGE',title:'Protect the weak matchups',
      text:matchups+' '+ROLE_PARTNERS[role.primary.name]},
    {label:'LEVEL UP',title:'Teach it one move beyond instinct',
      text:'Give '+growthMove+' deliberate practice. '+sentence(build.moves[3].why)+
        ' There is no XP bonus for practicing only what is already comfortable.'}
  ];
  return {
    dexEntry,trainerTips,
    opener:'This Pokémon '+lowerInitial(sentence(a.gift))+' '+sentence(a.modeJoke),
    motives:motivations,
    thinking:cognitive,
    temperament,
    combat,
    tradeoff:'Trainer caution: '+sentence(a.shadow)+' A recurring blind spot is '+a.modeSnag+'. '+
      risk+(shield?' '+shield:''),
    twist,
    team:ROLE_TEAM[role.primary.name],
    growth,
    reasoning:titleWhy+' '+confidence,
    caution:'Unofficial trainer notes, not canon Pokédex lore or clinical advice. Personality interpretations are playful metaphors from self-reported scores; Pokémon type matchups follow the game chart.'
  };
}
