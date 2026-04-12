"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";


export default function ProductDetailPage() {
  const { productId } = useParams();

  const [product, setProduct] = useState<any>(null);
  const [highestBid, setHighestBid] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const clerkUserId = user?.id;

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
  if (!productId) return;

  const ws = new WebSocket("ws://127.0.0.1:8000/ws");

  wsRef.current = ws;

  ws.onopen = () => {
    console.log("✅ Connected to WebSocket");

    // optional: subscribe to specific product
    ws.send(
      JSON.stringify({
        type: "subscribe",
        id: Number(productId),
      })
    );
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    console.log("📩 WS message:", data);

    if(data.type === "new_bid"){
        const bid_data = data.data;
        setHighestBid(bid_data);

          setProduct((prev : any) => ({
            ...prev,
            bids: [bid_data, ...prev.bids],
            }));
    }

    
  };

  ws.onclose = () => {
    console.log("❌ WebSocket disconnected");
  };

  return () => {
    ws.close(); // cleanup
  };
}, [productId]);

  // fetch product
  const fetchProduct = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/product/${productId}`,
        {
            withCredentials : true
        }
      );

      setProduct(res.data.product);
      const bids = res.data.product.bids;

      setHighestBid(res.data.product.bids[0] || null);

    } catch (err) {
      console.error("Error fetching product", err);
    }
  };

  useEffect(() => {
    if (productId) fetchProduct();
  }, [productId]);

  // place bid
  const handleBid = async () => {
      console.log("checking", productId, clerkUserId, bidAmount);
    if (!bidAmount) return;


    try {
      setLoading(true);

      await axios.post("http://127.0.0.1:8000/bid", {
        productId: Number(productId),
        clerkUserId : clerkUserId, // TODO: replace with Clerk user
        amount: Number(bidAmount),
      },
    {
        withCredentials : true
    }
    );

      setBidAmount("");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to bid");
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return <p className="text-center mt-10 text-white">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="max-w-4xl mx-auto">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-96 object-cover rounded-2xl mb-6"
          />
        )}

        <h1 className="text-4xl font-bold mb-2">
          {product.name}
        </h1>

        <p className="text-gray-400 mb-4">
          Sold by: {product.seller?.first_name} {product.seller?.last_name}
        </p>

        <p className="text-gray-300 mb-6">
          {product.description}
        </p>

        {/* Highest Bid */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">Current Highest Bid</h2>

          {highestBid ? (
            <div>
              <p className="text-lg text-green-400">
                ₹{highestBid.amount}
              </p>
              <p className="text-sm text-gray-400">
                Bidder: {highestBid.bidder?.first_name} {highestBid.bidder?.last_name}
              </p>
            </div>
          ) : (
            <p className="text-gray-400">
              No bids yet (Starting price: ₹{product.startingPrice})
            </p>
          )}
        </div>

        {/* Bid Input */}
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Enter your bid"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20"
          />

          <button
            onClick={handleBid}
            disabled={loading}
            className="px-6 py-2 bg-green-600 rounded-xl hover:bg-green-700"
          >
            {loading ? "Bidding..." : "Place Bid"}
          </button>
        </div>
      </div>
    </div>
  );
}
