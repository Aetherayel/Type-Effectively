// A playful, evidence-linked field report for the generated creature.
// Returned text never includes exact raw personality scores; the user already supplied them.
// Every statement is a metaphor about this generated build, not a diagnosis.
import { ENNEAGRAM_NAMES, STAT_KEYS, STAT_NAMES } from './data.mjs';
import { getDefensiveMatchups } from './matchups.mjs';

const words=n=>ENNEAGRAM_NAMES[n] || 'Unknown';
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
const ROLE_TEAM={
  Sweeper:'A teammate that sets up openings is gold; you are the follow-through.',
  Wall:'You buy time for the rest of the party. Just remember that surviving is a means, not the entire quest.',
  Tank:'You absorb the messy middle and keep pressure on. Your best partners appreciate reliable momentum.',
  Pivot:'You connect good positions to better ones. Staying in one place forever defeats the point.',
  Support:'You turn other people’s strengths into party-wide advantages. Support is a battle role, not a permission slip to disappear.',
  Controller:'You make the opponent play on different terms. Your allies still need space to act inside that plan.'
};
const motivationNotes={
  1:'quality and integrity',2:'connection and contribution',3:'effectiveness and achievement',
  4:'distinctiveness and meaning',5:'understanding and competence',6:'security and trustworthy commitments',
  7:'possibility and freedom',8:'agency and resolve',9:'peace and steadiness'
};

export function composeFieldReport(build,{bigFive,mbtiScores}) {
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
    weak.length ? 'Watch out for '+join(weak.slice(0,3))+' attacks. Type matchups remain gloriously indifferent to your self-awareness.' :
    'The typing avoids ordinary weaknesses. This is an excellent excuse to check the rest of the battle mechanics.';
  const shield=safe.length?'On the upside, '+join(safe.slice(0,3))+' gives you some particularly favorable defensive matchups.':'';
  const style=build.mbti.startsWith('I')?'more inward-facing':'more outward-facing';
  const pattern=build.mbti[1]==='N'?'possibility-oriented':'concrete-detail-oriented';
  const decisions=build.mbti[2]==='T'?'analysis-first':'people-aware';
  const workflow=build.mbti[3]==='J'?'plan-friendly':'adaptable';
  const cognitive='The '+build.mbti+' preference points toward a '+style+', '+pattern+', '+decisions+', '+workflow+
    ' approach. That is a playstyle sketch, not a rule you must follow.';
  let temperament;
  let twist;
  if(!bigFive){
    temperament='Big Five scores were not supplied, so this creature trained with neutral placeholder values. Any OCEAN commentary would be fan fiction; we will not pretend otherwise.';
    twist='Missing temperament data is the biggest wildcard in this build. The archetype is playable, but less personalized.';
  } else {
    const strong=bigFive.map((value,i)=>({value,key:highs[i],index:i}))
      .filter(item=>Math.abs(item.value-50)>=15)
      .sort((a,b)=>Math.abs(b.value-50)-Math.abs(a.value-50)||a.index-b.index).slice(0,3);
    temperament=strong.length ?
      'The clearer OCEAN signals suggest '+join(strong.map(item=>oceanNotes[item.key][item.value>=50?0:1]))+
      '. These are tendencies, not commands.' :
      'The five OCEAN scores sit fairly close to the midpoint. Instead of pretending that 51 means a dramatic character arc, this report treats the temperament as broadly balanced.';
    if(bigFive[0]>=65 && bigFive[1]>=65)
      twist='Interesting combination: high curiosity with high structure. The mind wants an unexplored region; the calendar wants the expedition planned.';
    else if(bigFive[0]>=65 && bigFive[1]<=40)
      twist='Curiosity has the keys and structure is riding in the back seat. Wonderful for discovery; bring a save point.';
    else if(bigFive[2]<=35 && effectiveStats.spe>=100)
      twist='A quieter social profile somehow produced a fast-moving Pokémon. Apparently talking less does not require taking fewer turns.';
    else if(bigFive[4]<=30 && severe.length)
      twist='Low reported stress sensitivity, high vulnerability to '+severe[0]+'. Confidence does not cancel the damage chart.';
    else if(bigFive[1]>=75 && role.primary.name==='Pivot')
      twist='A structured temperament paired with a Pivot role: you may love a plan, but your best move is knowing when to change positions.';
    else
      twist='Your strongest stats are '+join(top)+', yet your lowest is '+bottom.label+'. Even 535 base points require tradeoffs. The point is to play your build, not wish every stat were 140.';
  }
  const motivations='Core '+core+' ('+words(core)+') centers on '+motivationNotes[core]+
    '. Fix '+second+' ('+words(second)+') adds its own angle; fix '+third+' ('+words(third)+
    ') rounds out the trio. Those motives can cooperate without being the same thing.'+
    (build.typingWing!=null?' The '+build.typingWing+' wing adds a smaller influence to the primary typing.':' No wing was assumed for typing without supporting evidence.');
  const combat='The '+types.join(' / ')+' toolkit and '+join(top)+' lean toward '+role.primary.name+
    ': it '+ROLE_FLAIR[role.primary.name]+'. '+build.nature+' Nature shifts the balance after the fixed 535-point base-stat budget.'+
    (role.secondary?' '+role.secondary.name+' is a close secondary style; versatility has entered the chat.':'');
  const growth='Your core '+core+' growth move is '+build.moves[3].name+'. '+build.moves[3].why+
    ' This is the gentle nudge beyond the usual default strategy, not a verdict from a licensed Professor Oak.';
  const titleWhy=a.title+' pairs '+a.modeLabel.toLowerCase()+' with a '+a.role+' battle expression. '+
    a.signature+'. Your runner-up titles were '+join(a.alternatives.slice(0,2).map(item=>item.title))+
    '. All are game-design similarities, not odds of being that kind of person.';
  const confidence=a.margin<=1?'This was a photo finish: a tiny change could pick another title. That is a feature of close scoring, not an identity crisis.':
    a.margin<=3?'A few archetypes are close. Apparently even fictional creatures contain multitudes.':
    'This title has a clearer lead over the nearest alternative in the authored scoring model.';
  return {
    opener:a.gift+' '+a.modeJoke,
    motives:motivations,
    thinking:cognitive,
    temperament,
    combat,
    tradeoff:a.shadow+' '+a.modeSnag+'. '+risk+' '+shield,
    twist,
    team:ROLE_TEAM[role.primary.name],
    growth,
    reasoning:titleWhy+' '+confidence,
    caution:'Just for fun: these labels are authored metaphors based on self-reported inputs, not measured ability, clinical advice, or destiny. Actual type matchups remain actual type matchups.'
  };
}
