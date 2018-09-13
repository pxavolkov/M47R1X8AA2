import { Controller, Get, UseGuards, Body, Post, UseInterceptors, FileInterceptor, UploadedFile, BadRequestException,
  UnprocessableEntityException, InternalServerErrorException, Query, Request } from '@nestjs/common';
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
import { SetBalance, SetCitizen, UploadQuenta, SendMultiMessage, Property as IProperty } from '@shared/master';
import { unlink, rename } from 'fs';
import { ItemService } from '../item/item.service';
import { Item } from '../item/item.entity';
import { InventoryService } from '../inventory/inventory.service';
import { InventoryItem } from '../inventory/inventory.entity';
import { InventoryItemAmount } from '@shared/responses';
import { MessageService } from '../message/message.service';
import utils from 'utils';
import { EventService } from '../event/event.service';
import { EventType } from '@shared/enums';
import { PropertyService } from '../property/property.service';
import { Property } from '../property/property.entity';

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
    private readonly eventService: EventService,
    private readonly propertyService: PropertyService,
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

  @Get('properties')
  async properties(): Promise<any> {
    return this.propertyService.allProperties();
  }

  @Get('loadInventory')
  async loadInventory(@Request() {user}, @Query('userId') userId): Promise<InventoryItem[]> {
    const inv = await this.inventoryService.getUserInventory(userId);
    this.eventService.add(user, EventType.INVENTORY_VIEW, {userId});
    return inv;
  }

  @Post('setCitizen')
  async setCitizen(@Request() {user}, @Body() {userId, isCitizen}): Promise<SetCitizen> {
    await this.profileService.setCitizen(userId, isCitizen);
    this.eventService.add(user, EventType.SET_CITIZEN, {userId, isCitizen});
    return {userId, isCitizen};
  }

  @Post('updateNews')
  async updateNews(@Request() {user}, @Body() {newsId, data}): Promise<any> {
    const oldData = await this.newsService.getById(newsId);
    await this.newsService.update(newsId, data);
    const newData = await this.newsService.getById(newsId);
    this.eventService.add(user, EventType.NEWS_EDIT, {
      id: newsId,
      old: {
        title: oldData.title,
        text: oldData.text,
        createDate: oldData.createDate,
      },
      new: {
        title: newData.title,
        text: newData.text,
        createDate: newData.createDate,
      },
    });
    return {newsId, data};
  }

  @Post('addNews')
  async addNews(@Request() {user}, @Body() data): Promise<News> {
    const news = await this.newsService.add(data);
    this.eventService.add(user, EventType.NEWS_ADD, news);
    return news;
  }

  @Post('updateItem')
  @UseInterceptors(FileInterceptor('icon', {dest: paths.upload}))
  async updateItem(@Request() {user}, @Body() data, @UploadedFile() icon): Promise<any> {
    data.id = parseInt(data.id, 10);
    const {id: oldId, ...oldValues} = await this.itemService.getById(data.id);
    const oldData = Object.assign(oldValues, {icon: {size: null, hash: null}});
    const newIcon = {size: null, hash: null};
    const iconFile = paths.item + '/' + data.id + '.png';
    try {
      oldData.icon.size = (await utils.stat(iconFile)).size;
      oldData.icon.hash = await utils.fileHash(iconFile);
    } catch (err) {}
    if (icon) {
      try {
        await utils.mkdirp(paths.item);
        await utils.rename(icon.path, iconFile);
        this.logger.log('icon: Rename completed!');
        try {
          newIcon.size = (await utils.stat(iconFile)).size;
          newIcon.hash = await utils.fileHash(iconFile);
        } catch (err) {}
      } catch (err) {
        this.logger.error(`Failed to move icon file(${icon.filename}, ${icon.originalname}): `, err.stack);
        try {
          await utils.unlink(icon.path);
          this.logger.log(`File removed: icon: ${icon.originalname}`);
        } catch (err) {
          this.logger.error(`Error removing file: icon: ${icon.originalname}: ${err.stack || err.message}`);
        }
        throw new UnprocessableEntityException();
      }
    }
    const {id, ...values} = data;

    await this.itemService.update(id, values);

    this.eventService.add(user, EventType.ITEM_EDIT, {
      id,
      old: oldData,
      new: Object.assign({}, values, {icon: newIcon})
    });

    return data;
  }

  @Post('addItem')
  @UseInterceptors(FileInterceptor('icon', {dest: paths.upload}))
  async addItem(@Request() {user}, @Body() data, @UploadedFile() icon): Promise<Item> {
    if (icon) this.logger.log(`File uploaded: icon: ${icon.originalname}`);
    else throw new BadRequestException();

    const item = await this.itemService.add(data);
    const eventData = Object.assign({}, item, {
      icon: {
        size: null,
        hash: null,
      },
    });

    try {
      const newFile = paths.item + '/' + item.id + '.png';
      await utils.mkdirp(paths.item);
      await utils.rename(icon.path, newFile);
      this.logger.log('icon: Rename completed!');
      try {
        eventData.icon.size = (await utils.stat(newFile)).size;
        eventData.icon.hash = await utils.fileHash(newFile);
      } catch (err) {}
    } catch (err) {
      this.logger.error(`Failed to move item icon file(${icon.filename}, ${icon.originalname}): `, err.stack);
      try {
        await utils.unlink(icon.path);
        this.logger.log(`File removed: icon: ${icon.originalname}`);
      } catch (err) {
        this.logger.error(`Error removing file: icon: ${icon.originalname}: ${err.stack || err.message}`);
      }
      throw new UnprocessableEntityException();
    }
    this.eventService.add(user, EventType.ITEM_ADD, eventData);

    return item;
  }

  @Post('setBalance')
  async setBalance(@Request() {user}, @Body() {userId, balance}): Promise<SetBalance> {
    const oldBalance = await this.profileService.getBalance(userId);
    await this.profileService.setBalance(userId, balance);
    try {
      this.eventService.add(user, EventType.BALANCE_CHANGE, {userId, old: {balance: oldBalance}, new: {balance}});
    } catch (err) {}
    return {userId, balance};
  }

  @Post('updateProperty')
  async updateProperty(@Request() {user}, @Body() data: IProperty): Promise<any> {
    // tslint:disable-next-line no-bitwise
    data.editRoles |= Role.Master;
    // tslint:disable-next-line no-bitwise
    data.viewRoles |= Role.Master;
    const {id: oldId, ...oldValues} = await this.propertyService.getPropertyById(data.id);
    const {id, ...values} = data;

    await this.propertyService.updateProperty(id, values);

    this.eventService.add(user, EventType.PROPERTY_EDIT, {
      id,
      old: oldValues,
      new: values,
    });

    return data;
  }

  @Post('addProperty')
  async addProperty(@Request() {user}, @Body() data: IProperty): Promise<Property> {
    // tslint:disable-next-line no-bitwise
    data.editRoles |= Role.Master;
    // tslint:disable-next-line no-bitwise
    data.viewRoles |= Role.Master;
    const property = await this.propertyService.addProperty(data);
    this.eventService.add(user, EventType.PROPERTY_ADD, property);
    return property;
  }

  @Post('uploadQuenta')
  @UseInterceptors(FileInterceptor('quenta', {dest: paths.upload}))
  async uploadQuenta(@Request() {user}: {user: User}, @Body() {userId}, @UploadedFile() quenta): Promise<UploadQuenta> {
    userId = parseInt(userId, 10);
    if (quenta) this.logger.log(`File uploaded: quenta: ${quenta.originalname}`);
    else throw new BadRequestException();

    const newPath = paths.quenta + '/' + userId;
    const quentaFile = newPath + '/' + quenta.originalname;
    const oldFile = newPath + '/' + user.profile.quentaPath;

    const eventData = {
      userId,
      old: {
        name: null,
        size: null,
        hash: null,
      },
      new: {
        name: null,
        size: null,
        hash: null,
      },
    };

    try {
      eventData.old.name = user.profile.quentaPath;
      eventData.old.size = (await utils.stat(oldFile)).size;
      eventData.old.hash = await utils.fileHash(oldFile);
    } catch (err) {}

    try {
      await utils.mkdirp(newPath);
      await utils.rename(quenta.path, quentaFile);
      this.logger.log('quenta: Rename completed!');
    } catch (err) {
      this.logger.error(`Failed to move quenta file(${quenta.filename}, ${quenta.originalname}): `, err.stack);
      try {
        await utils.unlink(quenta.path);
        this.logger.log(`File removed: quenta: ${quenta.originalname}`);
      } catch (err) {
        this.logger.error(`Error removing file: quenta: ${quenta.originalname}: ${err.stack || err.message}`);
      }
      throw new UnprocessableEntityException();
    }

    try {
      const quentaPath = quenta.originalname;
      this.profileService.setQuentaPath(userId, quentaPath);

      try {
        eventData.new.name = quenta.originalname;
        eventData.new.size = (await utils.stat(quentaFile)).size;
        eventData.new.hash = await utils.fileHash(quentaFile);
      } catch (err) {}
      this.eventService.add(user, EventType.QUENTA_UPLOAD, eventData);

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
  async giveItem(@Request() {user}, @Body() data): Promise<InventoryItem> {
    await this.inventoryService.addItem(data.userId, data.itemId, data.amount);
    const item = await this.inventoryService.getUserInventoryItem(data.userId, data.itemId);
    this.eventService.add(user, EventType.ITEM_GIVE, {
      userId: data.userId,
      itemId: data.itemId,
      amount: data.amount,
      new: {amount: item.amount}
    });
    return item;
  }

  @Post('takeItem')
  async takeItem(@Request() {user}, @Body() data): Promise<InventoryItemAmount> {
    await this.inventoryService.removeItem(data.userId, data.itemId, data.amount);
    const item = await this.inventoryService.getInventoryItemAmount(data.userId, data.itemId);
    this.eventService.add(user, EventType.ITEM_TAKE, {
      userId: data.userId,
      itemId: data.itemId,
      amount: data.amount,
      new: {amount: item ? item.amount : 0}
    });
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
