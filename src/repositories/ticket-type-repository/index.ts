import { prisma } from "@/config";

async function findTicketTypeByTicketId(id:number){
    return await prisma.ticketType.findFirst({
        where: {id}
    });
}

const ticketTypeRepository = {
    findTicketTypeByTicketId
};

export default ticketTypeRepository;