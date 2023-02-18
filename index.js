const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const { pokedex } = require("./data/pokedex");
var bodyParser = require('body-parser');
const { MongoClient } = require("mongodb");

const PORT = 4000;
const app = express();

let pokemons = pokedex;

// Middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json());

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const dbFunction = async () => {
  // creates a new client
  const client = new MongoClient("mongodb+srv://julianallende:Arussek1@cluster0.tkju1.mongodb.net/?retryWrites=true&w=majority", options);

  // connect to the client
  await client.connect();

  try {
    const db = await client.db("pokedex");
    return db
  } catch(err) {
    client.close();
    throw Error("Error conneting to MongoDB", err)
  }
};

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
app.get("/pokemons", async (req, res) => {
  const db = await dbFunction()
  const pokemons = await db.collection("pokemons").find().toArray()
  return res.status(200).json({status: 200, success: true, message: pokemons})
})

// POST pokemon Creating a pokemon
app.post("/pokemons", async (req, res) => {
  const db = await dbFunction()
  const { name, type, region } = req.body;
  const result = await db.collection("pokemons").insertOne({name, type, region});
  if (result.acknowledged) {
    return res.status(200).json({status: 200, success: true, message: "Pokemon created"})
  }
  return res.status(400).json({status: 400, success: true, message: "Error creating your pokemon"})
})

// DELETE Updating a pokemon
app.delete("/pokemons/:id", async (req, res) => {
  const db = await dbFunction();
  const result = await db.collection("pokemons").deleteOne({name: "Pikachu"});
  return res.status(404).json({status: 404, pokemons: result})
});

// PUT Updating a pokemon
app.put("/pokemons/:name", async (req, res) => {
  const { name } = req.params
  const db = await dbFunction();
  console.log(req.body)
  console.log(name)
  const result = await db.collection("pokemons").updateOne(
    {"name": name}, 
    {$set: req.body}
    )
  if (result.acknowledged) {
    return res.status(200).json({status: 200, message: result})
  }
  return res.status(400).json({status: 400, message: "Error updating your document"})
});

app.get("/test", (req, res) => {
  return res.status(200).json({message: "Server is change"})
});

app.listen(PORT, () => {
  console.log(`server running on PORT: ${PORT}`);
});


