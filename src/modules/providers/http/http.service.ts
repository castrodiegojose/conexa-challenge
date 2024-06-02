import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import StarWarsApiResponse from '../types/starWarsApiResponse.type';

@Injectable()
export class HttpServices {
  constructor(private readonly httpService: HttpService) {}
  async getStarWarsMovies(): Promise<StarWarsApiResponse[]> {
    const apiResponse = await this.httpService.axiosRef.get(
      `${process.env.STAR_WARS_URL}/films`,
    );

    if (apiResponse.status !== 200) {
      throw new BadRequestException('Request proccessed with errors');
    }

    return apiResponse.data.results;
  }
}
