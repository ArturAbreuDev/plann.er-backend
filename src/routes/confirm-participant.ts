import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";
import { env } from "../env";

export async function confirmParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/participants/:participantsId/confirm",
    {
      schema: {
        params: z.object({
          participantsId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { participantsId } = request.params;

      const participant = await prisma.participant.findUnique({
        where: {
          id: participantsId,
        },
      });

      if (!participant) {
        throw new ClientError("Participant not found");
      }

      if (participant.is_confirmed) {
        return reply.redirect(
          `${env.API_WEB_URL}/trips/${participant.trip_id}`
        );
      }

      await prisma.participant.update({
        where: {
          id: participantsId,
        },
        data: {
          is_confirmed: true,
        },
      });

      return reply.redirect(
        `${env.API_WEB_URL}/trips/${participant.trip_id}`
      );
    }
  );
}
