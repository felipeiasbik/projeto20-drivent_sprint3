import httpStatus from "http-status";
import supertest from "supertest";
import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import { createTypeHotels } from "../factories/hotels-factory";
import {
  createEnrollmentWithAddress,
  createPayment,
  createTicketType,
  createTicketTypeIsRemote,
  createTicketTypeNotIncludesHotel,
  createUser
} from "../factories";
import * as jwt from 'jsonwebtoken';
import faker from "@faker-js/faker";
import { createTicket } from "../factories";
import { TicketStatus } from "@prisma/client";

beforeEach(async () => {
    await init();
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

      it("should respond with status 404 when no hotels found", async () => {
          const token = await generateValidToken(); 
          const {status} = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
          expect(status).toBe(httpStatus.NOT_FOUND);
      });

        it("should respond with status 200 and with the list of available hotels", async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketType();
          const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          const payment = await createPayment(ticket.id, ticketType.price);
          const {name, image} = await createTypeHotels();
          const {status, body} = await server.get("/hotels").set('Authorization', `Bearer ${token}`);
          expect(body).toEqual(
              expect.arrayContaining([
                  expect.objectContaining({
                      name, image
                  })
              ])
          );
          expect(status).toBe(httpStatus.OK);
        });
    });

});