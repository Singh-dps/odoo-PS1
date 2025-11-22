import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // 1. Login ID (Username) validation
        // Unique (checked later via DB) and length 6-12 characters
        if (username.length < 6 || username.length > 12) {
            return res.status(400).json({ message: 'Login ID must be between 6-12 characters' });
        }

        // 2. Email validation
        // Unique (checked later via DB) - Basic format check could be added here but DB unique constraint covers duplication

        // 3. Password validation
        // Unique (interpreted as strong/complex), > 8 chars, small case, large case, special char
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{9,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be > 8 characters and contain a lowercase, uppercase, and special character'
            });
        }

        // Check for existing user or email
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ message: 'Login ID already exists' });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'Email ID already exists' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password_hash: hashedPassword,
            },
        });

        // Auto-login after register
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
