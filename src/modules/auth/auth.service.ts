import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminsService } from '../admins/admin/admins.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { TokenService } from '../admins/token/token.service';
import { Request } from 'express';

// 1 day in milliseconds
const EXPIRE_TIME = 1000 * 60 * 60 * 24;
@Injectable()
export class AuthService {
  constructor(
    private _adminsService: AdminsService,
    private jwtService: JwtService,
    private tokenService: TokenService,
  ) {}

  async login(credential: LoginDto, request): Promise<any> {



    const user = await this.validateUser(credential);

    if (!user) {
      throw new BadRequestException('Invalid Credentials');
    }



    const payload = {
      username: user.username,
      email: user.email,
      sub: user.id,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
      secret: process.env.JWT_SECRET,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_TOKEN_KEY,
    });

    let ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;

    // convert ip to string
    ip = ip.toString();

    try {
      await this.tokenService.create({
        token: token,
        refreshToken: token,
        admin_id: user.id,
        ip: ip,
        userAgent: request.headers['user-agent'],
        expires_at: new Date(new Date().getTime() + EXPIRE_TIME),
      });
    } catch (error) {
      // console.log(error);
      throw new BadRequestException('Failed to create token');
    }

    return {
      accessToken: token,
      refreshToken: refreshToken,
      expiresIn: EXPIRE_TIME,
    };

  }


  async validateUser(credential: LoginDto) {
    const user = await this._adminsService.findByUsernameOrEmail(
      credential.username,
    );

    if (!user) {
      throw new BadRequestException('invalid credentials');
    }

    if (!(await bcrypt.compare(credential.password, user.password))) {
      throw new BadRequestException('Password is incorrect');
    }

    if (user.isVerified == false) {

      throw new BadRequestException('Your Account is not verified. Please Wait for Admin to Verify Your Account');
    }


    if (user.isActive == false) {
      throw new BadRequestException('Your Have Been Blocked. Please Contact Admin');
    }

    return user;

  }

  async doesPasswordMatch(password: string, hashedPassword: string) {
    return bcrypt.compareSync(password, hashedPassword); // true
  }


  async verifyJwt(jwt: string) {
    const { exp } = await this.jwtService.verifyAsync(jwt);

    if (exp < Date.now()) {
      throw new Error('Token expired');
    }

    return { exp };
  }

  async getProfile(req: Request): Promise<any> {
    try {
      const id = req.user['id'] as number;
      const user = await this._adminsService.findById(id);

      return user;
    } catch (error) {
      throw new Error('Invalid Token');
    }
  }

  async verifyToken(req: Request): Promise<any> {
    const id = req.user['id'] as number;
    const user = await this._adminsService.findById(id);

    if (!user) {
      throw new Error('invalid credentials');
    }

    return {
      message: 'success',
    };
  }

  async refreshToken(user: any) {
    const payload = {
      email: user.email,
      username: user.username,
      sub: user.sub,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '1d',
        secret: process.env.JWT_SECRET,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_TOKEN_KEY,
      }),
      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
    };
  }
}
