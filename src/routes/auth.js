import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // 1. Hash password ด้วย bcrypt ก่อนบันทึกลง Database
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 2. บันทึกลง PostgreSQL
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role: role || "viewer",
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Username already exists" });
    }
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

export default router;

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. ค้นหา User จาก username
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // 2. เปรียบเทียบรหัสผ่านที่ส่งมา กับ Hash ใน DB
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // 3. สร้าง (Sign) JWT Token โดยใส่ Payload (userId, role) และตั้งเวลาหมดอายุ 1 ชั่วโมง
    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // 4. ส่ง Token กลับไป
    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});