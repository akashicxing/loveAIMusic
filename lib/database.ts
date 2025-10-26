/**
 * MySQL数据库连接服务
 */

import mysql from 'mysql2/promise';

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
}

class DatabaseService {
  private pool: mysql.Pool | null = null;
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'loveaimusic',
      ssl: process.env.MYSQL_SSL === 'true'
    };

    this.initializePool();
  }

  private initializePool() {
    try {
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : undefined
      });

      console.log('✅ [Database] MySQL连接池初始化成功');
    } catch (error) {
      console.error('❌ [Database] MySQL连接池初始化失败:', error);
    }
  }

  /**
   * 获取数据库连接
   */
  async getConnection(): Promise<mysql.PoolConnection> {
    if (!this.pool) {
      throw new Error('数据库连接池未初始化');
    }
    return await this.pool.getConnection();
  }

  /**
   * 执行查询
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.pool) {
      throw new Error('数据库连接池未初始化');
    }

    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows as T[];
    } catch (error) {
      console.error('❌ [Database] 查询执行失败:', error);
      console.error('📝 [Database] SQL:', sql);
      console.error('📝 [Database] 参数:', params);
      throw error;
    }
  }

  /**
   * 执行单条查询
   */
  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * 执行插入操作
   */
  async insert(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
    if (!this.pool) {
      throw new Error('数据库连接池未初始化');
    }

    try {
      const [result] = await this.pool.execute(sql, params);
      return result as mysql.ResultSetHeader;
    } catch (error) {
      console.error('❌ [Database] 插入操作失败:', error);
      console.error('📝 [Database] SQL:', sql);
      console.error('📝 [Database] 参数:', params);
      throw error;
    }
  }

  /**
   * 执行更新操作
   */
  async update(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
    if (!this.pool) {
      throw new Error('数据库连接池未初始化');
    }

    try {
      const [result] = await this.pool.execute(sql, params);
      return result as mysql.ResultSetHeader;
    } catch (error) {
      console.error('❌ [Database] 更新操作失败:', error);
      console.error('📝 [Database] SQL:', sql);
      console.error('📝 [Database] 参数:', params);
      throw error;
    }
  }

  /**
   * 执行删除操作
   */
  async delete(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
    if (!this.pool) {
      throw new Error('数据库连接池未初始化');
    }

    try {
      const [result] = await this.pool.execute(sql, params);
      return result as mysql.ResultSetHeader;
    } catch (error) {
      console.error('❌ [Database] 删除操作失败:', error);
      console.error('📝 [Database] SQL:', sql);
      console.error('📝 [Database] 参数:', params);
      throw error;
    }
  }

  /**
   * 开始事务
   */
  async beginTransaction(): Promise<mysql.PoolConnection> {
    const connection = await this.getConnection();
    await connection.beginTransaction();
    return connection;
  }

  /**
   * 提交事务
   */
  async commit(connection: mysql.PoolConnection): Promise<void> {
    await connection.commit();
    connection.release();
  }

  /**
   * 回滚事务
   */
  async rollback(connection: mysql.PoolConnection): Promise<void> {
    await connection.rollback();
    connection.release();
  }

  /**
   * 测试数据库连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.queryOne('SELECT 1 as test');
      console.log('✅ [Database] 数据库连接测试成功');
      return result?.test === 1;
    } catch (error) {
      console.error('❌ [Database] 数据库连接测试失败:', error);
      return false;
    }
  }

  /**
   * 关闭连接池
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ [Database] 数据库连接池已关闭');
    }
  }
}

// 创建单例实例
export const database = new DatabaseService();
