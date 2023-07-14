import { prisma } from "../../config";


async function getHotels(){
    return await prisma.hotel.findMany();
}

async function getHotelsId(){

}

const hotelsRepository = {
    getHotels, getHotelsId
}

export default hotelsRepository;