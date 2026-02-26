import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

// 12 rounds ≈ 250ms per hash — balances security cost against response time
const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * @param dto - {RegisterDto} validated registration payload (name: string, email: string, password: string)
   */
  async register(dto: RegisterDto): Promise<{ message: string; userId: string; name: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
    });

    return { message: 'Registration successful', userId: user.id, name: user.name };
  }

  /**
   * @param dto - {LoginDto} validated login credentials (email: string, password: string)
   */
  async login(dto: LoginDto): Promise<{ accessToken: string; userId: string; email: string; name: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Same generic error for both cases — avoids leaking whether the email exists
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken, userId: user.id, email: user.email, name: user.name };
  }
}
