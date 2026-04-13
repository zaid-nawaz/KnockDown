import { Router } from "express";
import prisma from "../lib/db.js";

export const biddingRouter = Router();

biddingRouter.post("/", async (req, res) => {
    try {
        const { productId, clerkUserId, amount } = req.body;

       
        if (!productId || !clerkUserId || !amount) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const dbUser = await prisma.user.findUnique({
            where : {
                clerkUserId : clerkUserId
            }
        })

        if (!dbUser) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
        }

        const bidderId = dbUser.id;

        
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
        
        if (!product.isActive) {
            return res.status(400).json({
                success: false,
                message: "Auction is closed",
            });
        }

       
        if (new Date() > product.deadline) {
            return res.status(400).json({
                success: false,
                message: "Bidding deadline has passed",
            });
        }

        // current highest bid
        const highestBid = product.bids[0];

        const currentHighestAmount = highestBid
            ? highestBid.amount
            : product.startingPrice;

        if (amount <= currentHighestAmount) {
            return res.status(400).json({
                success: false,
                message: `Bid must be greater than current highest bid (${currentHighestAmount})`,
            });
        }

        
        const newBid = await prisma.bid.create({
            data: {
                amount,
                bidderId,
                productId,
            },
            include : {
                bidder : true
            }
        });

        if(res.app.locals.broadcastHighestBid){
            res.app.locals.broadcastHighestBid(productId ,newBid);
        }



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