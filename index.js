const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const { pokedex } = require("./data/pokedex");
var bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require("mongodb");
require('dotenv').config()

const PORT = 4002;
const app = express();

let pokemons = pokedex;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const dbFunction = async () => {
  // creates a new client
  const client = new MongoClient(process.env.MONGO_URI, options);

  // connect to the client
  await client.connect();

  try {
    const db = await client.db("pokedex");
    console.log("Client connected")
    return db
  } catch(err) {
    client.close();
    throw Error("Error conneting to MongoDB", err)
  }
};

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
app.get("/pokemons/:name", async (req, res) => {
  const { name } = req.params;
  const db = await dbFunction();
  const result = await db.collection("pokemons").findOne({name: name});
  if (result) {
    return res.status(200).json({status: 200, success: true, pokemon: result})  
  }
  return res.status(404).json({status: 404, message: "Pokemon not found"})
});
 
// GET all_pokemon DONE
app.get("/pokemons", async (req, res) => {
  const db = await dbFunction();
  const result = await db.collection("pokemons").find().toArray();
  console.log(result)

  return res.status(200).json({status: 200, success: true, pokemons: result})
})

app.get("/", (req, res) => {
  return res.status(200).json({message: "Server is online"})
});

// POST pokemon Creating a pokemon
app.post("/pokemons", async (req, res) => {
  const db = await dbFunction();
  const { name, type, entry } = req.body;
  const result = await db.collection("pokemons").insertOne({name, type, entry});
  if (result.acknowledged) {
    return res.status(201).json({status: 201, success: true, message: "Pokemon Created"})
  }
  return res.status(400).json({status: 400, success: false, message: "Error creating you pokemon"})
})

// DELETE Updating a pokemon
app.delete("/pokemons/:name", async (req, res) => {
  const { name } = req.params
  const db = await dbFunction();
  const result = await db.collection("pokemons").delete({ "name" : name });
  if (result.acknowledged) {
    return res.status(200).json({status: 200, success: true, message: "Pokemon deleted from MongoDb"})
  }
  return res.status(400).json({status: 400, success: false, message: "We could not delete your pokemon"})
});

// PUT Updating a pokemon
app.put("/pokemons/:id", async (req, res) => {
  const db = await dbFunction();
  const { id } = req.params;
  const { entry, name } = req.body;
  console.log(entry)
  // This is how you query with _id in MongoDB :D
  //const result = await db.collection("pokemons").findOne({"_id": new ObjectId(id) });
  const result = await db.collection("pokemons").updateOne({"_id": new ObjectId(id)}, { $set: { entry, name } } );
  if (result.acknowledged) {
    return res.status(203).json({status: 404, success: true, message: "Pokemon was updated successfully"})
  }
  return res.status(400).json({status: 404, success: true, message: "We could not update your pokemon"})
});


app.listen(PORT, () => {
  console.log(`server running on PORT: ${PORT}`);
});


