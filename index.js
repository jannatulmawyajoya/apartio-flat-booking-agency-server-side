const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();

const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qqlcp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);

async function run(){
    try{
        await client.connect();
        // console.log('database connected');
        const database =client.db('apartments_sales');
        const servicesCollection = database.collection('services');
        const purchaseCollection = database.collection('purchases');
        const reviewCollection = database.collection('reviews');
        const usersCollection = database.collection('users');


        //add servicesCollection
        app.post("/addService", async (req, res) => {
            console.log(req.body);
            const result = await servicesCollection.insertOne(req.body);
            res.send(result);
        });

        // get all services
        app.get("/allServices", async (req, res) => {
            const result = await servicesCollection.find({}).toArray();
            res.send(result);
        });


        // get single product
        app.get("/singleProduct/:id", async (req, res) => {
            const result = await servicesCollection
                .find({_id:ObjectId(req.params.id) })
                .toArray();
                // console.log(result[0]);
            res.send(result[0]);
        });


        // confirm order
  app.post("/confirmOrder", async (req, res) => {
      const result = await purchaseCollection.insertOne(req.body);
    res.send(result);
    // console.log(result);
  });

        // my confirmOrder

        app.get("/myOrders/:email", async (req, res) => {
            const result = await purchaseCollection
                .find({email:req.params.email })
                .toArray();
            res.send(result);
           console.log(result);
        });

        /// delete order

        app.delete("/deleteOrder/:id", async (req, res) => {
            const result = await purchaseCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });

        //add single review
        app.post("/addReview", async (req, res) => {
            console.log(req.body);
            const result = await reviewCollection.insertOne(req.body);
            res.send(result);
            // console.log(result);
            
        });

        // get all reviews
        app.get("/allReviews", async (req, res) => {
            const result = await reviewCollection.find({}).toArray();
            res.send(result);
            // console.log(result);
        });



        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // console.log('put',user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // delete services
        app.delete("/deleteProducts/:id", async (req, res) => {
            const result = await servicesCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            // res.send(result);
            console.log(result);
        });
        

        // all order
        app.get("/allOrders", async (req, res) => {
            const result = await purchaseCollection.find({}).toArray();
            res.send(result);
        });


        // update statuses

        app.put("/updateStatus/:id", (req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body.status;
            const filter = { _id: ObjectId(id) };
            console.log(updatedStatus);
            purchaseCollection
                .updateOne(filter, {
                    $set: { status: updatedStatus },
                })
                .then((result) => {
                    res.send(result);
                });
        });
    
    }
    finally{
        // await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello apartment sales website!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})