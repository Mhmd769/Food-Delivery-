import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const seedAdmin = async () => {
  try {
    const admin = await prisma.user.findUnique({ where: { email: "admin@foodapp.com" } });
    if (admin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin@123", 10);
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@foodapp.com",
        passwordHash: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("✅ Admin created: admin@foodapp.com / Admin123!");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

seedAdmin();
