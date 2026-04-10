import express from "express";
import http from 'http';
import { productListRouter } from "./routes/productList.js";
import { productRouter } from "./routes/product.js";
import { biddingRouter } from "./routes/bidding.js";
import { attachWebSocketServer } from "./ws/server.js";



const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app);

app.use(express.json());

//here you will create the endpoints
app.use('/productlist', productListRouter);
app.use('/product', productRouter);
app.use('/bid', biddingRouter);

const { broadcastHighestBid } = attachWebSocketServer(server);
app.locals.broadcastHighestBid = broadcastHighestBid;


server.listen(PORT, HOST, () => {

    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

    console.log(`Server is running on ${baseUrl}`)
    console.log(`websocket server is running on ${baseUrl.replace('http','ws')}/ws`);
})