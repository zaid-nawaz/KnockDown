import { Router } from "express";
import prisma from "../lib/db";

export const productRouter = Router();

/*
========================================
GET /product/:id
Fetch one product by ID
========================================
*/
productRouter.get("/:id", async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        if (isNaN(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            },
            include: {
                seller: true,
                bids: true,
            },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        console.error("Error fetching product:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product",
        });
    }
});


/*
========================================
POST /product
Create new product
========================================
*/
productRouter.post("/", async (req, res) => {
    try {
        const {
            name,
            description,
            imageUrl,
            startingPrice,
            deadline,
            sellerId,
        } = req.body;

        // Basic validation
        if (!name || !startingPrice || !deadline || !sellerId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                imageUrl,
                startingPrice,
                deadline: new Date(deadline),
                sellerId,
            },
        });

        res.status(201).json({
            success: true,
            product: newProduct,
        });
    } catch (error) {
        console.error("Error creating product:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create product",
        });
    }
});