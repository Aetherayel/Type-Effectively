// Optional facet influences beyond stat affinities. All adjustments are small
// refinements of *existing* classification inputs. No new source weighting,
// ability, move eligibility, or Pokémon mechanics are created here.
import { FACET_KEYS, FACET_REFINEMENTS } from './bigfive-facets.mjs';

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const frozenFocus=groups=>Object.freeze(Object.fromEntries(
  Object.entries(groups).map(([key,values])=>[key,Object.freeze(values)])
));

// Archetype facets fine-tune only the 25% Big Five *temperament fit*.
// They never replace Enneagram motivation, cognition or battle-role fit.
export const ARCHETYPE_FACET_FOCI=frozenFocus({
  strategist:{O5:.7,C2:1,C6:.6},          // conceptual care and prepared order
  steward:{A3:1,A4:.8,A6:.7,E1:.35},     // practical care, cooperation, warmth
  pathfinder:{O4:1,E5:.6},               // adventure and exploration
  sentinel:{C6:1,C3:.7,C2:.3},           // caution, duty and preparation
  catalyst:{E3:.85,E4:1,E6:.45},         // direct momentum and energetic tone
  artisan:{O1:.8,O2:1,O3:.45}            // imagination and aesthetic feeling
});

// Equipment preference is a small tiebreaker *within the existing family fit*.
// The normal item eligibility rules still apply, and specialized package items
// remain controlled entirely by the package's mechanics.
export const ITEM_FACET_FOCI=frozenFocus({
  control:{C2:.7,O5:.3},
  protection:{C6:1},
  recovery:{C5:1},
  ambition:{C4:.65,E3:.35},
  risk:{O4:.65,E5:.35},
  adaptability:{O4:.6,E4:.4},
  preparation:{C6:.7,C2:.3},
  persistence:{C5:1},
  support:{A3:.50,A4:.30,A6:.20}
});

export const ARCHETYPE_FACET_CAP=6; // at most 6 fit points within temperament
export const ITEM_FACET_CAP=4;      // at most 4 points within item-family fit

function weightedContrast(focus,contrasts) {
  if(!focus || !contrasts)return 0;
  let sum=0,total=0;
  for(const [key,weight] of Object.entries(focus)) {
    if(contrasts[key]==null)continue;
    sum+=contrasts[key]/30*weight;
    total+=weight;
  }
  return total?clamp(sum/total,-1,1):0;
}

export function archetypeFacetAdjustment(mode,contrasts) {
  return ARCHETYPE_FACET_CAP*weightedContrast(ARCHETYPE_FACET_FOCI[mode],contrasts);
}

export function itemFacetAdjustment(family,contrasts) {
  return ITEM_FACET_CAP*weightedContrast(ITEM_FACET_FOCI[family],contrasts);
}

// These are narrative distinctions, not judgments about wellness, honesty,
// intelligence, virtue, or success. Notes are only shown for marked within-
// domain differences (>=18 reported percentile ranks from parent domain).
const FIELD_OBSERVATIONS=Object.freeze({
  O3:Object.freeze({
    high:'It notices the emotional atmosphere of a place, even without a quest marker.',
    low:'It would rather examine the quest mechanics than linger over the soundtrack.'
  }),
  E1:Object.freeze({
    high:'It greets potential party members before checking whether they know the mission.',
    low:'It prefers a little trust earned in battle before exchanging friend codes.'
  }),
  E2:Object.freeze({
    high:'It likes a bustling guild hall more than its overall social score suggests.',
    low:'It chooses a smaller party even when it has plenty of energy for adventuring.'
  }),
  E6:Object.freeze({
    high:'Its victory fanfare has a habit of starting a turn early.',
    low:'Its celebrations are understated enough to be mistaken for a status menu.'
  }),
  A1:Object.freeze({
    high:'It tends to give teammates the benefit of the doubt before checking their inventory.',
    low:'It likes to verify the map before trusting an unfamiliar guide.'
  }),
  A5:Object.freeze({
    high:'It has trouble accepting a medal without passing credit to the whole party.',
    low:'It is comfortable acknowledging a victory it worked hard to earn.'
  }),
  N4:Object.freeze({
    high:'It may recheck its moves when the entire stadium is watching.',
    low:'A crowded arena rarely changes how it chooses its next move.'
  }),
  N5:Object.freeze({
    high:'A tempting side quest sometimes demands more restraint than the main boss.',
    low:'It usually keeps a spare Potion for later instead of using it at the first temptation.'
  })
});

export const EXCLUDED_DIRECT_FACETS=Object.freeze(['O6','A2','N3']);
// Exclusion is from *independent facet effects*, not the measured parent domain.
export function facetOutcomeAudit() {
  const stat=new Set(Object.values(FACET_REFINEMENTS).flatMap(rules=>
    rules.flatMap(rule=>Object.keys(rule.focus))));
  const archetype=new Set(Object.values(ARCHETYPE_FACET_FOCI).flatMap(Object.keys));
  const item=new Set(Object.values(ITEM_FACET_FOCI).flatMap(Object.keys));
  const narrative=new Set(Object.keys(FIELD_OBSERVATIONS));
  const excluded=new Set(EXCLUDED_DIRECT_FACETS);
  return FACET_KEYS.map(key=>({
    key,
    effects:[
      ...(stat.has(key)?['stat']:[]),
      ...(archetype.has(key)?['archetype']:[]),
      ...(item.has(key)?['held-item']:[]),
      ...(narrative.has(key)?['trainer-guide']:[])
    ],
    excluded:excluded.has(key)
  }));
}

export function facetFieldObservations(contrasts) {
  if(!contrasts)return [];
  return Object.entries(FIELD_OBSERVATIONS)
    .map(([key,lines])=>({
      key,delta:contrasts[key],text:contrasts[key]>=0?lines.high:lines.low
    }))
    .filter(item=>item.delta!=null&&Math.abs(item.delta)>=18)
    .sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)||a.key.localeCompare(b.key))
    .slice(0,2)
    .map(({key,text})=>({key,text}));
}
