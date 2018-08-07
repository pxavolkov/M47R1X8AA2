import { Connection } from "mysql2/promise";
import { ConnectionPool } from "mssql";
import log from './logger';

export default {
  generate(options: {
    fromTable: string,
    toTable: string,
    columns: {[key: string]: string},
    transformers?: {[key: string]: (val: any) => any},
    returnProps?: ({old: boolean, name: string} | {old: false, insertId: true})[],
    update?: boolean,
    where?: (row: any) => string,
    orderBy?: string,
    needExecute?: (row: any) => boolean,
  }) {
    const newKeys = Object.keys(options.columns);
    const oldKeys = newKeys.map(v => options.columns[v]);
    const oldProps = options.returnProps ? (options.returnProps.filter(v => v.old) as {old: true, name: string}[]).map(v => v.name) : [];
    const selectProps = oldKeys.concat(oldProps).filter((item, pos, self) => self.indexOf(item) === pos);

    return async function(mssql: ConnectionPool, mysql: Connection, truncate: boolean): Promise<any[][]> {
      const data = await mssql.request().query('SELECT ' + selectProps.map(v => `[${v}]`).join(',') + ' FROM ' + options.fromTable + (options.orderBy ? ' ORDER BY ' + options.orderBy : ''));
      const returnData = [];

      if (truncate) {
        await mysql.execute('SET FOREIGN_KEY_CHECKS=0')
        await mysql.execute('TRUNCATE TABLE ' + options.toTable)
        await mysql.execute('SET FOREIGN_KEY_CHECKS=1')
      }

      for (let i = 0; i < data.recordsets[0].length; i++) {
        const row: any = data.recordsets[0][i];

        if (options.needExecute && !options.needExecute(row))
          continue;

        const values = oldKeys.map((key) => options.transformers && options.transformers[key] ? options.transformers[key](row[key]) : (row[key] || null));

        let sql = '';
        if (options.update) {
          sql = 'UPDATE ' + options.toTable + ' SET ' + newKeys.map(v => '`' + v + '`=?').join(',') + (options.where ? ' WHERE ' + options.where(row) : '');
        } else {
          sql = 'INSERT INTO ' + options.toTable + ' (' + newKeys.map(v => '`' + v  + '`').join(',') + ') VALUES (' + newKeys.map(() => '?').join(',') + ')';
        }
        const result = await mysql.execute(
          sql,
          values
        ) as any;

        if (options.returnProps) {
          returnData.push(options.returnProps.map(v => {
            if (v.old) return row[v.name];
            else if ('name' in v) return values[newKeys.indexOf(v.name)];
            else if ('insertId' in v && v.insertId) return result[0].insertId;
            else return null;
          }));
        }
      }
      return returnData;
    }
  },
  generateUpdate(
    fromTable: string,
    toTable: string,
    columns: {[key: string]: string},
    transformers: {[key: string]: (val: any) => any},
    returnProps: ({old: boolean, name: string} | {old: false, insertId: true})[],
  ) {
    const newKeys = Object.keys(columns);
    const oldKeys = newKeys.map(v => columns[v]);
    const oldProps = (returnProps.filter(v => v.old) as {old: true, name: string}[]).map(v => v.name);
    const selectProps = oldKeys.concat(oldProps).filter((item, pos, self) => self.indexOf(item) === pos);

    return async function(mssql: ConnectionPool, mysql: Connection): Promise<any[][]> {
      const data = await mssql.request().query('SELECT ' + selectProps.join(',') + ' FROM ' + fromTable);
      const returnData = [];
      for (let i = 0; i < data.recordsets[0].length; i++) {
        const row: any = data.recordsets[0][i];
        const values = oldKeys.map((key) => transformers[key] ? transformers[key](row[key]) : (row[key] || null));

        const result = await mysql.execute(
          'UPDATE ' + toTable + ' SET ' + newKeys.join(',') + ')' +
          'VALUES (' + newKeys.map(() => '?').join(',') + ')',
          values
        ) as any;

        returnData.push(returnProps.map(v => {
          if (v.old) return row[v.name];
          else if ('name' in v) return values[newKeys.indexOf(v.name)];
          else if ('insertId' in v && v.insertId) return result[0].insertId;
          else return null;
        }));
      }
      return returnData;
    }
  },
  camelCaseColumns(...args: string[]) {
    return args
      .map(v => [v, v[0].toUpperCase() + v.substr(1)])
      .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {})
  }
}