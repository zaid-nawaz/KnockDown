import "dotenv/config";
import express from "express";
import http from 'http';
import { productListRouter } from "./routes/productList.js";
import { productRouter } from "./routes/product.js";
import { biddingRouter } from "./routes/bidding.js";
import { attachWebSocketServer } from "./ws/server.js";
import { verifyWebhook } from "@clerk/express/webhooks";
import prisma from "./lib/db.js";
import cors from "cors";

const PORT = Number(process.env.PORT || 8000);

const app = express();
const server = http.createServer(app);

app.get("/ping", (req, res) => {
  res.send("ok");
});

app.post('/api/webhooks', express.raw({ type : 'application/json' }), async (req, res) => {
  try {
    const evt = await verifyWebhook(req)

    const { id } = evt.data
    const eventType = evt.type

    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    console.log('Webhook payload:', evt.data)

    if(evt.type === 'user.created'){

    const clerkUserId = evt.data.id
    const email = evt.data.email_addresses?.[0]?.email_address
    const first_name = evt.data.first_name || null
    const last_name = evt.data.last_name || null
    const imageUrl = evt.data.image_url || evt.data.profile_image_url || null
    const NewUser = await prisma.user.upsert({
      where : { clerkUserId }, 
      update : {},
      create : {
        clerkUserId,
        email,
        first_name,
        last_name,
        imageUrl,
      }
    })

    console.log('User created:', NewUser);
    }

    else if(evt.type === 'user.deleted'){
    const clerkUserId = evt.data.id;
    const deletedUser = await prisma.user.deleteMany({
      where: { clerkUserId },
    })
    console.log('User deleted:', deletedUser)
    }

    return res.send('Webhook received')
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return res.status(400).send('Error verifying webhook')
  }
})


app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://knockdown-three.vercel.app"
  ],
  credentials: true,
}));

//here are my endpoints
app.use('/productlist', productListRouter);
app.use('/product', productRouter);
app.use('/bid', biddingRouter);



const { broadcastHighestBid } = attachWebSocketServer(server);
app.locals.broadcastHighestBid = broadcastHighestBid;




server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})

