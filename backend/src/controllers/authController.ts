import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";

// Register -> Always CUSTOMER
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash: hashedPassword, role: "CUSTOMER", phone},
  });

  res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    token: generateToken(user.id, user.role),
  });
};

// Login
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// Admin creates user (Admin / Driver / Customer / RESTAURANT)
export const createUserByAdmin = async (req: Request, res: Response) => {
  const { name, email, password, role ,phone} = req.body;

  if (!["ADMIN", "DRIVER", "CUSTOMER","RESTAURANT"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash: hashedPassword, role , phone},
  });

  res.status(201).json({ message: `${role} created successfully`, user });
};
