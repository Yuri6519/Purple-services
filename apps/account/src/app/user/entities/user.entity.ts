import { IUser, UserRole } from '@purple/inerfaces';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
  _id?: string;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;

  constructor(user: Omit<IUser, 'passwordHash'>) {
    this._id = user._id;
    this.displayName = user.displayName;
    this.email = user.email;
    this.role = user.role;
  }

  public async setPassword(password: string, hash?: string) {
    this.passwordHash = hash ?? (await this.setPasswordHash(password));
    return this;
  }

  public async validatePassword(password: string) {
    return await compare(password, this.passwordHash);
  }

  private async setPasswordHash(password: string): Promise<string> {
    const salt = await genSalt(10);
    return await hash(password, salt);
  }
}
