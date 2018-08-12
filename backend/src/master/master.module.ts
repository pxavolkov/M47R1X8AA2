import { Module, forwardRef } from '@nestjs/common';
import { MasterController } from './master.controller';
import { UserModule } from '../user/user.module';
import { NewsModule } from '../news/news.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [UserModule, NewsModule, ProfileModule],
  controllers: [MasterController],
})
export class MasterModule {}