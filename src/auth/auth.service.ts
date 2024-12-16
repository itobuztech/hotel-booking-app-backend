import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from 'src/users/dto/create-user.input';
import { UsersService } from '../users/users.service';
import { LoginUserInput } from './dto/login-user.input';
import { PrivilegesList, PrivilegesListType } from '../privileges/user-privileges';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    const valid = user && (await bcrypt.compare(password, user?.password));

    if (user && valid) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(loginUserInput: LoginUserInput) {
    const user = await this.usersService.findOne(loginUserInput.email);
    const { password, ...result } = user;

    const match = await bcrypt.compare(loginUserInput.password, password);

    if (!match) throw new UnauthorizedException("Unauthorized");

    return {
      access_token: this.jwtService.sign({
        email: user.email,
        sub: user.id,
        role: user.role,
      }),
      user: result,
    };
  }

  async signup(signupUserInput: CreateUserInput) {
    const user = await this.usersService.findOne(signupUserInput.email);

    if (user) {
      throw new Error('User already exists');
    }

    const password = await bcrypt.hash(signupUserInput.password, 10);

    const newUser = await this.usersService.create({
      ...signupUserInput,
      password,
    });

    return {
      access_token: this.jwtService.sign({
        email: newUser.email,
        sub: newUser.id,
        role: newUser.role,
      }),
    };
  }

  async getpermissions(ctx: any): Promise<any> {
    const { userId } = ctx.req.user;
    const user = await this.usersService.findOneById(userId);
    return this.rebuildPermissions(PrivilegesList, user?.role?.privileges as number[]);
  }

  rebuildPermissions(originalPermissions: PrivilegesListType, validCapabilities: number[]): any {
    const rebuiltSections = {};
    for (const sectionkey in originalPermissions) {
      const section = originalPermissions[sectionkey];
      const rebuiltCapabilities = {};
      for (const capabilityKey in section.CAPABILITIES) {
        const capabilityValue = section.CAPABILITIES[capabilityKey];
        rebuiltCapabilities[capabilityKey] = validCapabilities.includes(capabilityValue) ? capabilityValue : null;
      }
      rebuiltSections[sectionkey] = {
        ...section,
        CAPABILITIES: rebuiltCapabilities
      };
    }
    return rebuiltSections;
  }
}
