import httpStatus from "http-status";
import supertest from "supertest";
import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import { createTypeHotels } from "../factories/hotels-factory";
import {
  createEnrollmentWithAddress,
  createPayment,
  createTicketTypeParams,
  createUser
} from "../factories";
import * as jwt from 'jsonwebtoken';
import faker from "@faker-js/faker";
import { createTicket } from "../factories";
import { TicketStatus } from "@prisma/client";
import { createRooms } from "../factories/rooms-factory";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
    it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

    describe("when token is valid", () => {

      it("should respond with status 200 and with the list of available hotels", async () => {
        
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeParams(false, true);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);

        const {id, name, image, createdAt, updatedAt} = await createTypeHotels();
        const {status, body} = await server.get("/hotels").set('Authorization', `Bearer ${token}`);
        
        expect(body).toEqual([{
          id,
          name,
          image,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString()
        }]);

        expect(status).toBe(httpStatus.OK);

      });

      it("should respond with 404 if no enrollment to user", async () => {

        const user = await createUser();
        const token = await generateValidToken(user);

        const {status} = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(status).toEqual(httpStatus.NOT_FOUND);

      });

      it("should respond with 404 if no ticket to user", async () => {

        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);

        const {status} = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(status).toEqual(httpStatus.NOT_FOUND);
        
      });

      it("should respond with 404 if there is no hotel", async () => {

        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeParams(false, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const {status} = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(status).toEqual(httpStatus.NOT_FOUND);
        
      });

      it("should respond with 402 if ticket has not been paid", async () => {

        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeParams(false, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        const {status} = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(status).toEqual(httpStatus.PAYMENT_REQUIRED);

      });

      it("should respond with 402 if ticket is remote", async () => {

        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeParams(true, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const {status} = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(status).toEqual(httpStatus.PAYMENT_REQUIRED);

      });

      it("should respond with 402 if ticket does not include hotel", async () => {

        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeParams(false, false);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const {status} = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(status).toEqual(httpStatus.PAYMENT_REQUIRED);

      });

    });

});

describe('GET /hotels/:hotelId', () => {
  it('should respond with status 401 if no token is given', async () => {
  const response = await server.get('/hotels/1');

  expect(response.status).toBe(httpStatus.UNAUTHORIZED);
});

it('should respond with status 401 if given token is not valid', async () => {
  const token = faker.lorem.word();

  const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(httpStatus.UNAUTHORIZED);
});

it('should respond with status 401 if there is no session for given token', async () => {
  const userWithoutSession = await createUser();
  const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

  const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(httpStatus.UNAUTHORIZED);
});

  describe("when token is valid", () => {

    it("should respond with status 200 and with the list of available hotels", async () => {
        
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeParams(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createTypeHotels();
      const room = await createRooms(hotel.id);

      const {status, body} = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

      expect(body).toEqual({
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: [
          {
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            hotelId: room.hotelId,
            createdAt: room.createdAt.toISOString(),
            updatedAt: room.updatedAt.toISOString(),
          },
        ],
      });

      expect(status).toBe(httpStatus.OK);

    });

    it("should respond with 404 if no enrollment to user", async () => {

      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createTypeHotels();

      const {status} = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);

    });

    it("should respond with 404 if no ticket to user", async () => {

      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const hotel = await createTypeHotels();

      const {status} = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
      
    });

    it("should respond with 404 if there is no hotel", async () => {

      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeParams(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const {status} = await server.get("/hotels/0").set("Authorization", `Bearer ${token}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
      
    });

    it("should respond with 402 if ticket has not been paid", async () => {

      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeParams(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const hotel = await createTypeHotels();

      const {status} = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(status).toEqual(httpStatus.PAYMENT_REQUIRED);

    });

    it("should respond with 402 if ticket is remote", async () => {

      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeParams(true, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createTypeHotels();

      const {status} = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(status).toEqual(httpStatus.PAYMENT_REQUIRED);

    });

    it("should respond with 402 if ticket does not include hotel", async () => {

      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeParams(false, false);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createTypeHotels();

      const {status} = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(status).toEqual(httpStatus.PAYMENT_REQUIRED);

    });

  });

});