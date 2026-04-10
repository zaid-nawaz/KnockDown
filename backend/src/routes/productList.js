import { Router } from "express";
import prisma from "../lib/db.js";

export const productListRouter = Router();

productListRouter.get("/", async (req, res) => {
    try {
        const search = req.query.search?.toString() || "";

        const products = await prisma.product.findMany({
            where: {
                OR: [// this means if any of these conditions are true
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        description: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            },
        });

        res.status(200).json({
            success: true,
            results: products,
        });
    } catch (error) {
        console.error("Error fetching products:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
});