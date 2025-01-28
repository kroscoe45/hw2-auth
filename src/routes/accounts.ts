import express, { Request, Response } from 'express';
import { hashPassword, comparePasswords } from '../util/hashPassword';
import { generateToken } from '../utils/generateToken';
import { authenticateToken } from '../middlewares/authMiddleware';