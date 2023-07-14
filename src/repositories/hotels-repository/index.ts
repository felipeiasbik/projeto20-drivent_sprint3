import { prisma } from "../../config";


async function getHotels(){
    return await prisma.hotel.findMany();
}

async function getRoomsHotelsId(hotelId: number){
    return await prisma.room.findMany({
        where: { hotelId }
    });
}

const hotelsRepository = {
    getHotels, getRoomsHotelsId
}

export default hotelsRepository;