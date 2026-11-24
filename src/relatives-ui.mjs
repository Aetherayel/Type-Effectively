import { matchPokemon, pokemonArtworkUrl, pokemonSpriteUrl } from './relatives.mjs?v=v2-600-bst-1';
import { TYPE_COLORS } from './data.mjs';

let indexPromise;
let renderToken=0;

const escapeHtml = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const abilitySlug = text => String(text).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

function getIndex() {
  if (!indexPromise) {
    // A single local JSON request replaces hundreds of REST API requests.
    indexPromise=fetch(new URL('../data/pokedex.json',import.meta.url))
      .then(response=>{
        if(!response.ok)throw new Error('Could not load the Pokédex index.');
        return response.json();
      })
      .then(data=>{
        if(!Array.isArray(data.pokemon))throw new Error('Pokédex index is incomplete.');
        return data;
      }).catch(error=>{
        indexPromise=null; // A temporary network failure should not poison the cache.
        throw error;
      });
  }
  return indexPromise;
}

function typeBadges(types) {
  return types.map(type=>'<span class="relative-type" style="--relative-type:'+ (TYPE_COLORS[type]||'#91aba9')+'">'+escapeHtml(type)+'</span>').join('');
}

function pokemonCard(pokemon,context,abilityName) {
  const label=context==='stat'?'Match distance '+pokemon.match.score.toFixed(1)+' · BST '+pokemon.match.bst:
    context==='ability'?(pokemon.abilities.find(a=>a.name===abilitySlug(abilityName))?.hidden?'Hidden on species':'Available ability') :
    'BST '+pokemon.match.bst;
  return '<li class="relative-card">'+
    '<div class="relative-art"><img src="'+pokemonArtworkUrl(pokemon.id)+'" alt="'+escapeHtml(pokemon.name)+' artwork" loading="lazy" decoding="async" data-pokemon-art="'+pokemon.id+'"/>'+
    '<span class="relative-image-fallback hidden" aria-hidden="true">◇</span></div>'+
    '<div class="relative-card-copy"><strong>'+escapeHtml(pokemon.name)+'</strong>'+
    '<div class="relative-types">'+typeBadges(pokemon.types)+'</div>'+
    '<span class="relative-detail">'+escapeHtml(label)+'</span>'+
    '</div></li>';
}

function section(label,title,description,items,context,abilityName) {
  const list=items.length ? '<ul class="relative-grid">'+items.map(p=>pokemonCard(p,context,abilityName)).join('')+'</ul>' :
    '<p class="relative-empty">No matches found in this Pokédex snapshot.</p>';
  return '<section class="relative-group"><div class="relative-group-heading"><span class="relative-overline">'+escapeHtml(label)+'</span><h5>'+escapeHtml(title)+'</h5><p>'+escapeHtml(description)+'</p></div>'+list+'</section>';
}

function renderMatches(build,matches,meta) {
  const typing=build.types.join(' / ');
  const typeIntro=matches.typeKind==='exact'
    ? 'Same '+(build.types.length===1?'single':'dual')+' typing as your build, ordered by stat resemblance.'
    : matches.typeKind==='overlap'
      ? 'No exact '+typing+' match in this snapshot. These Pokémon share at least one type.'
      : 'No Pokémon in this snapshot share your typing.';
  const typeTitle=matches.typeKind==='exact'?'Type twins':'Type neighbors';
  const typeCount=matches.typeKind==='exact' ? matches.typeTotal+' total matches' : 'closest available';
  return '<div class="relatives-content">'+
    '<div class="relatives-heading"><span class="relatives-index">BONUS DISCOVERY / 004</span><h4>Meet your <em>relatives.</em></h4>'+
    '<p>Actual Pokémon. Suspiciously similar statistics. Absolutely no family resemblance required.</p></div>'+
    section('01 / TYPE MATCH · '+typeCount,typeTitle,typeIntro,matches.typeTwins,'type')+
    section('02 / BASE STATS','Stat siblings','Closest six-stat shapes, scaled to your build’s BST for comparison, with a small penalty for different BSTs.',matches.statSiblings,'stat')+
    section('03 / STANDARD ABILITY',build.ability.name,'Pokémon that can actually have your standard Ability, in regular or hidden slots.',matches.standardAbility,'ability',build.ability.name)+
    section('04 / HIDDEN ABILITY',build.hiddenAbility,'Pokémon that can actually have your alternate Hidden Ability, regardless of its slot.',matches.hiddenAbility,'ability',build.hiddenAbility)+
    '<p class="relatives-source">Compared against '+matches.sampleSize.toLocaleString('en-US')+' Pokémon and forms. Stats and abilities: '+
    '<a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer">PokéAPI ↗</a>. Artwork: '+
    '<a href="https://github.com/PokeAPI/sprites" target="_blank" rel="noopener noreferrer">PokéAPI sprites ↗</a>. Pokémon artwork and names belong to their respective rights holders. '+
    'Results are reference matches, not claims about personality.</p></div>';
}

function attachImageFallbacks(container) {
  container.querySelectorAll('[data-pokemon-art]').forEach(img=>{
    const id=Number(img.dataset.pokemonArt);
    let fallbackUsed=false;
    img.addEventListener('error',()=>{
      if(!fallbackUsed){
        fallbackUsed=true;
        img.src=pokemonSpriteUrl(id);
      }else{
        img.classList.add('hidden');
        img.nextElementSibling?.classList.remove('hidden');
      }
    });
  });
}

/**
 * Renders below the completed card. Failure is intentionally non-blocking:
 * a fully generated personality build must remain usable if Pokédex data fails.
 */
export async function renderRelatives(build,resultContainer) {
  const token=++renderToken;
  const mount=document.createElement('div');
  mount.className='relatives';
  mount.setAttribute('aria-live','polite');
  mount.innerHTML='<div class="relatives-loading"><span class="relatives-loader" aria-hidden="true"></span><p>Checking the Pokédex for suspicious similarities…</p></div>';
  resultContainer.append(mount);
  try{
    const index=await getIndex();
    if(token!==renderToken || !mount.isConnected)return;
    const matches=matchPokemon(build,index.pokemon);
    mount.innerHTML=renderMatches(build,matches,index);
    attachImageFallbacks(mount);
  }catch(error){
    if(token!==renderToken || !mount.isConnected)return;
    mount.innerHTML='<div class="relatives-unavailable"><strong>Pokédex temporarily unavailable.</strong><p>Your personality build is complete; the extra Pokémon comparisons could not load.</p>'+
      '<button type="button" class="relatives-retry">Retry Pokémon comparisons ↻</button></div>';
    mount.querySelector('.relatives-retry')?.addEventListener('click',()=>{
      mount.remove();
      renderRelatives(build,resultContainer);
    });
  }
}
