import prisma from "../config/db.js";
import type { Request, Response } from "express";


export const getProfile= async (req:Request,res:Response)=>{
    try{

        const userId= (req as any).user.id;
        const user = await prisma.user.findUnique({
            where : { id: userId },
            select: { id:true, name:true, email:true, phone:true, role:true ,createdAt:true}
        })

        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);

        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
};


// Update profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: { id: true, email: true, name: true, role: true },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};