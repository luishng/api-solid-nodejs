import { UserAlreadyExistsError } from '../../use-cases/errors/user-already-exists'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { RegisterUseCase } from '@/use-cases/register'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  })

  const { name, email, password } = registerBodySchema.parse(request.body)

  try {
    const usersRepository = new PrismaUsersRepository()
    const RegisterUseCaseInstance = new RegisterUseCase(usersRepository)

    await RegisterUseCaseInstance.execute({ name, email, password })
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      reply.status(409).send({ message: error.message })
    }

    throw error
  }

  reply.status(201).send()
}
