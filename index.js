const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const { pokedex } = require("./data/pokedex");
var bodyParser = require('body-parser');

const PORT = 4000;
const app = express();

let pokemons = pokedex;

// Middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json());

// GET all_pokemon by type DONE
app.get("/pokemonsByType", (req, res) => {
  // query
  const { type } = req.query

  // Backend logic
  const filterPokemons = pokemons.filter((pokemon) => {
    if (pokemon.type.includes(type)) {
      return pokemon
    }
  });
  //

  // Respond with filtered data
  return res.status(200).json({status: 200, success: true, pokemons: filterPokemons})
});

app.get("/explanation/:id", (req, res) => {
  // query
  const { type } = req.query
  return res.status(200).json({status: 200, success: true, req: pokemons})
});

// GET pokemon
app.get("/pokemons/:id", (req, res) => {
  const { id } = req.params
  for (i=0; i < pokemons.length; i++) {
    const pokemon = pokemons[i]
    if (pokemon.id === parseInt(id)) {
      return res.status(200).json({status: 200, pokemon: pokemon})
    }
  }
  return res.status(404).json({status: 404, message: "Pokemon not found"})
});
 
// GET all_pokemon DONE
app.get("/pokemons", (req, res) => {
  return res.status(200).json({status: 200, success: true, message: pokemons})
})

app.get("/", (req, res) => {
  return res.status(200).json({message: "Server is change"})
});

// POST pokemon Creating a pokemon
app.post("/pokemons", (req, res) => {
  pokemons.push({id: pokemons.length + 1, ...req.body})
  return res.status(200).json({status: 200, success: true, message: pokemons})
})

// DELETE Updating a pokemon
app.delete("/pokemons/:id", (req, res) => {
  const { id } = req.params
  
  console.log(pokemons.length)
  const filterPokemons = pokemons.filter(pokemon => {
    if (pokemon.id !== parseInt(id)) {
      return pokemon
    }
  })
  pokemons = filterPokemons

  return res.status(404).json({status: 404, pokemons: filterPokemons})
});

// PUT Updating a pokemon
app.put("/pokemons/:id", (req, res) => {
  const { id } = req.params;
  const { body } = req.body;

  for (i=0; i < pokemons.length; i++) {
    let pokemon = pokemons[i]
    if (pokemon.id === parseInt(id)) {
      const newPokemon = {id: i + 1, ...req.body}
      pokemons[i] = newPokemon
      return res.status(200).json({status: 200, pokemon: pokemons[i]})
    }
  }
  return res.status(404).json({status: 404, message: "Pokemon not found"})
});


app.listen(PORT, () => {
  console.log(`server running on PORT: ${PORT}`);
});


