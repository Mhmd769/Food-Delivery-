import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

// Add a menu item
export const addMenuItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const { name, description, price, imageUrl, isAvailable } = req.body;

    if (!restaurantId) return res.status(400).json({ message: "Restaurant ID is required" });

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    // Authorization check
    if (restaurant.ownerId !== req.user?.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Ensure required fields
    if (!name) return res.status(400).json({ message: "Menu item name is required" });
    if (price === undefined) return res.status(400).json({ message: "Menu item price is required" });

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description: description ?? null,
        price,
        imageUrl: imageUrl ?? null,
        isAvailable: isAvailable ?? true,
        restaurant: { connect: { id: restaurantId } }, // Make sure you connect to restaurant
      },
    });

    res.status(201).json(menuItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get menu items for a restaurant
export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    if (!restaurantId) return res.status(400).json({ message: "Restaurant ID is required" });

    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId },
    });

    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update menu item
export const updateMenuItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { menuItemId } = req.params;
    const { name, description, price, imageUrl, isAvailable } = req.body;

    if (!menuItemId) return res.status(400).json({ message: "Menu item ID is required" });

    const menuItem = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });

    const restaurant = await prisma.restaurant.findUnique({ where: { id: menuItem.restaurantId } });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    if (restaurant.ownerId !== req.user?.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: {
        name: name ?? menuItem.name,
        description: description ?? menuItem.description,
        price: price ?? menuItem.price,
        imageUrl: imageUrl ?? menuItem.imageUrl,
        isAvailable: isAvailable ?? menuItem.isAvailable,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete menu item
export const deleteMenuItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { menuItemId } = req.params;
    if (!menuItemId) return res.status(400).json({ message: "Menu item ID is required" });

    const menuItem = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });

    const restaurant = await prisma.restaurant.findUnique({ where: { id: menuItem.restaurantId } });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    if (restaurant.ownerId !== req.user?.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.menuItem.delete({ where: { id: menuItemId } });
    res.json({ message: "Menu item deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
