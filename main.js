const pokes = document.querySelector('.pokes');
let pokeNum = 0;
const input = document.getElementById('user-input');
const sendBtn = document.getElementById('user-send');

sendBtn.addEventListener('click', () => {
  const pokeName = inputHandle();
  if (!pokeName) return; // ignore empty input
  
  cachedFetchPokemonData(pokeName)
    .then(poke => {
      if (poke) {
        renderPokemon(poke);
      } else {
        console.error('No data found');
      }
    })
    .catch(err => console.error('Error:', err));
});

function fetchSvg(svgURL) {
  fetch(svgURL)
    .then(res => res.text())
    .then(data => document.body.insertAdjacentHTML("afterbegin", data))
    .catch(err => console.error('SVG Fetch Error:', err));
}
fetchSvg('Icons/icons.svg');

// Async fetch function that returns Pokémon data JSON
async function fetchPokemonData(nameOrId) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
  if (!response.ok) {
    throw new Error('Pokemon not found');
  }
  return response.json();
}

// Caching decorator adapted for async functions returning promises
function cachingDecorator(func) {
  const cache = new Map();
  return function(key) {
    if (cache.has(key)) {
      return cache.get(key);
    }
    const promise = func(key).catch(err => {
      cache.delete(key); // remove from cache on failure
      throw err;
    });
    cache.set(key, promise);
    return promise;
  };
}

// Decorated cached fetch function
const cachedFetchPokemonData = cachingDecorator(fetchPokemonData);

// Render function to show Pokémon info
function renderPokemon(poke) {
  const div = document.createElement('div');
  div.classList.add('poke-container');
  div.classList.add(`pokeClass${pokeNum}`);
  
  const attackStat = poke.stats.find(stat => stat.stat.name === 'attack');
  const attack = attackStat ? attackStat.base_stat : 'N/A';
  
  div.innerHTML = `
    <div class="poke-img">
      <img src="${poke.sprites.front_default}" alt="${poke.name}" />
      <h4 class="poke-name">${poke.name}</h4>
      <div class="poke-details">
        <p style='color: orange'>Type: ${poke.types[0].type.name}</p>
        <p style='color: blue'>Weight: ${poke.weight * 0.1}kg</p>
        <p style='color: green'>Moves: ${poke.moves.length}</p>
        <p style='color: red'>Attack: ${attack}</p>
      </div>
    </div>
  `;
  
  pokes.appendChild(div);
  
  // Animate the new card only
  div.style.animation = 'slideUP 0.5s ease forwards';
  
  // Clear animation on previous card (optional)
  if (pokeNum !== 0) {
    const prev = document.querySelector(`.pokeClass${pokeNum - 1}`);
    if (prev) prev.style.animation = '';
    
  }
  
  pokeNum += 1;
}

function inputHandle() {
  const val = input.value.trim().toLowerCase();
  input.value = '';
  return val;
}