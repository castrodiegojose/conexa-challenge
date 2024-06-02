import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MovieDocument = HydratedDocument<Movie>;

@Schema({ timestamps: true, collection: 'movies' })
export class Movie {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  episode_id: number;

  @Prop({ required: true })
  opening_crawl: string;

  @Prop({ required: true })
  director: string;

  @Prop({ required: true })
  producer: string;

  @Prop({ required: true })
  release_date: string;

  @Prop({ required: true })
  url: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
