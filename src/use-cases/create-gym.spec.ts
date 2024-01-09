import { CreateGymUseCase } from './create-gym';
import { InMemoryGymsRepository } from './../repositories/in-memory/in-memory-gyms-repository';
import { expect, it, describe, beforeEach } from 'vitest'

let gymsRepository: InMemoryGymsRepository
let sut: CreateGymUseCase

describe('Create Gym Use Case', () => {
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository()
    sut = new CreateGymUseCase(gymsRepository)
  })

  it('should be able to create a gym.', async () => {

    const { gym } = await sut.execute({
      title: 'NodeJs Gym',
      description: null,
      phone: null,
      latitude: -15.7426504,
      longitude: -48.1704109,
    })

    expect(gym.id).toEqual(expect.any(String))
  })
})