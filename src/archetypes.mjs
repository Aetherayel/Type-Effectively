// Archetypes are game-design metaphors for the completed build, not personality diagnoses.
// Six distinct ways of approaching problems x six tactical expressions = 36 curated identities.
// Every candidate is scored on Enneagram (25%), MBTI-style dimensions (20%),
// Big Five (25%), and the already computed battle profile (30%).
// Battle scores already incorporate typing and stats: do not score them again.

const clamp = x => Math.max(0,Math.min(100,x));
const fit = (values,ideal) => clamp(100-Math.sqrt(
  values.reduce((sum,x,i)=>sum+(x-ideal[i])**2,0)/values.length
));
const modes = [
  {
    id:'strategist',label:'The strategic mind',
    ennea:[88,30,75,45,98,75,38,52,48],mbti:[82,85,24,22,30],ocean:[83,88,32,46,28],
    gift:'turning loose observations into a plan that survives contact with reality',
    snag:'mistaking one more round of preparation for the actual first move',
    joke:'It has reportedly prepared contingency plans for a picnic.'
  },
  {
    id:'steward',label:'The steady hand',
    ennea:[72,96,48,58,40,84,35,42,95],mbti:[65,52,85,30,38],ocean:[63,83,45,94,30],
    gift:'making the people and systems around you stronger',
    snag:'carrying the whole party when some teammates need to level up themselves',
    joke:'It packs spare Potions for teammates who insist they brought their own.'
  },
  {
    id:'pathfinder',label:'The open horizon',
    ennea:[38,55,62,75,81,43,98,68,68],mbti:[58,89,55,88,38],ocean:[97,42,66,60,42],
    gift:'finding a route where everyone else sees a wall',
    snag:'confusing an exciting detour with an important destination',
    joke:'It has found three side quests before finishing the tutorial.'
  },
  {
    id:'sentinel',label:'The watchful eye',
    ennea:[91,46,55,52,78,100,30,77,69],mbti:[77,60,28,25,65],ocean:[66,94,29,47,58],
    gift:'seeing the weak point early and making sure the team is ready',
    snag:'turning sensible caution into a fortress nobody asked to live in',
    joke:'It once searched a suspicious patch of tall grass for ambushes. It was a lawn.'
  },
  {
    id:'catalyst',label:'The driving spark',
    ennea:[51,56,96,34,35,49,91,98,33],mbti:[23,55,28,70,25],ocean:[68,73,97,39,29],
    gift:'turning intention into momentum and bringing others along',
    snag:'moving the whole team before everyone agrees on the destination',
    joke:'It tends to plan turn three before the opponent has taken turn one.'
  },
  {
    id:'artisan',label:'The imaginative maker',
    ennea:[65,76,55,100,79,48,77,33,59],mbti:[72,98,75,67,56],ocean:[99,64,43,80,55],
    gift:'finding surprising connections and shaping something distinctive',
    snag:'polishing the interesting detail long after the main quest has moved on',
    joke:'Its item descriptions have occasionally acquired item descriptions of their own.'
  }
];

// Export a read-only prototype snapshot for reachability regression tests.
export const ARCHETYPE_PROTOTYPES = Object.freeze(modes.map(({id,ennea,mbti,ocean})=>Object.freeze({
  id,ennea:Object.freeze([...ennea]),mbti:Object.freeze([...mbti]),ocean:Object.freeze([...ocean])
})));

