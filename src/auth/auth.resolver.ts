import { BadRequestException, UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import JSON from "graphql-type-json";
import { CreateUserInput } from "../users/dto/create-user.input";
import { AuthService } from "./auth.service";
import { LoginResponse } from "./dto/login-response";
import { LoginUserInput } from "./dto/login-user.input";
import { GqlAuthGuard } from "./guards/gql-auth.guard";
import {
  PrivilegesList,
  PrivilegesListType,
} from "../privileges/user-privileges";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { PermissionsGuardOR } from "./guards/permissions-or.guard";
import {
  ForgotPasswordResponse,
  ValidateForgotPasswordResponse,
} from "./dto/forgot-password-response";
import {
  ForgotPasswordConfirmationInput,
  ForgotPasswordInput,
} from "./dto/forgot-password";
import { TokenConfirmationInput } from "./dto/token-confirmation.input";
import { Message } from "src/types/inputtypes/message.entity";
import { SignupResponse } from "./dto/signup-response";
import { RefreshToAccessTokenInput } from "./dto/refresh-to-access-token.input";
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse)
  @UseGuards(GqlAuthGuard)
  async login(@Args("loginUserInput") loginUserInput: LoginUserInput) {
    return this.authService.login(loginUserInput);
  }

  @Mutation(() => Message)
  signup(@Args("signupUserInput") signupUserInput: CreateUserInput) {
    return this.authService.signup(signupUserInput);
  }

  @Mutation(() => LoginResponse)
  async tokenConfirmation(
    @Args("tokenConfirmationInput")
    tokenConfirmationInput: TokenConfirmationInput
  ) {
    try {
      return this.authService.tokenConfirmation(tokenConfirmationInput);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Query(() => JSON)
  @UseGuards(JwtAuthGuard, PermissionsGuardOR)
  @Permissions([PrivilegesList.PROFILE.CAPABILITIES.VIEW])
  getpermissions(@Context() ctx: any): Promise<PrivilegesListType> {
    return this.authService.getpermissions(ctx);
  }

  @Mutation(() => ForgotPasswordResponse)
  async forgotPassword(
    @Args("forgotPasswordInput")
    forgotPasswordInput: ForgotPasswordInput
  ) {
    try {
      return this.authService.forgotPassword(forgotPasswordInput);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Mutation(() => ValidateForgotPasswordResponse)
  async validateForgotPassword(
    @Args("forgotPasswordInput")
    forgotPasswordConfirmationInput: ForgotPasswordConfirmationInput
  ) {
    try {
      return this.authService.validateForgotPasswordToken(
        forgotPasswordConfirmationInput
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Mutation(() => SignupResponse)
  async refreshToAccessToken(
    @Args("refreshToAccessTokenInput")
    refreshToAccessTokenInput: RefreshToAccessTokenInput
  ) {
    try {
      return this.authService.refreshToAccessToken(refreshToAccessTokenInput);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
