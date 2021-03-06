import { Injectable, Inject, forwardRef } from '@nestjs/common';

import { Redis } from 'ioredis';
import randomstring from 'randomstring';

import { RedisService } from '@/redis/redis.service';

const RATE_LIMIT = 60;
const CODE_VALID_TIME = 60 * 15;

const REDIS_KEY_EMAIL_VERIFICATION_CODE_RATE_LIMIT =
  'email-verification-code-rate-limit:%s';
const REDIS_KEY_EMAIL_VERIFICATION_CODE = 'email-verification-code:%s:%s';

export enum EmailVerificationCodeType {
  Login = 'Login',
}

@Injectable()
export class AuthEmailVerificationCodeService {
  private readonly redis: Redis;
  private readonly REDIS_KEY_EMAIL_VERIFICATION_CODE_RATE_LIMIT: string;
  private readonly REDIS_KEY_EMAIL_VERIFICATION_CODE: string;

  constructor(
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getClient();

    this.REDIS_KEY_EMAIL_VERIFICATION_CODE_RATE_LIMIT =
      this.redisService.getRedisKeyWithNamespace(
        REDIS_KEY_EMAIL_VERIFICATION_CODE_RATE_LIMIT,
      );

    this.REDIS_KEY_EMAIL_VERIFICATION_CODE =
      this.redisService.getRedisKeyWithNamespace(
        REDIS_KEY_EMAIL_VERIFICATION_CODE,
      );
  }

  async generate(email: string): Promise<string> {
    // If rate limit key already exists it will fail
    if (
      !(await this.redis.set(
        this.REDIS_KEY_EMAIL_VERIFICATION_CODE_RATE_LIMIT.format(email),
        '1',
        'EX',
        RATE_LIMIT,
        'NX',
      ))
    ) {
      return null;
    }

    const code = randomstring.generate({
      charset: '1234567890',
      length: 6,
    });

    await this.redis.set(
      this.REDIS_KEY_EMAIL_VERIFICATION_CODE.format(email, code),
      '1',
      'EX',
      CODE_VALID_TIME,
    );

    return code;
  }

  async verify(email: string, code: string): Promise<boolean> {
    return Boolean(
      await this.redis.get(
        this.REDIS_KEY_EMAIL_VERIFICATION_CODE.format(email, code),
      ),
    );
  }

  async revoke(email: string, code: string): Promise<void> {
    await this.redis.del(
      this.REDIS_KEY_EMAIL_VERIFICATION_CODE.format(email, code),
    );
  }
}
