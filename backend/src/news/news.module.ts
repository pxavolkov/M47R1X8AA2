import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './news.entity';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { UserModule } from '../user/user.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [TypeOrmModule.forFeature([News]), forwardRef(() => UserModule), forwardRef(() => ProfileModule)],
  providers: [NewsService],
  controllers: [NewsController],
  exports: [NewsService],
})
export class NewsModule {}