import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";

const prisma = new PrismaClient() as any;

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

// 📌 Add item to cart
export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { menuItemId, quantity } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!menuItemId) return res.status(400).json({ message: "menuItemId is required" });

    // find or create cart
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_menuItemId: { cartId: cart.id, menuItemId } },
    });

    let updatedItem;
    if (existingItem) {
      updatedItem = await prisma.cartItem.update({
        where: { cartId_menuItemId: { cartId: cart.id, menuItemId } },
        data: { quantity: existingItem.quantity + (quantity || 1) },
      });
    } else {
      updatedItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId,
          quantity: quantity || 1,
        },
      });
    }

    res.status(201).json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 📌 Remove a single item from cart
export const removeFromCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { menuItemId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!menuItemId) return res.status(400).json({ message: "menuItemId is required" });

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = await prisma.cartItem.findUnique({
      where: { cartId_menuItemId: { cartId: cart.id, menuItemId } },
    });
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    await prisma.cartItem.delete({
      where: { cartId_menuItemId: { cartId: cart.id, menuItemId } },
    });

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


// 📌 Delete entire cart
export const deleteCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Delete all cart items first
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Delete the cart itself
    await prisma.cart.delete({ where: { id: cart.id } });

    res.json({ message: "Cart deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


// 📌 Get cart items
export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    if (!cart) return res.json({ items: [] });

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response) => {
    try{
        const userId = req.user?.id;
        const { menuItemId, quantity } = req.body;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        if (!menuItemId) return res.status(400).json({ message: "menuItemId is required" });
        if (quantity === undefined || quantity < 1) return res.status(400).json({ message: "Valid quantity is required" });

        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) return res.status(404).json({ message: "Cart not found" });
        const existingItem = await prisma.cartItem.findUnique({
            where: { cartId_menuItemId: { cartId: cart.id, menuItemId } },
        });
        if (!existingItem) return res.status(404).json({ message: "Item not found in cart" });
        const updatedItem = await prisma.cartItem.update({
            where: { cartId_menuItemId: { cartId: cart.id, menuItemId } },
            data: { quantity },
        });
        res.json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });

    }
}