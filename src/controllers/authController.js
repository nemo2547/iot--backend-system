import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const loginUser = async (username, password) => {
  const user = await prisma.user.findUnique({
    where: { username }
  });

  if (!user) {
    throw new Error('Invalid Credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid Credentials');
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );

  return { token, user: { id: user.id, username: user.username, role: user.role } };
};