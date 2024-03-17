import { Injectable } from '@nestjs/common';

import { CreateTokenDto } from '../dto/create-token.dto';
import { PrismaService } from '@/modules/prisma/prisma.service';


@Injectable()
export class TokenService {
  constructor(
    private readonly _prisma: PrismaService,
  ) {}

  async create(createTokenDto: CreateTokenDto) {

    this._prisma.token.create({
      data: {
        token: createTokenDto.token,
        refreshToken: createTokenDto.refreshToken,
        ip: createTokenDto.ip,
        userAgent: createTokenDto.userAgent,
        expiresAt: createTokenDto.expires_at,
        admin: {
          connect: {
            id: createTokenDto.admin_id,
          },
        },
      },
    });

    return {
      message: 'Token Created Successfully',

    }
  }

  async findById(id: number) {

    return await this._prisma.token.findUnique({
      where: {
        id: id,
      },
    });


  }

  async findByAdminId(adminId: number) {

    return await this._prisma.token.findMany({
      include: {
        admin: true,
      },
      where: {
        adminId: adminId,
      },
    });



  }

  async findByToken(token: string) {
    return await this._prisma.token.findFirst({
      where: {
        token: token,
      },
    });
  }

  // isRevokedToken
  async isRevokedToken(token: string) {
    const tokenData = await this._prisma.token.findFirst({
      where: {
        token: token,
      },
    });

    if (!tokenData) {
      return false;
    }

    if (tokenData.isRevoked) {
      return true;
    }

    return false;
  }
}
