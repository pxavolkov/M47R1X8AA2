import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './property.entity';
import { PropertyService } from './property.service';
import { PropertyValue } from './propertyValue.entity';
import { PropertyController } from './property.controller';
import { EventModule } from 'event/event.module';
import { ProfileModule } from 'profile/profile.module';

@Module({
  imports: [TypeOrmModule.forFeature([Property]), TypeOrmModule.forFeature([PropertyValue]), EventModule,
    ProfileModule],
  providers: [PropertyService],
  controllers: [PropertyController],
  exports: [PropertyService],
})
export class PropertyModule {}
