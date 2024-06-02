import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../../common/guard/accessToken.guard';
import { Response, Request } from 'express';
import ClientResponse from '../../common/interfaces/clientResponse.interface';
import { MoviesService } from './movies.service';
import { Movie } from '../../schemas/movies.schema';
import { MovieRequestBody } from './dto/movieRequestBody.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Movie Endpoints')
@ApiBearerAuth()
@Controller('movies')
@UseGuards(AccessTokenGuard)
export class MoviesController {
  constructor(private moviesService: MoviesService) {}

  @Get('/get-movies')
  async getMovies(
    @Req() req: Request,
    @Res() res: Response<ClientResponse<Movie[] | Movie>>,
    @Query('id') id?: string | undefined,
  ) {
    const userId = req.user['sub'];

    const results = await this.moviesService.getMovies(userId, id);
    return res.status(results.statusCode).json(results);
  }

  @Post('/create-movie')
  async createMovie(
    @Req() req: Request,
    @Res() res: Response<ClientResponse<Movie>>,
    @Body() newMovie: MovieRequestBody,
  ) {
    const userId = req.user['sub'];

    const results = await this.moviesService.createMovie(userId, newMovie);
    return res.status(results.statusCode).json(results);
  }

  @Patch('/update-movie')
  async updateMovie(
    @Req() req: Request,
    @Res() res: Response<ClientResponse<Movie>>,
    @Query('id') id: string,
    @Body() updateMovie: MovieRequestBody,
  ) {
    const userId = req.user['sub'];

    const results = await this.moviesService.updateMovie(
      userId,
      updateMovie,
      id,
    );
    return res.status(results.statusCode).json(results);
  }

  @Delete('/delete-movie')
  async deleteteMovie(
    @Req() req: Request,
    @Res() res: Response<ClientResponse<Movie>>,
    @Query('id') id: string,
  ) {
    const userId = req.user['sub'];

    const results = await this.moviesService.deleteMovie(userId, id);
    return res.status(results.statusCode).json(results);
  }

  @Post('/seeding-database')
  async seedingDatabase(
    @Req() req: Request,
    @Res() res: Response<ClientResponse<any>>,
  ) {
    const userId = req.user['sub'];

    const results = await this.moviesService.seedingDatabase(userId);
    return res.status(results.statusCode).json(results);
  }
}
