const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const ObjectId = require('mongodb').ObjectId;
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use(cors())
const port = 3000


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://comicsOwner:admin@comicsshop.ih00pmj.mongodb.net/?retryWrites=true&w=majority&appName=comicsShop";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  })
  
 app.listen(process.env.port || 3000);
  

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("comics").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const comicsCollection = client.db("comics").collection("comics");

    app.post('/addComic', async (req, res) => {
      const comic = req.body;
      await comicsCollection.insertOne(comic)
      .then(response => {
        res.redirect('/')
      })
    })

    app.get('/comics', async (req, res) => {
      const docs = await comicsCollection.find({}).toArray()
      res.send(docs)
    })

    app.get('/comic/:id', async (req, res) => {
      try {
        const id = isNaN(req.params.id) ? req.params.id : parseInt(req.params.id);
        const query = isNaN(id) ? { _id: new ObjectId(id) } : { _id: id };
        const comic = await comicsCollection.findOne(query);
        if (!comic) {
          res.status(404).send('Vegetable not found');
          return;
        }
  
        res.json(comic);
      } catch (error) {
        console.error('Error fetching comic by ID:', error);
        res.status(500).send('Internal Server Error');
      }
    });




 app.patch('/update/:id', async (req, res) => {
  const id = new ObjectId(req.params.id);
  const {name, price, quantity} = req.body;

  await comicsCollection.updateOne(
    {_id: id },
    {
      $set: {
        name,
        price,
        quantity
      }
    }
  )
  .then(result => {
    if(result.modifiedCount > 0) {
      res.json({success: true});
    } else {
      res.json({success: false, message: 'Item not found'})
    }
  });
 });

app.delete('/delete/:id', async (req, res) => {
    await comicsCollection.deleteOne({_id: new ObjectId(req.params.id)})
    .then(result => {
      res.send(result.deletedCount > 0)
    })
})
    
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
