import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import ControlledException from '../../common/exceptions/controller.exceptions';
import ClientResponse from '../../common/interfaces/clientResponse.interface';
import { Movie } from '../../schemas/movies.schema';
import { User, UserRole } from '../../schemas/user.schema';
import { HttpServices } from '../providers/http/http.service';
import StarWarsApiResponse from '../providers/types/starWarsApiResponse.type';
import { MovieRequestBody } from './dto/movieRequestBody.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    @InjectModel(User.name) private userModel: Model<User>,
    private httpService: HttpServices,
  ) {}

  async getMovies(
    userId: string,
    id: string | undefined,
  ): Promise<ClientResponse<Movie[] | Movie>> {
    try {
      let query = {};
      if (id !== undefined) {
        /* According to the instructions, only regular users are allowed 
        to make the request for a single movie.*/
        const regularUser = await this.userModel.findById(userId);
        if (regularUser.userRole !== UserRole.REGULAR_USER) {
          throw new ControlledException(
            'You are not allowed to get a movie',
            HttpStatus.BAD_REQUEST,
          );
        }
        query = { _id: id };
      }

      const movies = await this.movieModel.find(query);

      const response: ClientResponse<Movie[] | Movie> = {
        data: movies,
        message: 'Request successfully!',
        isSuccess: true,
        statusCode: HttpStatus.OK,
      };

      return response;
    } catch (error) {
      const message = error.message ?? 'Something went wrong!';

      return {
        data: null,
        isSuccess: false,
        message,
        statusCode: error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async updateMovie(
    userId: string,
    updateMovie: MovieRequestBody,
    id: string,
  ): Promise<ClientResponse<Movie>> {
    const session = await this.movieModel.startSession();
    try {
      session.startTransaction();

      const userAdmin = await this.userModel.findOne({ _id: userId });

      if (userAdmin.userRole !== UserRole.ADMIN) {
        throw new ControlledException(
          'You are not allowed to create a new movie',
          HttpStatus.BAD_REQUEST,
        );
      }

      const movie = await this.movieModel.findById(id);

      if (!movie) {
        throw new ControlledException(
          'The movie does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }

      const movieUpdated = await this.movieModel.findByIdAndUpdate(
        id,
        {
          title: updateMovie.title,
          episode_id: updateMovie.episode_id,
          opening_crawl: updateMovie.opening_crawl,
          director: updateMovie.director,
          producer: updateMovie.producer,
          release_date: updateMovie.release_date,
          url: updateMovie.url,
        },
        { session, new: true },
      );

      if (!movieUpdated) {
        throw new ControlledException(
          'Error while updating Movie',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const response: ClientResponse<Movie> = {
        data: movieUpdated,
        message: 'Movie updated successfully!',
        isSuccess: true,
        statusCode: HttpStatus.OK,
      };

      await session.commitTransaction();

      return response;
    } catch (error) {
      const message = error.message ?? 'Something went wrong!';
      await session.abortTransaction();

      return {
        data: null,
        isSuccess: false,
        message,
        statusCode: error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
      };
    } finally {
      await session.endSession();
    }
  }

  async createMovie(
    userId: string,
    newMovie: MovieRequestBody,
  ): Promise<ClientResponse<Movie>> {
    const session = await this.movieModel.startSession();
    try {
      session.startTransaction();

      const userAdmin = await this.userModel.findOne({ _id: userId });

      if (userAdmin.userRole !== UserRole.ADMIN) {
        throw new ControlledException(
          'You are not allowed to create a new movie',
          HttpStatus.BAD_REQUEST,
        );
      }

      const movie = await this.movieModel.create(
        [
          {
            title: newMovie.title,
            episode_id: newMovie.episode_id,
            opening_crawl: newMovie.opening_crawl,
            director: newMovie.director,
            producer: newMovie.producer,
            release_date: newMovie.release_date,
            url: newMovie.url,
          },
        ],
        { session },
      );

      if (!movie) {
        throw new ControlledException(
          'Error while creating Movie',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const response: ClientResponse<Movie> = {
        data: movie[0],
        message: 'Movie created successfully!',
        isSuccess: true,
        statusCode: HttpStatus.OK,
      };

      await session.commitTransaction();

      return response;
    } catch (error) {
      const message = error.message ?? 'Something went wrong!';
      await session.abortTransaction();

      return {
        data: null,
        isSuccess: false,
        message,
        statusCode: error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
      };
    } finally {
      await session.endSession();
    }
  }

  async deleteMovie(
    userId: string,
    id: string,
  ): Promise<ClientResponse<Movie>> {
    const session = await this.movieModel.startSession();
    try {
      session.startTransaction();

      const userAdmin = await this.userModel.findOne({ _id: userId });

      if (userAdmin.userRole !== UserRole.ADMIN) {
        throw new ControlledException(
          'You are not allowed to delete a movie',
          HttpStatus.BAD_REQUEST,
        );
      }

      const movie = await this.movieModel.findById(id);

      if (!movie) {
        throw new ControlledException(
          'The movie does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }

      const movieDeleted = await this.movieModel.findByIdAndDelete(id, {
        session,
      });

      if (!movieDeleted) {
        throw new ControlledException(
          'Error while delete Movie',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const response: ClientResponse<Movie> = {
        data: movie,
        message: 'Movie deleted successfully!',
        isSuccess: true,
        statusCode: HttpStatus.OK,
      };

      await session.commitTransaction();

      return response;
    } catch (error) {
      const message = error.message ?? 'Something went wrong!';
      await session.abortTransaction();

      return {
        data: null,
        isSuccess: false,
        message,
        statusCode: error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
      };
    } finally {
      await session.endSession();
    }
  }

  async seedingDatabase(userId: string): Promise<ClientResponse<any>> {
    const session = await this.movieModel.startSession();
    try {
      session.startTransaction();

      const userAdmin = await this.userModel.findOne({ _id: userId });

      if (userAdmin.userRole !== UserRole.ADMIN) {
        throw new ControlledException(
          'You are not allowed to seeding database',
          HttpStatus.BAD_REQUEST,
        );
      }

      const movies = await this.movieModel.find();

      if (movies.length > 0) {
        throw new ControlledException(
          'Database already seeded with movies',
          HttpStatus.BAD_REQUEST,
        );
      }

      const starWarsMovies = await this.httpService.getStarWarsMovies();

      if (starWarsMovies.length < 0) {
        throw new ControlledException(
          'Something went wrong',
          HttpStatus.BAD_REQUEST,
        );
      }

      const promises = starWarsMovies.map(
        async (movie: StarWarsApiResponse) => {
          await this.movieModel.create([
            {
              title: movie.title,
              episode_id: movie.episode_id,
              opening_crawl: movie.opening_crawl,
              director: movie.director,
              producer: movie.producer,
              release_date: movie.release_date,
              url: movie.url,
            },
          ]);
        },
      );

      await Promise.all(promises);

      const response: ClientResponse<any> = {
        data: {},
        message: 'DataBase seeded successfully!',
        isSuccess: true,
        statusCode: HttpStatus.OK,
      };

      await session.commitTransaction();

      return response;
    } catch (error) {
      const message = error.message ?? 'Something went wrong!';
      await session.abortTransaction();

      return {
        data: null,
        isSuccess: false,
        message,
        statusCode: error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
      };
    } finally {
      await session.endSession();
    }
  }
}
