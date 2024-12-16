import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import JSON from 'graphql-type-json';
import { CreateUserInput } from '../users/dto/create-user.input';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/login-response';
import { LoginUserInput } from './dto/login-user.input';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { PrivilegesList, PrivilegesListType } from '../privileges/user-privileges';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuardOR } from './guards/permissions-or.guard';
import { SignupResponse } from './dto/signup-response';
@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) { }

  @Mutation(() => LoginResponse)
  @UseGuards(GqlAuthGuard)
  async login(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    return this.authService.login(loginUserInput);
  }

  @Mutation(() => SignupResponse)
  signup(@Args('signupUserInput') signupUserInput: CreateUserInput) {
    return this.authService.signup(signupUserInput);
  }

  @Query(() => JSON)
  @UseGuards(JwtAuthGuard, PermissionsGuardOR)
  @Permissions([PrivilegesList.PROFILE.CAPABILITIES.VIEW])
  getpermissions(@Context() ctx: any): Promise<PrivilegesListType> {
    return this.authService.getpermissions(ctx);
  }
}
