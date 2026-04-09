import { Router } from "express";
import prisma from "../lib/db";

export const biddingRouter = Router();

/*
========================================
POST /bid
Place a bid on a product
========================================
Expected body:
{
  "productId": 5,
  "bidderId": 2,
  "amount": 75000
}
========================================
*/
biddingRouter.post("/", async (req, res) => {
    try {
        const { productId, bidderId, amount } = req.body;

        // Basic validation
        if (!productId || !bidderId || !amount) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        // Find product
        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            },
            include: {
                bids: {
                    orderBy: {
                        amount: "desc",
                    },
                    take: 1,
                },
            },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Check if auction is active
        if (!product.isActive) {
            return res.status(400).json({
                success: false,
                message: "Auction is closed",
            });
        }

        // Check if deadline passed
        if (new Date() > product.deadline) {
            return res.status(400).json({
                success: false,
                message: "Bidding deadline has passed",
            });
        }

        // Get current highest bid
        const highestBid = product.bids[0];

        const currentHighestAmount = highestBid
            ? highestBid.amount
            : product.startingPrice;

        // Validate bid amount
        if (amount <= currentHighestAmount) {
            return res.status(400).json({
                success: false,
                message: `Bid must be greater than current highest bid (${currentHighestAmount})`,
            });
        }

        // Create new bid
        const newBid = await prisma.bid.create({
            data: {
                amount,
                bidderId,
                productId,
            },
        });

        res.status(201).json({
            success: true,
            message: "Bid placed successfully",
            bid: newBid,
        });

    } catch (error) {
        console.error("Error placing bid:", error);

        res.status(500).json({
            success: false,
            message: "Failed to place bid",
        });
    }
});