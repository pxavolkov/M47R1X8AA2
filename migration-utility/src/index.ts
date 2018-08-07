#!/usr/bin/env node
import log from './logger';
import db from './db'
import migrate from './migrate';
import { rename} from 'fs';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import * as dotenv from 'dotenv';
dotenv.config();

function toBoolean(str: string | undefined): boolean {
  return str === 'true' || str === '1';
}

let mysql, mssql
const truncate = toBoolean(process.env.MYSQL_TRUNCATE);
const clearFiles = toBoolean(process.env.CLEAR_FILES);

(async () => {
  try {
    const startTime = Date.now();
    const migrateFiles = process.argv.indexOf('--migrate-files') > -1 || toBoolean(process.env.MIGRATE_FILES);

    log.info('Connecting to mysql...');
    const mysql = await db.connectMySQL();
    log.info('Done!');
    
    log.info('Connecting to mssql...');
    const mssql = await db.connectMSSQL();
    log.info('Done!');

    log.info('Migrating users...');
    let migration = migrate.generate({
      fromTable: 'AspNetUsers',
      toTable: 'users',
      orderBy: 'RegistrationDate ASC',
      columns: migrate.camelCaseColumns(
        'playerName',
        'playerAge',
        'info',
        'allergy',
        'registrationDate',
        'email',
        'emailConfirmed',
        'passwordHash',
      ),
      transformers: {
        EmailConfirmed: (val) => val ? 1 : 0
      },
      returnProps: [
        {old: true, name: 'Profile_ID'},
        {old: false, insertId: true},
        {old: true, name: 'Id'},
      ]
    });
    const users = await migration(mssql, mysql, truncate);
    log.info('Done! Total: ' + users.length);

    log.info('Migrating profiles...');
    migration = migrate.generate({
      fromTable: 'ProfileInfoes',
      toTable: 'profiles',
      orderBy: 'ID ASC',
      columns: {
        userId: 'ID',
        sex: 'IsMale',
        photoUploaded: 'PhotoPath',
        ...migrate.camelCaseColumns(
          'firstName',
          'lastName',
          'age',
          'isCitizen',
          'quentaPath',
        ),
      },
      transformers: {
        ID: (val) => (users.find(v => v[0] === val) as any)[1],
        IsMale: (val) => val ? 'MALE' : 'FEMALE',
        PhotoPath: (val) => val ? 1 : 0,
        QuentaPath: (val) => {
          if (!val) return null;
          const parts = val.split('\\');
          return parts[parts.length - 1];
        },
        IsCitizen: (val) => val ? 1 : 0,
        Age: (val) => val || 0,
        FirstName: (val) => val || '',
        LastName: (val) => val || '',
      },
      returnProps: [
        {old: true, name: 'Balance_ID'},
        {old: false, name: 'userId'},
        {old: false, name: 'photoUploaded'},
        {old: true, name: 'photoPath'},
        {old: false, name: 'quentaPath'},
      ]
    });
    const profiles = await migration(mssql, mysql, truncate);
    log.info('Done! Total: ' + profiles.length);

    log.info('Migrating balances...');
    migration = migrate.generate({
      fromTable: 'BalanceInfoes',
      toTable: 'profiles',
      orderBy: 'ID ASC',
      columns: {
        balance: 'Current',
        miningTime: 'MiningTime',
      },
      transformers: {
        Current: (val) => val || 0,
      },
      returnProps: [
        {old: true, name: 'ID'},
      ],
      update: true,
      needExecute: (row) => profiles.findIndex((v) => v[0] === row.ID) > -1,
      where: (row) => 'userId = ' + (profiles.find((v: any) => v[0] === row.ID) as any)[1],
    });
    const balances = await migration(mssql, mysql, false);
    log.info('Done! Total: ' + balances.length);

    log.info('Migrating news...');
    migration = migrate.generate({
      fromTable: 'News',
      toTable: 'news',
      orderBy: 'ID ASC',
      columns: migrate.camelCaseColumns(
        'title',
        'text',
        'createDate',
      ),
      returnProps: [
        {old: true, name: 'ID'},
        {old: false, insertId: true},
      ],
    });
    const news = await migration(mssql, mysql, truncate);
    log.info('Done! Total: ' + news.length);

    log.info('Migrating readNews...');
    migration = migrate.generate({
      fromTable: 'ReadNews',
      toTable: 'readNews',
      orderBy: 'NewsId ASC',
      columns: migrate.camelCaseColumns(
        'userId',
        'newsId',
      ),
      returnProps: [],
      transformers: {
        UserId: (val) => (users.find(v => v[2] === val) as any)[1],
        NewsId: (val) => (news.find(v => v[0] === val) as any)[1],
      },
    });
    const readNews = await migration(mssql, mysql, truncate);
    log.info('Done! Total: ' + readNews.length);

    log.info('Migrating transactions...');
    migration = migrate.generate({
      fromTable: 'Transactions',
      toTable: 'transactions',
      orderBy: 'ID ASC',
      columns: {
        fromUserId: 'UserId',
        toUserId: 'TargetUserId',
        amount: 'Amount',
        type: 'TransactionType',
        date: 'TransactionDate',
      },
      returnProps: [],
      transformers: {
        UserId: (val) => (users.find(v => v[2] === val) as any)[1],
        TargetUserId: (val) => (users.find(v => v[2] === val) as any)[1],
        TransactionType: (val) => val === 0 ? 'TRANSFER' : 'MINING',
      },
    });
    const transactions = await migration(mssql, mysql, truncate);
    log.info('Done! Total: ' + transactions.length);

    log.info('Migrating gifts...');
    migration = migrate.generate({
      fromTable: 'Gifts',
      toTable: 'gifts',
      orderBy: 'ID ASC',
      columns: migrate.camelCaseColumns(
        'code',
        'creditsBonus',
        'usedUserId',
        'usedDate'
      ),
      returnProps: [],
      transformers: {
        UsedUserId: (val) => val ? (users.find(v => v[2] === val) as any)[1] : null,
      },
    });
    const gifts = await migration(mssql, mysql, truncate);
    log.info('Done! Total: ' + gifts.length);

    if (migrateFiles) { // TODO: test this
      if (clearFiles)
        await new Promise((resolve, reject) => rimraf('./new-data', (err: any) => !err ? resolve() : reject(err)));

      log.info('Migrating photo files...');
      const photos = profiles.filter(v => v[2]).map(v => ({userId: v[1], path: v[3]}));
      let newPath = './new-data/photo';
      await new Promise((resolve, reject) => mkdirp(newPath, (err: any) => !err ? resolve() : reject(err)));
      let oldPath = './old-data/Avatars';
      for (const data of photos) {
        await new Promise((resolve, reject) => {
          rename(
            oldPath + '/' + data.path,
            newPath + '/' + data.userId + '.png',
            (err) => !err ? resolve() : reject(err)
          );
        });
      }
      log.info('Done! Total: ' + photos.length);
  
      log.info('Migrating quenta files...');
      const quentas = profiles.filter(v => v[4]).map(v => ({userId: v[1], path: v[4]}));
      oldPath = './old-data/Quenta';
      for (const data of quentas) {
        newPath = './new-data/quenta/' + data.userId;
        await new Promise((resolve, reject) => mkdirp(newPath, (err: any) => !err ? resolve() : reject(err)));
        await new Promise((resolve, reject) => {
          rename(
            oldPath + '/' + data.path,
            newPath + '/' + data.path,
            (err) => !err ? resolve() : reject(err)
          );
        });
      }
      log.info('Done! Total: ' + photos.length);
    } else log.info('Skipping files migration...');

    const finishTime = Date.now();
    log.info(`Migration done in ${finishTime - startTime}ms!`);
  } catch (err) {
    log.error(err);
  }
  
})().then(() => process.exit());
