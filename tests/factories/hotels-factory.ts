import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createTypeHotels(){
    return prisma.hotel.create({
        data: {
            name: faker.name.findName(),
            image: faker.image.business()
        }
    });
}