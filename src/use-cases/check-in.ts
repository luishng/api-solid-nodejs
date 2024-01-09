import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { GymsRepository } from './../repositories/gyms-repository';
import { CheckIn } from '@prisma/client';
import { CheckInsRepository } from '@/repositories/check-ins-repository';
import { getDistanceBetweenCoordinates } from '@/utils/get-distance-betweeen-coordinates';
import { MaxNumbersOfCheckInsError } from './errors/max-number-of-check-ins-error';
import { MaxDistanceError } from './errors/max-distance-error';

interface CheckInUseCaseRequest {
  userId: string
  gymId: string
  userLatidude: number
  userLongitude: number
}

interface CheckInUseCaseResponse {
  checkIn: CheckIn
}

export class CheckInUseCase {
  constructor(
    private checkInsRepository: CheckInsRepository,
    private gymsRepository: GymsRepository
  ) { }

  async execute({ userId, gymId, userLatidude, userLongitude }: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse> {
    const gym = await this.gymsRepository.findById(gymId)

    if (!gym) {
      throw new ResourceNotFoundError()
    }

    // calculate distance between user and gym

    const distance = getDistanceBetweenCoordinates(
      { latitude: userLatidude, longitude: userLongitude },
      { latitude: gym.latitude.toNumber(), longitude: gym.longitude.toNumber() }
    )

    const MAX_DISTANCE_IN_KILOMETERS = 0.1

    if (distance > MAX_DISTANCE_IN_KILOMETERS) {
      throw new MaxDistanceError()
    }

    const checkInOnSameDay = await this.checkInsRepository.findByUserIdOnDate(userId, new Date())

    if (checkInOnSameDay) {
      throw new MaxNumbersOfCheckInsError()
    }

    const checkIn = await this.checkInsRepository.create({ user_id: userId, gym_id: gymId })

    return { checkIn }
  }
}