import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares";


export async function getHotels(req: AuthenticatedRequest, res: Response){
    return res.send("Hotel OK");
}

export async function getHotelsId(req: AuthenticatedRequest, res: Response){
    return res.send("Hotel Id OK");
}