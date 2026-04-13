"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/productlist?search=${search}`,
        {
            withCredentials : true
        }
      );
      setProducts(res.data.results || []);
    } catch (err) {
      console.error("Error fetching products", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-gray-900 to-gray-800 text-white px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center mb-8"
      >
        Explore Products
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto mb-10 flex gap-3"
      >
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-5 py-3 rounded-2xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-lg"
        />

        <button
          onClick={handleSearch}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 transition font-semibold"
        >
          Search
        </button>
      </motion.div>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-400">No products found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product : any, index) => (
            <Link href={`/products/${product.id}`} key={product.id}>
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-5 shadow-lg hover:scale-105 transition"
            >
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-xl mb-3"
                />
              )}

              <h2 className="text-xl font-semibold mb-2">
                {product.name}
              </h2>

              <p className="text-gray-300 text-sm line-clamp-3">
                {product.description}
              </p>

              <div className="mt-4 text-sm text-gray-400">
                starting price is - ₹{product.startingPrice}
              </div>
            </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

