import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';

export const createQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/questions',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          question: z.string().min(1),
        }),
      },
    },
    async ({ body, params }, reply) => {
      const { roomId } = params;
      const { question } = body;

      const result = await db
        .insert(schema.questions)
        .values({
          roomId,
          question,
        })
        .returning();

      const insertedQuestion = result[0];

      if (!insertedQuestion) {
        throw new Error('Failed to create question');
      }

      return reply.status(201).send({ questionId: insertedQuestion.id });
    }
  );
};
