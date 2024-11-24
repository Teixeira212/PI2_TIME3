import express from 'express';
import { Jwt, JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: { email: string } | string | JwtPayload;
        }
    }
}