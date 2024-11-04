import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { parse, validate, execute } from 'graphql';
import { createSchema } from './schema.js';
import { depthLimitRule } from './rules.js';
import { createLoaders } from './loaders.js';
import { PrismaClient } from '@prisma/client';

interface ContextValue {
  prisma: PrismaClient;
  loaders?: ReturnType<typeof createLoaders>;
}

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const schema = createSchema();

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;

      const contextValue: ContextValue = { prisma };
      contextValue.loaders = createLoaders(contextValue);

      try {
        const documentAST = parse(query);

        const validationErrors = validate(schema, documentAST, [depthLimitRule]);
        if (validationErrors.length > 0) {
          return { errors: validationErrors };
        }

        const result = await execute({
          schema,
          document: documentAST,
          variableValues: variables,
          contextValue,
        });

        return result;
      } catch (error) {
        return { errors: [error] };
      }
    },
  });
};

export default plugin;
