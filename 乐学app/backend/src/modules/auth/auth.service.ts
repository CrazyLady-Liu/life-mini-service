import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponse, JwtPayload } from './interfaces/auth.interface';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const user = await this.userService.create(registerDto);
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  private async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      return null;
    }
    const isPasswordValid = await require('bcryptjs').compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    return user;
  }
}
