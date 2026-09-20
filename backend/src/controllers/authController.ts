import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

const DEFAULT_PASSWORDS: Record<string, string> = {
  admin: "admin123",
  staff: "staff123",
  customer: "customer123",
};

const hashPassword = (password: string) =>
  createHash("sha256").update(password).digest("hex");

const normalizeRole = (role?: string) => {
  if (!role) return "Customer";
  const value = role.toLowerCase();
  if (value === "admin") return "Admin";
  if (value === "staff") return "Staff";
  return "Customer";
};

export const register = async (req: any, res: any) => {
  try {
    const { fullName, email, phone, password, role, username } = req.body ?? {};

    const normalizedUsername = String(username || fullName || "").trim();
    const emailValue = email ? String(email).trim() : "";
    const passwordValue = String(password ?? "").trim();

    if (!normalizedUsername || !passwordValue) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    if (passwordValue.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const normalizedRole = normalizeRole(role);

    const existingUser = emailValue
      ? await prisma.user.findFirst({
          where: {
            email: {
              equals: emailValue,
              mode: "insensitive",
            },
          },
        })
      : await prisma.user.findFirst({
          where: {
            full_name: {
              equals: normalizedUsername,
              mode: "insensitive",
            },
          },
        });

    if (existingUser) {
      return res.status(409).json({ error: "This username already exists" });
    }

    const createdUser = await prisma.user.create({
      data: {
        full_name: normalizedUsername,
        email: emailValue || null,
        phone: phone ? String(phone).trim() : null,
        password_hash: hashPassword(passwordValue),
        role: normalizedRole,
      },
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: createdUser.user_id,
        name: createdUser.full_name,
        email: createdUser.email,
        role: createdUser.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Registration failed" });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password, role, username } = req.body ?? {};

    const identifier = String(email || username || "").trim();

    if (!identifier || !password || !role) {
      return res.status(400).json({ error: "Username or email, password and role are required" });
    }

    const normalizedRole = normalizeRole(role);
    const passwordValue = String(password).trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: "insensitive" } },
          { full_name: { equals: identifier, mode: "insensitive" } },
        ],
        role: normalizedRole,
      },
    });

    const fallbackPassword = DEFAULT_PASSWORDS[String(role).toLowerCase()] ?? "customer123";

    if (!user && identifier.includes("@")) {
      const fallbackEmail = `${normalizedRole.toLowerCase()}@moviebooking.local`;
      if (identifier.toLowerCase() === fallbackEmail && passwordValue === fallbackPassword) {
        const createdUser = await prisma.user.upsert({
          where: { email: fallbackEmail },
          update: {},
          create: {
            full_name: normalizedRole,
            email: fallbackEmail,
            phone: "+85500000000",
            password_hash: hashPassword(fallbackPassword),
            role: normalizedRole,
          },
        });

        return res.json({
          message: "Login successful",
          user: {
            id: createdUser.user_id,
            name: createdUser.full_name,
            email: createdUser.email,
            role: createdUser.role,
          },
        });
      }
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid username/email or role" });
    }

    const storedHash = user.password_hash ?? "";
    const expectedHash = hashPassword(passwordValue);
    const isDefaultPasswordMatch = passwordValue === fallbackPassword && !storedHash;

    if (storedHash && storedHash !== expectedHash) {
      return res.status(401).json({ error: "Invalid password" });
    }

    if (!storedHash && !isDefaultPasswordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    return res.json({
      message: "Login successful",
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Login failed" });
  }
};
