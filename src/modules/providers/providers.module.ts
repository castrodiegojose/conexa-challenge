import { Module } from '@nestjs/common';
import { HttpServices } from './http/http.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [HttpServices],
  exports: [HttpServices],
})
export class ProvidersModule {}
