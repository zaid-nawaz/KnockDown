import { WebSocket, WebSocketServer } from "ws";

const prodSubscribers = new Map();

function subscribe(productId, socket){
    if(!prodSubscribers.has(productId)){
        prodSubscribers.set(productId, new Set());
    }

    prodSubscribers.get(productId).add(socket);
}

function unsubscribe(productId, socket){
    const subscribers = prodSubscribers.get(productId);

    if(!subscribers) return;

    subscribers.delete(socket);

    if(subscribers.size === 0){
        prodSubscribers.delete(productId);
    }
}

function cleanupSubscriptions(socket){
    for (const productId of socket.subscriptions){
        unsubscribe(productId, socket);
    }

    socket.subscriptions.clear();
}

function sendJson(socket, payload){
    
    if(socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify(payload));

}


function broadcastToAll(wss, payload){

    for (const client of wss.clients){
        if (client.readyState !== WebSocket.OPEN) continue;

        client.send(JSON.stringify(payload));
    }
}

function broadcastToProductSubs(productId, payload){
    const subscribers = prodSubscribers.get(productId);

    if(!subscribers || subscribers.size === 0) return;

    const message = JSON.stringify(payload);

    for (const client of subscribers){
        if (client.readyState === WebSocket.OPEN){
            client.send(message);
        }
    }
}

function handleMessage(socket, data) {
    let message;

    try {
        message = JSON.parse(data.toString());
    } catch {
        sendJson(socket, { type: 'error', message: 'Invalid JSON' });
        return;
    }

    if(message?.type === "subscribe" && Number.isInteger(message.id)) {
        subscribe(message.id, socket);
        socket.subscriptions.add(message.id);
        sendJson(socket, { type: 'subscribed', productId: message.id });
        return;
    }

    if(message?.type === "unsubscribe" && Number.isInteger(message.id)) {
        unsubscribe(message.id, socket);
        socket.subscriptions.delete(message.id);
        sendJson(socket, { type: 'unsubscribed', productId: message.id });
    }
}

export function attachWebSocketServer(server){
    const wss = new WebSocketServer({ server, path : '/ws', maxPayload : 1024 * 1024});

    wss.on('connection', (socket) => {

        socket.isAlive = true;
        socket.subscriptions = new Set();
        
        socket.on('pong', () => { socket.isAlive = true});

        socket.on('message', (data) => {
            handleMessage(socket, data);
        })

        socket.on('error', (err) => {
            console.error(err);
            socket.terminate();
        })

        socket.on('close', () => {
            cleanupSubscriptions(socket);
        })

    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if(ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            
            ws.ping();
        })
    }, 30000);

    wss.on('close', () => clearInterval(interval));

    function broadcastHighestBid(productId , bidinfo){

        broadcastToProductSubs(productId, { type : "new_bid", data : bidinfo});
    }

    return { broadcastHighestBid };
}