import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto } from './dto';
import { UserEntity } from '../user/entities/user.entity';
import { UserRepository } from '../user/repositories/user.repository';
import { UserRole } from '@purple/inerfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly repository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  public getEcho(): string {
    return `AuthService:echo::secret=${this.configService.get('JWT_SECRET')}`;
  }

  public async register({ email, password, displayName }: RegisterDto) {
    const existUser = await this.repository.findUser(email);

    if (existUser) {
      throw new Error('Пользовательс с таким e-mail уже существуент');
    }

    const userEntity = await new UserEntity({
      displayName,
      email,
      role: UserRole.Student,
    }).setPassword(password);

    const newUser = await this.repository.createUser(userEntity);

    return { email: newUser.email };
  }

  public async validate({ email, password }: LoginDto) {
    const currentUser = await this.repository.findUser(email);

    if (!currentUser) {
      throw new Error('Неверный логин или пароль');
    }

    const userEntity = new UserEntity(currentUser);
    userEntity.setPassword('', currentUser.passwordHash);
    const isPasswordCorrect = await userEntity.validatePassword(password);

    if (!isPasswordCorrect) {
      throw new Error('Неверный логин или пароль');
    }

    return { id: userEntity._id };
  }

  public async authorize(id: string) {
    return { access_token: await this.jwtService.signAsync({ id }) };
  }
}
