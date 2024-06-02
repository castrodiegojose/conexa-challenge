import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { ProvidersModule } from '../providers/providers.module';
import { Model } from 'mongoose';
import { Movie } from '../../schemas/movies.schema';
import { User, UserRole } from '../../schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { HttpStatus } from '@nestjs/common';

const mockUserModel = {
  findById: jest.fn(),
  findOne: jest.fn(),
};
const mockMovieModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  create: jest.fn(),
  startSession: jest.fn().mockReturnValue({
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  }),
};
const mockHttpService = {};

describe('MoviesService', () => {
  let service: MoviesService;
  let movieModel: any;
  let userModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ProvidersModule],
      providers: [
        MoviesService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(Movie.name), useValue: mockMovieModel },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    movieModel = module.get<Model<Movie>>(getModelToken(Movie.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMovies', () => {
    it('should return movies when no id is provided', async () => {
      const userId = '665a1e9004779823055ddfdd';
      const expectedMovies = [
        {
          _id: '665a371138d88a45451d5c62',
          title: 'A New Hope',
          episode_id: 4,
          opening_crawl:
            "It is a period of civil war.\r\nRebel spaceships, striking\r\nfrom a hidden base, have won\r\ntheir first victory against\r\nthe evil Galactic Empire.\r\n\r\nDuring the battle, Rebel\r\nspies managed to steal secret\r\nplans to the Empire's\r\nultimate weapon, the DEATH\r\nSTAR, an armored space\r\nstation with enough power\r\nto destroy an entire planet.\r\n\r\nPursued by the Empire's\r\nsinister agents, Princess\r\nLeia races home aboard her\r\nstarship, custodian of the\r\nstolen plans that can save her\r\npeople and restore\r\nfreedom to the galaxy....",
          director: 'George Lucas',
          producer: 'Gary Kurtz, Rick McCallum',
          release_date: '1977-05-25',
          url: 'https://swapi.dev/api/films/1/',
          createdAt: '2024-05-31T20:46:09.623Z',
          updatedAt: '2024-05-31T20:46:09.623Z',
          __v: 0,
        },
        {
          _id: '665a371138d88a45451d5c63',
          title: 'The Empire Strikes Back',
          episode_id: 5,
          opening_crawl:
            'It is a dark time for the\r\nRebellion. Although the Death\r\nStar has been destroyed,\r\nImperial troops have driven the\r\nRebel forces from their hidden\r\nbase and pursued them across\r\nthe galaxy.\r\n\r\nEvading the dreaded Imperial\r\nStarfleet, a group of freedom\r\nfighters led by Luke Skywalker\r\nhas established a new secret\r\nbase on the remote ice world\r\nof Hoth.\r\n\r\nThe evil lord Darth Vader,\r\nobsessed with finding young\r\nSkywalker, has dispatched\r\nthousands of remote probes into\r\nthe far reaches of space....',
          director: 'Irvin Kershner',
          producer: 'Gary Kurtz, Rick McCallum',
          release_date: '1980-05-17',
          url: 'https://swapi.dev/api/films/2/',
          createdAt: '2024-05-31T20:46:09.623Z',
          updatedAt: '2024-05-31T20:46:09.623Z',
          __v: 0,
        },
      ];
      movieModel.find.mockResolvedValue(expectedMovies);

      const result = await service.getMovies(userId, undefined);

      expect(movieModel.find).toHaveBeenCalledWith({});
      expect(result.data).toEqual(expectedMovies);
      expect(result.statusCode).toEqual(HttpStatus.OK);
    });

    it('should return an error if the user is not a regular user', async () => {
      const userId = '665a1e9004779823055ddfdd';
      const movieId = '665a371138d88a45451d5c62';
      const user = { userRole: UserRole.ADMIN };
      userModel.findById.mockResolvedValue(user);

      const result = await service.getMovies(userId, movieId);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toBe('You are not allowed to get a movie');
      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return a movie if the user is a regular user', async () => {
      const userId = '665a1e9004779823055ddfdd';
      const movieId = '665a371138d88a45451d5c62';
      const user = { userRole: UserRole.REGULAR_USER };
      const expectedMovie = {
        _id: '665a371138d88a45451d5c62',
        title: 'A New Hope',
        episode_id: 4,
        opening_crawl:
          "It is a period of civil war.\r\nRebel spaceships, striking\r\nfrom a hidden base, have won\r\ntheir first victory against\r\nthe evil Galactic Empire.\r\n\r\nDuring the battle, Rebel\r\nspies managed to steal secret\r\nplans to the Empire's\r\nultimate weapon, the DEATH\r\nSTAR, an armored space\r\nstation with enough power\r\nto destroy an entire planet.\r\n\r\nPursued by the Empire's\r\nsinister agents, Princess\r\nLeia races home aboard her\r\nstarship, custodian of the\r\nstolen plans that can save her\r\npeople and restore\r\nfreedom to the galaxy....",
        director: 'George Lucas',
        producer: 'Gary Kurtz, Rick McCallum',
        release_date: '1977-05-25',
        url: 'https://swapi.dev/api/films/1/',
        createdAt: '2024-05-31T20:46:09.623Z',
        updatedAt: '2024-05-31T20:46:09.623Z',
        __v: 0,
      };
      userModel.findById.mockResolvedValue(user);
      movieModel.find.mockResolvedValue([expectedMovie]);

      const result = await service.getMovies(userId, movieId);

      expect(userModel.findById).toHaveBeenCalledWith(userId);
      expect(movieModel.find).toHaveBeenCalledWith({ _id: movieId });
      expect(result.data).toEqual([expectedMovie]);
      expect(result.statusCode).toEqual(HttpStatus.OK);
    });
  });

  describe('updateMovie', () => {
    it('should update a movie if the user is an admin', async () => {
      const userId = '665a1e9004779823055ddfdd';
      const movieId = '665a371138d88a45451d5c62';
      const updateMovie = {
        title: 'A New Hope',
        episode_id: 4,
        opening_crawl:
          "It is a period of civil war.\r\nRebel spaceships, striking\r\nfrom a hidden base, have won\r\ntheir first victory against\r\nthe evil Galactic Empire.\r\n\r\nDuring the battle, Rebel\r\nspies managed to steal secret\r\nplans to the Empire's\r\nultimate weapon, the DEATH\r\nSTAR, an armored space\r\nstation with enough power\r\nto destroy an entire planet.\r\n\r\nPursued by the Empire's\r\nsinister agents, Princess\r\nLeia races home aboard her\r\nstarship, custodian of the\r\nstolen plans that can save her\r\npeople and restore\r\nfreedom to the galaxy....",
        director: 'George Lucas',
        producer: 'Gary Kurtz, Rick McCallum',
        release_date: '1977-05-25',
        url: 'https://swapi.dev/api/films/1/',
      };
      const user = { userRole: UserRole.ADMIN };
      const movie = {
        _id: '665a371138d88a45451d5c62',
        title: 'New title',
        episode_id: 4,
        opening_crawl:
          "It is a period of civil war.\r\nRebel spaceships, striking\r\nfrom a hidden base, have won\r\ntheir first victory against\r\nthe evil Galactic Empire.\r\n\r\nDuring the battle, Rebel\r\nspies managed to steal secret\r\nplans to the Empire's\r\nultimate weapon, the DEATH\r\nSTAR, an armored space\r\nstation with enough power\r\nto destroy an entire planet.\r\n\r\nPursued by the Empire's\r\nsinister agents, Princess\r\nLeia races home aboard her\r\nstarship, custodian of the\r\nstolen plans that can save her\r\npeople and restore\r\nfreedom to the galaxy....",
        director: 'George Lucas',
        producer: 'Gary Kurtz, Rick McCallum',
        release_date: '1977-05-25',
        url: 'https://swapi.dev/api/films/1/',
        createdAt: '2024-05-31T20:46:09.623Z',
        updatedAt: '2024-05-31T20:46:09.623Z',
        __v: 0,
      };
      const updatedMovie = { ...movie, ...updateMovie };
      userModel.findOne.mockResolvedValue(user);
      movieModel.findById.mockResolvedValue(movie);
      movieModel.findByIdAndUpdate.mockResolvedValue(updatedMovie);

      const result = await service.updateMovie(userId, updateMovie, movieId);

      expect(userModel.findOne).toHaveBeenCalledWith({ _id: userId });
      expect(movieModel.findById).toHaveBeenCalledWith(movieId);
      expect(movieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        movieId,
        expect.objectContaining(updateMovie),
        expect.any(Object),
      );
      expect(result.data).toEqual(updatedMovie);
      expect(result.statusCode).toEqual(HttpStatus.OK);
    });

    it('should return an error if the user is not an admin', async () => {
      const userId = '665a1e9004779823055ddfdd';
      const movieId = '665a371138d88a45451d5c62';
      const updateMovie = {
        _id: '665a371138d88a45451d5c62',
        title: 'A New Hope',
        episode_id: 4,
        opening_crawl:
          "It is a period of civil war.\r\nRebel spaceships, striking\r\nfrom a hidden base, have won\r\ntheir first victory against\r\nthe evil Galactic Empire.\r\n\r\nDuring the battle, Rebel\r\nspies managed to steal secret\r\nplans to the Empire's\r\nultimate weapon, the DEATH\r\nSTAR, an armored space\r\nstation with enough power\r\nto destroy an entire planet.\r\n\r\nPursued by the Empire's\r\nsinister agents, Princess\r\nLeia races home aboard her\r\nstarship, custodian of the\r\nstolen plans that can save her\r\npeople and restore\r\nfreedom to the galaxy....",
        director: 'George Lucas',
        producer: 'Gary Kurtz, Rick McCallum',
        release_date: '1977-05-25',
        url: 'https://swapi.dev/api/films/1/',
        createdAt: '2024-05-31T20:46:09.623Z',
        updatedAt: '2024-05-31T20:46:09.623Z',
        __v: 0,
      };
      const user = { userRole: UserRole.REGULAR_USER };
      userModel.findOne.mockResolvedValue(user);

      const result = await service.updateMovie(userId, updateMovie, movieId);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toBe('You are not allowed to create a new movie');
      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('createMovie', () => {
    it('should create a new movie if the user is an admin', async () => {
      const userId = 'someUserId';
      const newMovie = {
        title: 'A New Hope',
        episode_id: 4,
        opening_crawl:
          "It is a period of civil war.\r\nRebel spaceships, striking\r\nfrom a hidden base, have won\r\ntheir first victory against\r\nthe evil Galactic Empire.\r\n\r\nDuring the battle, Rebel\r\nspies managed to steal secret\r\nplans to the Empire's\r\nultimate weapon, the DEATH\r\nSTAR, an armored space\r\nstation with enough power\r\nto destroy an entire planet.\r\n\r\nPursued by the Empire's\r\nsinister agents, Princess\r\nLeia races home aboard her\r\nstarship, custodian of the\r\nstolen plans that can save her\r\npeople and restore\r\nfreedom to the galaxy....",
        director: 'George Lucas',
        producer: 'Gary Kurtz, Rick McCallum',
        release_date: '1977-05-25',
        url: 'https://swapi.dev/api/films/1/',
      };
      const user = { userRole: UserRole.ADMIN };
      const createdMovie = [{ _id: 'newMovieId', ...newMovie }];
      userModel.findOne.mockResolvedValue(user);
      movieModel.create.mockResolvedValue(createdMovie);

      const result = await service.createMovie(userId, newMovie);

      expect(userModel.findOne).toHaveBeenCalledWith({ _id: userId });
      expect(movieModel.create).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining(newMovie)]),
        expect.any(Object),
      );
      expect(result.data).toEqual(createdMovie[0]);
      expect(result.statusCode).toEqual(HttpStatus.OK);
    });

    it('should return an error if the user is not an admin', async () => {
      const userId = '665a1e9004779823055ddfdd';
      const newMovie = {
        title: 'A New Hope',
        episode_id: 4,
        opening_crawl:
          "It is a period of civil war.\r\nRebel spaceships, striking\r\nfrom a hidden base, have won\r\ntheir first victory against\r\nthe evil Galactic Empire.\r\n\r\nDuring the battle, Rebel\r\nspies managed to steal secret\r\nplans to the Empire's\r\nultimate weapon, the DEATH\r\nSTAR, an armored space\r\nstation with enough power\r\nto destroy an entire planet.\r\n\r\nPursued by the Empire's\r\nsinister agents, Princess\r\nLeia races home aboard her\r\nstarship, custodian of the\r\nstolen plans that can save her\r\npeople and restore\r\nfreedom to the galaxy....",
        director: 'George Lucas',
        producer: 'Gary Kurtz, Rick McCallum',
        release_date: '1977-05-25',
        url: 'https://swapi.dev/api/films/1/',
      };
      const user = { userRole: UserRole.REGULAR_USER };
      userModel.findOne.mockResolvedValue(user);

      const result = await service.createMovie(userId, newMovie);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toBe('You are not allowed to create a new movie');
      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('deleteMovie', () => {
    it('should delete a movie if the user is an admin', async () => {
      const userId = '665a1e9004779823055ddfdd';
      const movieId = '665a371138d88a45451d5c62';
      const user = { userRole: UserRole.ADMIN };
      const movie = { _id: movieId, title: 'Movie to delete' };
      userModel.findOne.mockResolvedValue(user);
      movieModel.findById.mockResolvedValue(movie);
      movieModel.findByIdAndDelete.mockResolvedValue(movie);

      const result = await service.deleteMovie(userId, movieId);

      expect(userModel.findOne).toHaveBeenCalledWith({ _id: userId });
      expect(movieModel.findById).toHaveBeenCalledWith(movieId);
      expect(movieModel.findByIdAndDelete).toHaveBeenCalledWith(
        movieId,
        expect.any(Object),
      );
      expect(result.data).toEqual(movie);
      expect(result.statusCode).toEqual(HttpStatus.OK);
    });

    it('should return an error if the user is not an admin', async () => {
      const userId = '665a1e9004779823055ddfdd';
      const movieId = '665a371138d88a45451d5c62';
      const user = { userRole: UserRole.REGULAR_USER };
      userModel.findOne.mockResolvedValue(user);

      const result = await service.deleteMovie(userId, movieId);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toBe('You are not allowed to delete a movie');
      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
