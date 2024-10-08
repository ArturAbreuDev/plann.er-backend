import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export async function getParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/participant/:participantId",
    {
      schema: {
        summary: 'pega um participante especifico',
        tags: ['participant'],
        params: z.object({
          participantId: z.string().uuid(),
        }),
      },
    },
    async (request) => {
      const { participantId } = request.params;

      const participant = await prisma.participant.findUnique({
        select: {
          id: true,
          email: true,
          name: true,
          is_confirmed: true
        },
        where: {
          id: participantId,
        },
      });

      if (!participant) {
        throw new ClientError("Participant not found!");
      }

      return {
        participant,
      };
    }
  );
}
