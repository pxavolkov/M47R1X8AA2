import { Controller, Get, UseGuards, Body, Post, UseInterceptors, FileInterceptor, UploadedFile, BadRequestException,
  UnprocessableEntityException, InternalServerErrorException, Query } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../user/roles';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { NewsService } from '../news/news.service';
import { ProfileService } from '../profile/profile.service';
import { News } from '../news/news.entity';
import paths from '../paths';
import { SetBalance, SetCitizen, UploadQuenta, SendMultiMessage } from '@shared/master';
import { unlink, rename } from 'fs';
import * as mkdirp from 'mkdirp';
import { ItemService } from '../item/item.service';
import { Item } from '../item/item.entity';
import { InventoryService } from '../inventory/inventory.service';
import { InventoryItem } from '../inventory/inventory.entity';
import { InventoryItemAmount } from '@shared/responses';
import { MessageService } from '../message/message.service';

@Controller('master')
@UseGuards(AuthGuard('jwt'), new RolesGuard(Role.Master))
export class MasterController {
  private readonly logger = new Logger(MasterController.name);
  constructor(
    private readonly userService: UserService,
    private readonly newsService: NewsService,
    private readonly profileService: ProfileService,
    private readonly itemService: ItemService,
    private readonly inventoryService: InventoryService,
    private readonly messageService: MessageService,
  ) {}

  @Get('users')
  async users(): Promise<User[]> {
    return this.userService.findAllForMaster();
  }

  @Get('news')
  async news(): Promise<any> {
    return this.newsService.all();
  }

  @Get('items')
  async items(): Promise<any> {
    return this.itemService.all();
  }

  @Get('loadInventory')
  async loadInventory(@Query('userId') userId): Promise<InventoryItem[]> {
    return await this.inventoryService.getUserInventory(userId);
  }

  @Post('setCitizen')
  async setCitizen(@Body() {userId, isCitizen}): Promise<SetCitizen> {
    await this.profileService.setCitizen(userId, isCitizen);
    return {userId, isCitizen};
  }

  @Post('updateNews')
  async updateNews(@Body() {newsId, data}): Promise<any> {
    await this.newsService.update(newsId, data);
    return {newsId, data};
  }

  @Post('addNews')
  async addNews(@Body() data): Promise<News> {
    return await this.newsService.add(data);
  }

  @Post('updateItem')
  @UseInterceptors(FileInterceptor('icon', {dest: paths.upload}))
  async updateItem(@Body() data, @UploadedFile() icon): Promise<any> {
    data.id = parseInt(data.id, 10);
    if (icon) {
      try {
        await new Promise((resolve, reject) => mkdirp(paths.item, (err) => !err ? resolve() : reject(err)));
        await new Promise((resolve, reject) => {
          rename(icon.path, paths.item + '/' + data.id + '.png', (err) => !err ? resolve() : reject(err));
        });
        this.logger.log('icon: Rename completed!');
      } catch (err) {
        this.logger.error(`Failed to move icon file(${icon.filename}, ${icon.originalname}): `, err.stack);
        unlink(icon.path, (err) => {
          if (!err) this.logger.log(`File removed: icon: ${icon.originalname}`);
          else this.logger.error(`Error removing file: icon: ${icon.originalname}: ${err.stack || err.message}`);
        });
        throw new UnprocessableEntityException();
      }
    }
    const {id, ...values} = data;
    await this.itemService.update(id, values);
    return data;
  }

  @Post('addItem')
  @UseInterceptors(FileInterceptor('icon', {dest: paths.upload}))
  async addItem(@Body() data, @UploadedFile() icon): Promise<Item> {
    if (icon) this.logger.log(`File uploaded: icon: ${icon.originalname}`);
    else throw new BadRequestException();

    const item = await this.itemService.add(data);
    try {
      await new Promise((resolve, reject) => mkdirp(paths.item, (err) => !err ? resolve() : reject(err)));
      await new Promise((resolve, reject) => {
        rename(icon.path, paths.item + '/' + item.id + '.png', (err) => !err ? resolve() : reject(err));
      });
      this.logger.log('icon: Rename completed!');
    } catch (err) {
      this.logger.error(`Failed to move item icon file(${icon.filename}, ${icon.originalname}): `, err.stack);
      unlink(icon.path, (err) => {
        if (!err) this.logger.log(`File removed: icon: ${icon.originalname}`);
        else this.logger.error(`Error removing file: icon: ${icon.originalname}: ${err.stack || err.message}`);
      });
      throw new UnprocessableEntityException();
    }

    return item;
  }

  @Post('setBalance')
  async setBalance(@Body() {userId, balance}): Promise<SetBalance> {
    await this.profileService.setBalance(userId, balance);
    return {userId, balance};
  }

  @Post('uploadQuenta')
  @UseInterceptors(FileInterceptor('quenta', {dest: paths.upload}))
  async uploadQuenta(@Body() {userId}, @UploadedFile() quenta): Promise<UploadQuenta> {
    userId = parseInt(userId, 10);
    if (quenta) this.logger.log(`File uploaded: quenta: ${quenta.originalname}`);
    else throw new BadRequestException();

    const newPath = paths.quenta + '/' + userId;
    try {
      await new Promise((resolve, reject) => mkdirp(newPath, (err) => !err ? resolve() : reject(err)));
      await new Promise((resolve, reject) => {
        rename(quenta.path, newPath + '/' + quenta.originalname, (err) => !err ? resolve() : reject(err));
      });
      this.logger.log('quenta: Rename completed!');
    } catch (err) {
      this.logger.error(`Failed to move quenta file(${quenta.filename}, ${quenta.originalname}): `, err.stack);
      unlink(quenta.path, (err) => {
        if (!err) this.logger.log(`File removed: quenta: ${quenta.originalname}`);
        else this.logger.error(`Error removing file: quenta: ${quenta.originalname}: ${err.stack || err.message}`);
      });
      throw new UnprocessableEntityException();
    }

    try {
      const quentaPath = quenta.originalname;
      this.profileService.setQuentaPath(userId, quentaPath);
      return {userId, quentaPath};
    } catch (err) {
      unlink(newPath, (err) => {
        if (!err) this.logger.log(`File removed: quenta: ${quenta.originalname}`);
        else this.logger.error(`Error removing file: quenta: ${quenta.originalname}: ${err.stack || err.message}`);
      });
      throw new InternalServerErrorException();
    }
  }

  @Post('giveItem')
  async giveItem(@Body() data): Promise<InventoryItem> {
    await this.inventoryService.addItem(data.userId, data.itemId, data.amount);
    return await this.inventoryService.getUserInventoryItem(data.userId, data.itemId);
  }

  @Post('takeItem')
  async takeItem(@Body() data): Promise<InventoryItemAmount> {
    await this.inventoryService.removeItem(data.userId, data.itemId, data.amount);
    const item = await this.inventoryService.getInventoryItemAmount(data.userId, data.itemId);
    return {
      itemId: data.itemId,
      amount: item ? item.amount : 0,
    };
  }

  @Post('sendMultiMessage')
  async sendMultiMessage(@Body() data: SendMultiMessage): Promise<void> {
    for (const id of data.userIds) await this.messageService.sendNotification(id, data.text);
  }
}
