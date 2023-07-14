import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import hotelsService from "@/services/hotels-service";


export async function getHotels(req: AuthenticatedRequest, res: Response){
    const { userId } = req;
    const hotels = await hotelsService.getHotels(userId);

    return res.send(hotels);
}

export async function getRoomsHotelsId(req: AuthenticatedRequest, res: Response){
    const { userId } = req;
    const { hotelId } = req.params;
    
    const rooms = await hotelsService.getRoomsHotelsId(userId, Number(hotelId));
    return res.send(rooms);
}