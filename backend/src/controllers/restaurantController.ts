import prisma from "../config/db.js";
import type { Request, Response } from "express";


// Create restaurant (only RESTAURANT user)
export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const { name, description, phone, email, logoUrl, bannerUrl, address, city, lat, lng, openingTime, closingTime } = req.body;
    const user = (req as any).user;

    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId: user.id,
        name,
        description,
        phone,
        email,
        logoUrl,
        bannerUrl,
        address,
        city,
        lat,
        lng,
        openingTime,
        closingTime,
      },
    });

    res.status(201).json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating restaurant" });
  }
};

// Get all restaurants
export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: { menuItems: true },
    });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurants" });
  }
};

// Get single restaurant by ID
export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Restaurant ID is required" });
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: { menuItems: true, orders: true },
    });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurant" });
  }
};


export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // <-- get ID from params, not query
    if (!id) return res.status(400).json({ message: "Restaurant ID is required" });

    const user = (req as any).user;

    // Check if the restaurant exists and belongs to the user
    const restaurant = await prisma.restaurant.findUnique({ 
      where: { id },
      select: { id: true, ownerId: true }
    });

    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    if (restaurant.ownerId !== user.id) return res.status(403).json({ message: "Not authorized" });

    // Update restaurant
    const updated = await prisma.restaurant.update({
      where: { id },
      data: req.body,
    });

    res.json(updated);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating restaurant" });
  }
};


// Delete restaurant (only owner)
export const deleteRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Restaurant ID is required" });
    
    const user = (req as any).user;

    const restaurant = await prisma.restaurant.findUnique({ 
      where: { id },
      select: { id: true, ownerId: true }
    });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    if (restaurant.ownerId !== user.id) return res.status(403).json({ message: "Not authorized" });

    await prisma.restaurant.delete({ where: { id } });
    res.json({ message: "Restaurant deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting restaurant" });
  }
};
