/**
 * VIP试用码管理服务
 */

import { database } from './database';
import crypto from 'crypto';

interface VipTrialCode {
  id: string;
  code: string;
  vip_days: number;
  used_by: string | null;
  used_at: string | null;
  expires_at: string;
  created_at: string;
  status: 'active' | 'used' | 'expired';
}

export class VipTrialService {
  private readonly codeLength = parseInt(process.env.VIP_TRIAL_CODE_LENGTH || '8');
  private readonly expiresDays = parseInt(process.env.VIP_TRIAL_CODE_EXPIRES_DAYS || '90');

  /**
   * 生成8位大写字母和数字的试用码
   */
  private generateTrialCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < this.codeLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * 批量生成VIP试用码
   * 注意：此接口不对外开放，只有程序内部调用
   */
  async generateTrialCodes(count: number, vipDays: number = 7): Promise<string[]> {
    console.log(`🎫 [VipTrial] 开始生成 ${count} 个VIP试用码`);
    
    const codes: string[] = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.expiresDays);

    try {
      for (let i = 0; i < count; i++) {
        let code: string;
        let attempts = 0;
        const maxAttempts = 10;

        // 确保生成的代码是唯一的
        do {
          code = this.generateTrialCode();
          attempts++;
          
          if (attempts >= maxAttempts) {
            throw new Error('生成唯一试用码失败，请重试');
          }
        } while (await this.isCodeExists(code));

        // 插入数据库
        const id = crypto.randomUUID();
        await database.insert(
          `INSERT INTO vip_trial_codes (id, code, vip_days, expires_at) VALUES (?, ?, ?, ?)`,
          [id, code, vipDays, expiresAt]
        );

        codes.push(code);
        console.log(`✅ [VipTrial] 生成试用码: ${code}`);
      }

      console.log(`🎉 [VipTrial] 成功生成 ${codes.length} 个VIP试用码`);
      return codes;

    } catch (error) {
      console.error('❌ [VipTrial] 生成试用码失败:', error);
      throw error;
    }
  }

  /**
   * 检查试用码是否存在
   */
  private async isCodeExists(code: string): Promise<boolean> {
    const result = await database.queryOne(
      'SELECT id FROM vip_trial_codes WHERE code = ?',
      [code]
    );
    return result !== null;
  }

  /**
   * 验证试用码
   */
  async validateTrialCode(code: string): Promise<{
    valid: boolean;
    codeData?: VipTrialCode;
    error?: string;
  }> {
    console.log(`🔍 [VipTrial] 验证试用码: ${code}`);

    try {
      const codeData = await database.queryOne<VipTrialCode>(
        `SELECT * FROM vip_trial_codes 
         WHERE code = ? AND status = 'active' AND expires_at > NOW()`,
        [code]
      );

      if (!codeData) {
        return {
          valid: false,
          error: '试用码不存在、已使用或已过期'
        };
      }

      if (codeData.used_by) {
        return {
          valid: false,
          error: '试用码已被使用'
        };
      }

      console.log(`✅ [VipTrial] 试用码验证成功: ${code}`);
      return {
        valid: true,
        codeData
      };

    } catch (error) {
      console.error('❌ [VipTrial] 验证试用码失败:', error);
      return {
        valid: false,
        error: '验证失败，请重试'
      };
    }
  }

  /**
   * 使用试用码
   */
  async useTrialCode(code: string, userId: string): Promise<{
    success: boolean;
    vipDays?: number;
    error?: string;
  }> {
    console.log(`🎫 [VipTrial] 用户 ${userId} 使用试用码: ${code}`);

    const connection = await database.beginTransaction();

    try {
      // 验证试用码
      const validation = await this.validateTrialCode(code);
      if (!validation.valid || !validation.codeData) {
        await database.rollback(connection);
        return {
          success: false,
          error: validation.error
        };
      }

      const codeData = validation.codeData;

      // 更新试用码状态
      await connection.execute(
        `UPDATE vip_trial_codes 
         SET used_by = ?, used_at = NOW(), status = 'used' 
         WHERE id = ?`,
        [userId, codeData.id]
      );

      // 更新用户VIP状态
      const vipExpiresAt = new Date();
      vipExpiresAt.setDate(vipExpiresAt.getDate() + codeData.vip_days);

      await connection.execute(
        `UPDATE users 
         SET vip_level = 'trial', vip_expires_at = ? 
         WHERE id = ?`,
        [vipExpiresAt, userId]
      );

      await database.commit(connection);

      console.log(`✅ [VipTrial] 试用码使用成功，用户获得 ${codeData.vip_days} 天VIP`);
      return {
        success: true,
        vipDays: codeData.vip_days
      };

    } catch (error) {
      await database.rollback(connection);
      console.error('❌ [VipTrial] 使用试用码失败:', error);
      return {
        success: false,
        error: '使用失败，请重试'
      };
    }
  }

  /**
   * 获取用户的VIP状态
   */
  async getUserVipStatus(userId: string): Promise<{
    vipLevel: 'free' | 'trial' | 'vip';
    isActive: boolean;
    expiresAt?: string;
    credits?: number;
  }> {
    try {
      const user = await database.queryOne<{
        vip_level: string;
        vip_expires_at: string | null;
        credits: number;
      }>(
        'SELECT vip_level, vip_expires_at, credits FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        return {
          vipLevel: 'free',
          isActive: false
        };
      }

      const isActive = user.vip_level !== 'free' && 
        (!user.vip_expires_at || new Date(user.vip_expires_at) > new Date());

      return {
        vipLevel: user.vip_level as 'free' | 'trial' | 'vip',
        isActive,
        expiresAt: user.vip_expires_at || undefined,
        credits: user.credits
      };

    } catch (error) {
      console.error('❌ [VipTrial] 获取用户VIP状态失败:', error);
      return {
        vipLevel: 'free',
        isActive: false
      };
    }
  }

  /**
   * 检查用户是否可以创建音乐
   */
  async canUserCreateMusic(userId: string): Promise<{
    canCreate: boolean;
    reason?: string;
    remainingCredits?: number;
  }> {
    try {
      const vipStatus = await this.getUserVipStatus(userId);
      
      if (!vipStatus.isActive) {
        return {
          canCreate: false,
          reason: '需要VIP权限才能创建音乐'
        };
      }

      // 临时VIP只能创建一首歌
      if (vipStatus.vipLevel === 'trial') {
        const workCount = await database.queryOne<{ count: number }>(
          'SELECT COUNT(*) as count FROM music_works WHERE user_id = ?',
          [userId]
        );

        if (workCount && workCount.count >= 1) {
          return {
            canCreate: false,
            reason: '试用VIP只能创建一首歌'
          };
        }
      }

      // 正式VIP检查积分
      if (vipStatus.vipLevel === 'vip') {
        const requiredCredits = parseInt(process.env.CREDITS_PER_GENERATION || '20');
        
        if ((vipStatus.credits ?? 0) < requiredCredits) {
          return {
            canCreate: false,
            reason: '积分不足',
            remainingCredits: vipStatus.credits
          };
        }
      }

      return {
        canCreate: true,
        remainingCredits: vipStatus.credits
      };

    } catch (error) {
      console.error('❌ [VipTrial] 检查用户创建权限失败:', error);
      return {
        canCreate: false,
        reason: '权限检查失败'
      };
    }
  }
}

// 创建单例实例
export const vipTrialService = new VipTrialService();
