"use client";

import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";


export default function ListProductPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    startingPrice: "",
    deadline: ""
  });

  const { user } = useUser();

  const clerkUserId = user?.id;

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

    const handleImageUpload = async (e : React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "knockdown");

    try {   
        const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dgyu8dwzd/image/upload",
        data
        );

        setForm((prev) => ({
        ...prev,
        imageUrl: res.data.secure_url,
        }));
    } catch (err) {
        console.error("Image upload failed", err);
    } finally {
        setImageUploading(false);
    }
    };

  const handleChange = (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e : React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try { 
      const res = await axios.post("http://127.0.0.1:8000/product", {
        ...form,
        startingPrice: Number(form.startingPrice),
        deadline : new Date(form.deadline),
        clerkUserId : clerkUserId
      }, 
    {
        withCredentials : true
    });

      if (res.data.success) {
        setMessage("Product listed successfully!");
        setForm({
          name: "",
          description: "",
          imageUrl: "",
          startingPrice: "",
          deadline: ""
        });

        router.push('/');
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to list product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-gray-900 to-gray-800 text-white flex items-center justify-center px-6">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">
          List a Product
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Product Name *"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
          />

            <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20"
            />

            {form.imageUrl && (
            <img
                src={form.imageUrl}
                alt="preview"
                className="mt-4 rounded-xl h-40 object-cover"
            />
            )}

          <input
            type="number"
            name="startingPrice"
            placeholder="Starting Price *"
            value={form.startingPrice}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
          />

          <input
            type="datetime-local"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
          />

        </div>

        <button
          type="submit"
          disabled={loading || imageUploading}
          className="w-full mt-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 transition font-semibold"
        >
          {loading ? "Listing..." : "List Product"}
        </button>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-300">
            {message}
          </p>
        )}
      </motion.form>
    </div>
  );
}
