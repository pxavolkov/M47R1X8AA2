import { Body, Controller, HttpException, Post, UploadedFile, FileInterceptor, UseInterceptors, HttpCode,
  UnprocessableEntityException} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { rename, unlink} from 'fs';
import * as mkdirp from 'mkdirp';
import { validate } from '@shared/ClassValidator';
import { RegisterRequest } from '@shared/requests';
import { ProfileService } from '../profile/profile.service';
import { User } from './user.entity';
import { UserService } from './user.service';
import { NewsService } from '../news/news.service';
import paths from '../paths';
import utils from '../utils';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
    private readonly newsService: NewsService,
  ) {}

  @Post('register')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('quenta', {dest: paths.upload}))
  async register(@Body() body: any, @UploadedFile() quenta): Promise<'success'> {
    if (quenta) this.logger.log(`File uploaded: quenta: ${quenta.originalname}`);
    let success = false;

    try {
      const data: RegisterRequest = new RegisterRequest();
      Object.assign(data, JSON.parse(body.data));
      const errors = await validate(data);

      if (errors.length > 0) {
        this.logger.warn('Validation errors!');
        throw new HttpException('Bad Request', 400);
      }

      let user: User;
      try {
        user = await this.userService.register(data);
      } catch (err) {
        this.logger.error(err);
        if (err.code === 'ER_DUP_ENTRY') throw new HttpException('Email exists', 403);
        else throw err;
      }

      try {
        await this.profileService.register(user.id, data, quenta ? quenta.originalname : null);
      } catch (err) {
        try {
          this.userService.remove(user);
        } finally {}
        throw err;
      }

      try {
        if (quenta) {
          const newPath = paths.quenta + '/' + user.id;
          await utils.mkdirp(newPath);
          await utils.rename(quenta.path, newPath + '/' + quenta.originalname);
          success = true;
          this.logger.log('quenta: Rename completed!');
        }
      } catch (err) {
        this.logger.error(`Failed to move quenta file(${quenta.filename}, ${quenta.originalname}): `, err.stack);
        throw new UnprocessableEntityException();
      }

      this.logger.log(`User #${user.id} created!`);
      return 'success';
    } finally {
      if (quenta && !success) {
        try {
          await utils.unlink(quenta.path);
          this.logger.log(`File removed: quenta: ${quenta.originalname}`);
        } catch (err) {
          this.logger.error(`Error removing file: quenta: ${quenta.originalname}: ${err.stack || err.message}`);
        }
      }
    }
  }
}
