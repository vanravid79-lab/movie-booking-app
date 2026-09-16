import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-12345";
const JWT_EXPIRES_IN = "24h";

// ======================================================
// REGISTER USER
// POST /api/auth/register
// ======================================================
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, gender, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Name, email, and password are required.",
      });
    }

    // Check if user already exists in DB
    const existing = await prisma.user.findUnique({
      where: { user_email: email.toLowerCase().trim() },
    });

    if (existing) {
      return res.status(400).json({
        ok: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Assign role (defaults to User, or Admin if requested)
    const assignedRole: UserRole = role === "admin" ? UserRole.Admin : UserRole.User;

    // Create user in DB
    const newUser = await prisma.user.create({
      data: {
        user_name: name.trim(),
        user_email: email.toLowerCase().trim(),
        user_password: hashedPassword,
        user_phone: phone || null,
        user_gender: gender || null,
        user_role: assignedRole,
      },
    });

    const tokenRole = (newUser.user_role || "User").toLowerCase();

    // Generate JWT
    const token = jwt.sign(
      {
        sub: newUser.user_id,
        role: tokenRole,
        email: newUser.user_email,
        name: newUser.user_name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      ok: true,
      message: "Registration successful!",
      token,
      user: {
        id: newUser.user_id,
        name: newUser.user_name,
        email: newUser.user_email,
        role: tokenRole,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error during registration.",
    });
  }
});

// ======================================================
// LOGIN USER / ADMIN
// POST /api/auth/login
// ======================================================
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email and password are required.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { user_email: email.toLowerCase().trim() },
    });

    if (!user || !user.user_password) {
      return res.status(401).json({
        ok: false,
        message: "Invalid email or password.",
      });
    }

    const match = await bcrypt.compare(password, user.user_password);
    if (!match) {
      return res.status(401).json({
        ok: false,
        message: "Invalid email or password.",
      });
    }

    const tokenRole = (user.user_role || "User").toLowerCase(); // "admin" or "user"

    // Optional: Log transaction
    try {
      await prisma.userLoginTransaction.create({
        data: {
          user_id: user.user_id,
          login_datetime: new Date(),
        },
      });
    } catch (txErr) {
      console.warn("Failed to log user login transaction:", txErr);
    }

    const token = jwt.sign(
      {
        sub: user.user_id,
        role: tokenRole,
        email: user.user_email,
        name: user.user_name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      ok: true,
      token,
      user: {
        id: user.user_id,
        name: user.user_name,
        email: user.user_email,
        role: tokenRole,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error during login.",
    });
  }
});

// ======================================================
// CURRENT USER
// GET /api/auth/me
// ======================================================
router.get("/me", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { user_id: decoded.sub },
      select: {
        user_id: true,
        user_name: true,
        user_email: true,
        user_role: true,
        user_phone: true,
        user_gender: true,
      },
    });

    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    return res.json({
      ok: true,
      user: {
        id: user.user_id,
        name: user.user_name,
        email: user.user_email,
        role: (user.user_role || "User").toLowerCase(),
        phone: user.user_phone,
        gender: user.user_gender,
      },
    });
  } catch (err) {
    return res.status(401).json({ ok: false, message: "Invalid or expired token" });
  }
});

export default router;
