import type { Request, Response } from "express";
import prisma from "../config/db.js";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

// 📌 Create order(s) from cart (multi-restaurant supported)
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { menuItem: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Group items by restaurant
    const grouped: Record<string, typeof cart.items> = {};
    for (const item of cart.items) {
      const rId = item.menuItem.restaurantId;
      if (!grouped[rId]) grouped[rId] = [];
      grouped[rId].push(item);
    }

    let grandTotal = 0;
    const createdOrders = [];

    for (const [restaurantId, items] of Object.entries(grouped)) {
      const total = items.reduce(
        (sum, item) => sum + Number(item.menuItem.price) * item.quantity,
        0
      );

      grandTotal += total;

      const order = await prisma.order.create({
        data: {
          customerId: userId,
          restaurantId,
          total,
          addressSnapshot: req.body.address || {},
          items: {
            create: items.map((item) => ({
              menuItemId: item.menuItemId,
              name: item.menuItem.name,
              price: item.menuItem.price,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true, restaurant: true },
      });

      createdOrders.push(order);
    }

    // Clear cart after checkout
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json({
      grandTotal,
      orders: createdOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create orders" });
  }
};

// 📌 Get my orders (customer)
export const getMyOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const orders = await prisma.order.findMany({
      where: { customerId: userId },
      include: { items: true, restaurant: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// 📌 Get order details
export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, restaurant: true, customer: true, driver: true },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

// 📌 Update order status (restaurant, driver, admin)
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Permissions check
    if (role === "CUSTMORE" && order.restaurantId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};