// Columns: Sweeper, Wall, Tank, Pivot, Support, Controller.
// Names, signatures, and pressure points are individually authored, not concatenated labels.
const identities = {
  strategist:[
    ['Tactician','Wins before the first hit lands','Finds the cleanest line through complicated opposition.','When the plan changes, do not spend the entire turn renaming the plan.'],
    ['Bastion','A fortress with a blueprint','Protects the long game through deliberate endurance.','Not every inconvenience calls for a reinforced wall.'],
    ['Architect','Builds systems that hold under pressure','Turns careful understanding into reliable force.','A perfect design cannot take a turn for you.'],
    ['Chessmaster','Two moves ahead, occasionally three','Repositions the fight to make every exchange count.','A pivot is useful only if you eventually commit somewhere.'],
    ['Adviser','Turns insight into an ally’s advantage','Makes the team better by seeing what others miss.','Explaining the strategy is not the same as letting others play.'],
    ['Oracle','Reads the battlefield like a diagram','Controls outcomes through foresight and precision.','The future has an annoying habit of improvising.']
  ],
  steward:[
    ['Champion','Fights for something beyond the scoreboard','Uses strength to make room for everyone else.','You can protect others without fighting every battle for them.'],
    ['Keeper','Keeps the party standing','Absorbs pressure so others can keep moving.','Being needed is not the same as being available forever.'],
    ['Warden','Reliable strength at the front line','Makes duty feel like an actual defensive stat.','Set the shield down occasionally. The campfire is safe.'],
    ['Wayfinder','Moves the team without losing anyone','Finds openings and brings the whole party through.','You do not need unanimous consent to use an escape rope.'],
    ['Healer','The reason everyone survived the boss','Creates room for recovery, growth, and second chances.','Please remember your own HP bar exists.'],
    ['Shepherd','Directs the fight with care','Guides the field so teammates can do their best work.','A teammate is not a side quest to complete.']
  ],
  pathfinder:[
    ['Trailblazer','First through the unfamiliar door','Turns curiosity into decisive exploration.','New ground is great; remember to save the game.'],
    ['Survivor','Hard to pin down, harder to stop','Endures surprises and discovers another way forward.','Sometimes a safe campsite is better than another cave.'],
    ['Ranger','Adaptable strength far from the map','Handles uncertainty without surrendering momentum.','Independent does not have to mean unreachable.'],
    ['Pathfinder','Always finds another route','Changes position when the terrain changes.','Not every fork in the road needs to be investigated.'],
    ['Scout','Spots opportunity before the team arrives','Brings useful discoveries back to the group.','Information gets better when you actually share it.'],
    ['Cartographer','Maps possibilities others overlooked','Creates options by mastering the shape of the field.','A map is meant to be used, not endlessly expanded.']
  ],
  sentinel:[
    ['Enforcer','The answer to a looming threat','Confronts trouble before it reaches the team.','Double-check that the threat is real before using your ultimate.'],
    ['Bulwark','Prepared for the attack that never came','Holds the line with disciplined consistency.','The best defense still leaves room for living.'],
    ['Sentinel','Alert, armored, and hard to move','Balances vigilance with dependable frontline strength.','You may remove the helmet indoors.'],
    ['Watchman','Always watching the flank','Stays mobile to prevent one small problem becoming six.','You cannot guard every doorway at once.'],
    ['Guardian','Keeps the team out of trouble','Makes preparedness a shared advantage.','Risk can be managed without cancelling the adventure.'],
    ['Gatekeeper','Sets the terms of engagement','Limits chaos through boundaries and timing.','A closed gate is not the only kind of boundary.']
  ],
  catalyst:[
    ['Vanguard','Hits the button marked GO','Creates the opening through sheer initiative.','Momentum is a tool, not a destination.'],
    ['Defiant','Refuses to stay down','Stands firm through pressure and pulls others onward.','Not every pause is a defeat.'],
    ['Firebrand','Turns pressure into action','Meets the challenge directly and keeps moving.','The rest of the team might appreciate a countdown.'],
    ['Spark','One opening becomes three','Changes position fast enough to create new possibilities.','Your allies cannot follow a plan they have not heard.'],
    ['Rallier','Gets the whole party moving','Turns personal energy into collective momentum.','Enthusiasm still needs an inventory check.'],
    ['Conductor','Sets the tempo of the battle','Makes action arrive in the right order.','Other players also have a turn button.']
  ],
  artisan:[
    ['Virtuoso','Expressive and surprisingly dangerous','Finds a distinctive way to win the exchange.','Style points are not always damage points.'],
    ['Conservator','Preserves what makes the party unique','Protects fragile strengths until they can shine.','Do not encase every beautiful idea in glass.'],
    ['Forgemaster','Crafts strength from odd materials','Makes unusual pieces work together under pressure.','Eventually the sword must leave the forge.'],
    ['Trickster','Improvisation with excellent timing','Finds the unexpected angle and makes it useful.','An elaborate feint is still supposed to lead somewhere.'],
    ['Muse','Makes the whole team more inventive','Draws out overlooked possibilities in others.','Inspiration needs a next action, not only a mood board.'],
    ['Alchemist','Turns patterns into strange advantages','Transforms a complicated field into creative control.','Keep one notebook for observations, not seventeen.']
  ]
};

