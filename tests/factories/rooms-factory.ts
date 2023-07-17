import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createRooms(hotelId: number){
    return prisma.room.create({
        data: {
            hotelId,
            name: faker.name.jobArea(),
            capacity: faker.datatype.number({
                min: 1,
                max: 3
            })
        }
    });
}