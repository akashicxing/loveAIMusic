/**
 * 数据库服务
 * 处理MySQL数据库操作
 */

import mysql from 'mysql2/promise';

export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWork {
  id: string;
  userId: string;
  title: string;
  styleId?: string;
  audioUrl?: string;
  lyricsUrl?: string;
  audioDuration?: number;
  audioSize?: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  generationProgress: number;
  generationStage?: string;
  errorMessage?: string;
  isPublic: boolean;
  playCount: number;
  likeCount: number;
  favoriteCount: number;
  shareCount: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface UserAnswer {
  id: string;
  userId: string;
  workId: string;
  roundNumber: number;
  questionId: string;
  answerValue: string;
  answerType: string;
  createdAt: Date;
}

class DatabaseService {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DATABASE_HOST || 'sh-cdb-5kh978ne.sql.tencentcdb.com',
      port: parseInt(process.env.DATABASE_PORT || '20500'),
      user: process.env.DATABASE_USER || 'akashic',
      password: process.env.DATABASE_PASSWORD || 'Root123!@#',
      database: process.env.DATABASE_NAME || 'loveaimusic',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  /**
   * 创建用户
   */
  async createUser(userData: Partial<User>): Promise<User> {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO users (id, email, username, display_name, avatar_url, is_active, created_at, updated_at) 
         VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userData.email,
          userData.username,
          userData.displayName,
          userData.avatarUrl,
          userData.isActive ?? true
        ]
      );

      const userId = (result as any).insertId;
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('创建用户后查询失败');
      }
      return user;
    } finally {
      connection.release();
    }
  }

  /**
   * 根据ID获取用户
   */
  async getUserById(id: string): Promise<User | null> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      const users = rows as User[];
      return users.length > 0 ? users[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * 根据邮箱获取用户
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      const users = rows as User[];
      return users.length > 0 ? users[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * 创建用户作品
   */
  async createUserWork(workData: Partial<UserWork>): Promise<UserWork> {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO user_works (id, user_id, title, style_id, audio_url, lyrics_url, audio_duration, audio_size, 
         status, generation_progress, generation_stage, is_public, play_count, like_count, favorite_count, 
         share_count, created_at, updated_at) 
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, NOW(), NOW())`,
        [
          workData.userId,
          workData.title,
          workData.styleId,
          workData.audioUrl,
          workData.lyricsUrl,
          workData.audioDuration,
          workData.audioSize,
          workData.status || 'pending',
          workData.generationProgress || 0,
          workData.generationStage
        ]
      );

      const workId = (result as any).insertId;
      const work = await this.getUserWorkById(workId);
      if (!work) {
        throw new Error('创建作品后查询失败');
      }
      return work;
    } finally {
      connection.release();
    }
  }

  /**
   * 根据ID获取用户作品
   */
  async getUserWorkById(id: string): Promise<UserWork | null> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM user_works WHERE id = ?',
        [id]
      );

      const works = rows as UserWork[];
      return works.length > 0 ? works[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * 获取用户的所有作品
   */
  async getUserWorks(userId: string, limit: number = 20, offset: number = 0): Promise<UserWork[]> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM user_works WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );

      return rows as UserWork[];
    } finally {
      connection.release();
    }
  }

  /**
   * 更新用户作品状态
   */
  async updateUserWorkStatus(
    id: string, 
    status: string, 
    progress?: number, 
    stage?: string, 
    errorMessage?: string,
    audioUrl?: string,
    lyricsUrl?: string,
    audioDuration?: number,
    audioSize?: number
  ): Promise<boolean> {
    const connection = await this.pool.getConnection();
    try {
      const updateFields = ['status = ?', 'updated_at = NOW()'];
      const updateValues: any[] = [status];

      if (progress !== undefined) {
        updateFields.push('generation_progress = ?');
        updateValues.push(progress);
      }

      if (stage !== undefined) {
        updateFields.push('generation_stage = ?');
        updateValues.push(stage);
      }

      if (errorMessage !== undefined) {
        updateFields.push('error_message = ?');
        updateValues.push(errorMessage);
      }

      if (audioUrl !== undefined) {
        updateFields.push('audio_url = ?');
        updateValues.push(audioUrl);
      }

      if (lyricsUrl !== undefined) {
        updateFields.push('lyrics_url = ?');
        updateValues.push(lyricsUrl);
      }

      if (audioDuration !== undefined) {
        updateFields.push('audio_duration = ?');
        updateValues.push(audioDuration);
      }

      if (audioSize !== undefined) {
        updateFields.push('audio_size = ?');
        updateValues.push(audioSize);
      }

      if (status === 'completed') {
        updateFields.push('completed_at = NOW()');
      }

      updateValues.push(id);

      const [result] = await connection.execute(
        `UPDATE user_works SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * 保存用户答案
   */
  async saveUserAnswers(answers: UserAnswer[]): Promise<boolean> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const answer of answers) {
        await connection.execute(
          `INSERT INTO user_answers (id, user_id, work_id, round_number, question_id, answer_value, answer_type, created_at) 
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW())`,
          [
            answer.userId,
            answer.workId,
            answer.roundNumber,
            answer.questionId,
            answer.answerValue,
            answer.answerType
          ]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('保存用户答案失败:', error);
      return false;
    } finally {
      connection.release();
    }
  }

  /**
   * 获取用户答案
   */
  async getUserAnswers(workId: string): Promise<UserAnswer[]> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM user_answers WHERE work_id = ? ORDER BY round_number, question_id',
        [workId]
      );

      return rows as UserAnswer[];
    } finally {
      connection.release();
    }
  }

  /**
   * 增加播放次数
   */
  async incrementPlayCount(workId: string): Promise<boolean> {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(
        'UPDATE user_works SET play_count = play_count + 1 WHERE id = ?',
        [workId]
      );

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * 增加点赞次数
   */
  async incrementLikeCount(workId: string): Promise<boolean> {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(
        'UPDATE user_works SET like_count = like_count + 1 WHERE id = ?',
        [workId]
      );

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * 测试数据库连接
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '数据库连接失败'
      };
    }
  }

  /**
   * 关闭数据库连接池
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// 导出单例实例
export const databaseService = new DatabaseService();

// 导出类型
