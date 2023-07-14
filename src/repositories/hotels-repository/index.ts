import { prisma } from "../../config";


async function getHotels(){
    return await prisma.hotel.findMany();
}

async function getRoomsHotelsId(id: number){
    return await prisma.hotel.findFirst({
        include: { Rooms: true },
        where: { id },
    });
}

const hotelsRepository = {
    getHotels, getRoomsHotelsId
}

export default hotelsRepository;