export const ARCHETYPE_WEIGHTS = Object.freeze({
  motivation:.25,cognition:.20,temperament:.25,battle:.30
});
export const ARCHETYPE_CATALOG = Object.freeze(modes.flatMap(mode=>
  identities[mode.id].map(([name,signature,gift,shadow],index)=>Object.freeze({
    id:mode.id+'-'+['sweeper','wall','tank','pivot','support','controller'][index],
    title:'The '+name,mode:mode.id,role:['Sweeper','Wall','Tank','Pivot','Support','Controller'][index],
    signature,gift,shadow
  }))
));

export function classifyArchetype({enneagramScores,mbtiScores,bigFive,mbti,core,second,third,role}) {
  if(enneagramScores?.length!==9 || mbtiScores?.length!==5 || bigFive?.length!==5 ||
    !role?.all?.length) throw new Error('Archetype classification requires a complete build.');
  // Manual type overrides change the preferred pole but preserve the reported intensity.
  const letters=['I','N','F','P'];
  const cognitive=mbtiScores.map((value,i)=>i===4 ? value :
    50+(mbti[i]===letters[i]?1:-1)*Math.abs(value-50));
  const avgRole=role.all.reduce((sum,x)=>sum+x.score,0)/role.all.length;
  const scored=ARCHETYPE_CATALOG.map((candidate,index)=>{
    const mode=modes.find(item=>item.id===candidate.mode);
    const rawMotivation=fit(enneagramScores,mode.ennea);
    const motivation=clamp(.69*rawMotivation+
      .18*mode.ennea[core-1]+.09*mode.ennea[second-1]+.04*mode.ennea[third-1]);
    const cognition=fit(cognitive,mode.mbti);
    const temperament=fit(bigFive,mode.ocean);
    const roleValue=role.all.find(r=>r.name===candidate.role)?.score ?? 0;
    // Role fit already incorporates stat shape and visible type toolkit.
    const battle=clamp(50+1.7*(roleValue-avgRole));
    const breakdown={motivation:Math.round(motivation),cognition:Math.round(cognition),
      temperament:Math.round(temperament),battle:Math.round(battle)};
    const score=ARCHETYPE_WEIGHTS.motivation*motivation+
      ARCHETYPE_WEIGHTS.cognition*cognition+
      ARCHETYPE_WEIGHTS.temperament*temperament+
      ARCHETYPE_WEIGHTS.battle*battle;
    return {candidate,mode,index,score,breakdown};
  }).sort((a,b)=>b.score-a.score || a.index-b.index);
  const winner=scored[0];
  return {
    ...winner.candidate,
    modeLabel:winner.mode.label,modeGift:winner.mode.gift,
    modeSnag:winner.mode.snag,modeJoke:winner.mode.joke,
    score:Math.round(winner.score),breakdown:winner.breakdown,
    alternatives:scored.slice(1,4).map(item=>({
      title:item.candidate.title,score:Math.round(item.score)
    })),
    margin:Math.round((winner.score-scored[1].score)*10)/10,
    method:'36 curated identities · motivation 25 / cognition 20 / temperament 25 / battle 30'
  };
}
