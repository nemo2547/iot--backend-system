import jwt from "jsonwebtoken";

// 1. Auth Middleware (ตรวจสอบว่าล็อกอินหรือยัง)
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // ดึงเฉพาะค่าหลัง 'Bearer '

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Access token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ฝากข้อมูล payload ไว้ใน req.user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

// 2. Role Middleware (ตรวจสอบสิทธิ์ Admin)
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Forbidden: Insufficient privileges" });
    }
    next();
  };
};