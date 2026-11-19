// PokeAPI's game item icons: one lightweight PNG per held item.
// The full 72-item catalog was checked against the sprites/items repository.
// Items with apostrophes use PokéAPI-style slugs (King's Rock -> kings-rock).
export const ITEM_SPRITE_ROOT='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/';

export function itemSpriteSlug(name) {
  if(typeof name!=='string' || !/^[A-Za-z0-9'’ -]+$/.test(name.trim()))
    throw new Error('Invalid Pokémon held item name.');
  return name.trim().toLowerCase()
    .replace(/['’]/g,'')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-|-$/g,'');
}

export function itemSpriteUrl(name) {
  return ITEM_SPRITE_ROOT+itemSpriteSlug(name)+'.png';
}

// Load with anonymous CORS permission before compositing onto the exported
// PNG canvas. If the external artwork cannot load, export still succeeds with
// the built-in graphic placeholder.
export function loadItemSprite(name,timeoutMs=4500) {
  return new Promise(resolve=>{
    let url;
    try { url=itemSpriteUrl(name); }
    catch { resolve(null);return; }
    const img=new Image();
    img.crossOrigin='anonymous';
    let complete=false;
    const finish=result=>{
      if(complete)return;
      complete=true;
      clearTimeout(timer);
      img.onload=null;
      img.onerror=null;
      resolve(result);
    };
    const timer=setTimeout(()=>finish(null),timeoutMs);
    img.onload=()=>finish(img);
    img.onerror=()=>finish(null);
    img.src=url;
  });
}
