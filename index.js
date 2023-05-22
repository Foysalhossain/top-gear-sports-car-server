const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ci4nuyk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const carsCollection = client.db('toySportsCar').collection('categories');
        const addCollection = client.db('toySportsCar').collection('AddCategories');

        // create index on two field
        // const indexKeys = { title: 1, category: 1 };
        // const indexOptions = { name: 'titleCategory' };

        // const result = await addCollection.createIndex(indexKeys, indexOptions);


        app.get('/toySearchByTitle/:text', async (req, res) => {
            const searchText = req.params.text;
            // console.log(searchText);
            const result = await addCollection.find().toArray();
            const search = result.filter(item => item.name.toLowerCase().includes(searchText));
            // console.log(search);
            res.send(search);
        })


        app.post('/viewDetails', async (req, res) => {
            const body = req.body;

            if (!body) {
                return res.status(404).send({ message: 'You have to log in first to view details' })
            }

            const result = await carsCollection.insertOne(body);
            // console.log(result);
            res.send(result);
        })

        app.get('/tabToys/:text', async (req, res) => {
            console.log(req.params.text);
            if (req.params.text == 'racing' || req.params.text == 'stunt' || req.params.text == 'OffRoad') {
                const result = await carsCollection.find({ status: req.params.text }).toArray();
                // console.log(result);
                return res.send(result);
            }
            const result = await carsCollection.find({}).toArray();
            res.send(result);
        })

        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const options = {
                projection: { picture: 1, name: 1, seller_name: 1, seller_email: 1, price: 1, quantity: 1, description: 1, rating: 1 }
            }

            const result = await carsCollection.findOne(query, options);
            // console.log(result);
            res.send(result);
        })

        app.post('/addCategory', async (req, res) => {
            const data = req.body;
            const result = await addCollection.insertOne(data);
            res.send(result);
        })

        app.get('/addCategory', async (req, res) => {
            const category = req.query;
            const result = await addCollection.find(category).limit(20).toArray();
            res.send(result);
        })

        app.get('/addCategory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            // const category = req.query;
            const result = await addCollection.findOne(query);
            res.send(result);
        })

        app.put('/addCategory/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) }
            const data = req.body;
            console.log(data);
            const updateDoc = {
                $set: {
                    picture: data.picture,
                    name: data.name,
                    sellerName: data.sellerName,
                    sellerEmail: data.email,
                    category: data.category,
                    price: data.price,
                    rating: data.rating,
                    quantity: data.quantity,
                    description: data.description
                },
            };
            const result = await addCollection.updateOne(filter, updateDoc);
            res.send(result);
        })


        app.get('/myToys', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { sellerEmail: req.query.email }
            }
            const result = await addCollection.find(query).toArray();
            console.log(result);
            res.send(result)
        })

        // search
        app.get('/myToys/:email', async (req, res) => {
            console.log(req.params.email);
            const result = await addCollection.find({ sellerEmail: req.params.email }).toArray();
            res.send(result);
        })

        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await addCollection.deleteOne(query);
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Sports is running')
})

app.listen(port, () => {
    console.log(`Top gear server is running on port ${port}`);
})