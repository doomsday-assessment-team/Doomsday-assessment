import { Router } from "express";
import express, { Request, Response, NextFunction } from 'express';
import { getAllDifficulties } from "../services/difficulty.service"; 
const router = Router();

router.get('/difficulties', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const difficulties = await getAllDifficulties();
		res.json(difficulties);
	} catch (error) {
		next(error);
	}
});

export default router;