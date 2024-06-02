import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('Movie API Documentation')
    .setDescription('Conexa challenge')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('movies')
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api/docs', app, document, {
    explorer: true,
    swaggerOptions: { filter: true, showRequestDuration: true },
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
