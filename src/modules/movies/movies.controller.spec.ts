import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { MovieRequestBody } from './dto/movieRequestBody.dto';
import { Response, Request } from 'express';
import ClientResponse from '../../common/interfaces/clientResponse.interface';
import { Movie } from '../../schemas/movies.schema';
import { HttpStatus } from '@nestjs/common';

describe('MoviesController', () => {
  let moviesController: MoviesController;
  let moviesService: MoviesService;

  const mockNewMovieOk = {
    title: 'Batman',
    episode_id: 2,
    opening_crawl: 'Gotham is attacked',
    director: 'Tim Burton',
    producer: 'Tim Burton',
    release_date: '17/03/1994',
    url: 'http://batman-and-robin.co',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: {
            getMovies: jest.fn(),
            createMovie: jest.fn(),
            updateMovie: jest.fn(),
            deleteMovie: jest.fn(),
          },
        },
      ],
    }).compile();

    moviesController = module.get<MoviesController>(MoviesController);
    moviesService = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(moviesController).toBeDefined();
  });

  describe('createMovie', () => {
    it('should create a Movie', async () => {
      const userId = expect.any(String);
      const newMovie: MovieRequestBody = mockNewMovieOk;
      const req = { user: { sub: userId } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response<ClientResponse<Movie>>;

      const results = {
        data: mockNewMovieOk,
        message: 'Movie created successfully',
        isSuccess: true,
        statusCode: 200,
      };

      jest.spyOn(moviesService, 'createMovie').mockResolvedValue(results);

      await moviesController.createMovie(req, res, newMovie);

      expect(moviesService.createMovie).toHaveBeenCalledWith(userId, newMovie);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(results);
    });
  });

  describe('updateMovie', () => {
    it('should update a Movie', async () => {
      const userId = expect.any(String);
      const newMovie: MovieRequestBody = mockNewMovieOk;
      const req = { user: { sub: userId } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response<ClientResponse<Movie>>;
      const movieId = expect.any(String);

      const results = {
        data: mockNewMovieOk,
        message: 'Movie updated successfully!',
        isSuccess: true,
        statusCode: 200,
      };

      jest.spyOn(moviesService, 'updateMovie').mockResolvedValue(results);

      await moviesController.updateMovie(req, res, movieId, newMovie);

      expect(moviesService.updateMovie).toHaveBeenCalledWith(
        userId,
        newMovie,
        movieId,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(results);
    });
  });

  describe('deleteMovie', () => {
    it('should delete a Movie', async () => {
      const userId = expect.any(String);
      const req = { user: { sub: userId } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response<ClientResponse<Movie>>;
      const movieId = expect.any(String);

      const results = {
        data: mockNewMovieOk,
        message: 'Movie deleted successfully!',
        isSuccess: true,
        statusCode: 200,
      };

      jest.spyOn(moviesService, 'deleteMovie').mockResolvedValue(results);

      await moviesController.deleteteMovie(req, res, movieId);

      expect(moviesService.deleteMovie).toHaveBeenCalledWith(userId, movieId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(results);
    });
  });

  describe('getMovies', () => {
    it('should Get a Movie', async () => {
      const userId = expect.any(String);
      const req = { user: { sub: userId } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response<ClientResponse<Movie>>;
      const movieId = expect.any(String);

      const results = {
        data: mockNewMovieOk,
        message: 'Request successfully!',
        isSuccess: true,
        statusCode: 200,
      };

      jest.spyOn(moviesService, 'getMovies').mockResolvedValue(results);

      await moviesController.getMovies(req, res, movieId);

      expect(moviesService.getMovies).toHaveBeenCalledWith(userId, movieId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(results);
    });
  });
});
