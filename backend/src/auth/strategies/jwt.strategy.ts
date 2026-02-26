import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { RequestUser } from '../../common/interfaces/authenticated-request.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Passport calls validate() after signature verification.
  // The returned object is attached to req.user by the framework.
  validate(payload: JwtPayload): RequestUser {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return { id: payload.sub, email: payload.email };
  }
}
