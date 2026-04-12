"use client"
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-black via-gray-900 to-gray-800 text-white flex flex-col items-center justify-center px-6">
      {/* Hero Section */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl md:text-6xl font-extrabold text-center mb-6"
      >
        KnockDown Marketplace
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-lg md:text-xl text-gray-300 text-center max-w-xl mb-10"
      >
        Buy, sell, and bid on products in real-time. Fast. Clean. Powerful.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex gap-6"
      >
        <Link href="/products">
          <button className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 transition shadow-lg hover:scale-105">
            See Products
          </button>
        </Link>

        <Link href="/list-product">
          <button className="px-8 py-3 rounded-2xl bg-green-600 hover:bg-green-700 transition shadow-lg hover:scale-105">
            List Product
          </button>
        </Link>
      </motion.div>

      {/* Glass Card Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-20 backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-8 max-w-2xl text-center shadow-xl"
      >
        <h2 className="text-2xl font-semibold mb-3">Why KnockDown?</h2>
        <p className="text-gray-300">
          Real-time bidding with WebSockets, seamless UX, and a modern marketplace
          experience built for speed.
        </p>
      </motion.div>
    </div>
  );
}
