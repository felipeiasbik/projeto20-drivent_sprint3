import { notFoundError, paymentRequired } from "../../errors";
import enrollmentRepository from "../../repositories/enrollment-repository";
import hotelsRepository from "../../repositories/hotels-repository";
import ticketTypeRepository from "../../repositories/ticket-type-repository";
import ticketsRepository from "../../repositories/tickets-repository";

async function getHotels(userId: number){

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError();

    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) throw notFoundError();

    const ticketType = await ticketTypeRepository.findTicketTypeByTicketId(ticket.ticketTypeId);
    if (
        ticket.status !== "PAID" ||
        ticketType.includesHotel === false || 
        ticketType.isRemote === true
        ){
            throw paymentRequired();
        };
   
    const hotels = await hotelsRepository.getHotels();
    if (hotels.length === 0) throw notFoundError();

    return hotels;
}

async function getRoomsHotelsId(userId: number, hotelId: number){

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError();

    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) throw notFoundError();

    const ticketType = await ticketTypeRepository.findTicketTypeByTicketId(ticket.ticketTypeId);
    if (
        ticket.status !== "PAID" ||
        ticketType.includesHotel === false || 
        ticketType.isRemote === true
        ){
            throw paymentRequired();
        };
   
    const hotels = await hotelsRepository.getHotels();
    if (hotels.length === 0) throw notFoundError();

    const rooms = await hotelsRepository.getRoomsHotelsId(hotelId);

    return rooms;
}

const hotelsService = {
    getHotels, getRoomsHotelsId
}

export default hotelsService;