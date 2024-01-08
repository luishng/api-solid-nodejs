import { UserAlreadyExistsError } from './errors/user-already-exists';
import { expect, it, describe } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs';
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository';

describe('Register Service', () => {
  it('should be able to register.', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const RegisterUseCase = new RegisterUseCase(usersRepository)

    const { user } = await RegisterUseCase.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456'
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('should hash user password upon registration', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const RegisterUseCase = new RegisterUseCase(usersRepository)

    const { user } = await RegisterUseCase.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456'
    })

    const isPasswordCorrectluHashed = await compare('123456', user.password_hash)

    expect(isPasswordCorrectluHashed).toBe(true)
  })

  it('should not be able to register with same email twice', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const RegisterUseCase = new RegisterUseCase(usersRepository)

    const email = 'johndoe@example.com'

    await RegisterUseCase.execute({
      name: 'John Doe',
      email,
      password: '123456'
    })

    await expect(() =>
      RegisterUseCase.execute({
        name: 'John Doe',
        email,
        password: '123456'
      })).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})