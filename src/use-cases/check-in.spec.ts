import { MaxNumbersOfCheckInsError } from './errors/max-number-of-check-ins-error';
import { InMemoryGymsRepository } from './../repositories/in-memory/in-memory-gyms-repository';
import { CheckInUseCase } from './check-in';
import { InMemoryCheckInsRepository } from './../repositories/in-memory/in-memory-check-ins-repository';
import { expect, it, describe, beforeEach, vi, afterEach } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library';
import { MaxDistanceError } from './errors/max-distance-error';

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Check In Use Case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)

    await gymsRepository.create({
      id: 'gym-01',
      title: 'NodeJs Gym',
      description: '',
      latitude: 0,
      longitude: 0,
      phone: ''
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in.', async () => {
    vi.setSystemTime(new Date(2024, 0, 9, 8, 0, 0))

    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatidude: 0,
      userLongitude: 0,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice in the same day.', async () => {
    vi.setSystemTime(new Date(2024, 0, 9, 8, 0, 0))

    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatidude: 0,
      userLongitude: 0,
    })

    await expect(sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatidude: 0,
      userLongitude: 0,
    })).rejects.toBeInstanceOf(MaxNumbersOfCheckInsError)
  })

  it('should be able to check in twice but in differents days.', async () => {
    vi.setSystemTime(new Date(2024, 0, 9, 8, 0, 0))

    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatidude: 0,
      userLongitude: 0,
    })

    vi.setSystemTime(new Date(2024, 0, 8, 8, 0, 0))

    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatidude: 0,
      userLongitude: 0,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })


  it('should not be able to check in on distant gym.', async () => {
    vi.setSystemTime(new Date(2024, 0, 9, 8, 0, 0))

    // gymsRepository.items.push({
    //   id: 'gym-02',
    //   title: 'NodeJs Gym',
    //   description: '',
    //   latitude: new Decimal(-15.7931721),
    //   longitude: new Decimal(-47.8267697),
    //   phone: ''
    // })

    gymsRepository.items.push({
      id: 'gym-02',
      title: 'NodeJs Gym',
      description: '',
      latitude: new Decimal(-15.7426504),
      longitude: new Decimal(-48.1704109),
      phone: ''
    })


    await expect(() => sut.execute({
      gymId: 'gym-02',
      userId: 'user-01',
      userLatidude: -15.7919384,
      userLongitude: -47.8266624,
    })).rejects.toBeInstanceOf(MaxDistanceError)
  })
})