import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { CreateUserInput } from "src/users/dto/create-user.input";
import { UsersService } from "../users/users.service";
import { LoginUserInput } from "./dto/login-user.input";
import {
  PrivilegesList,
  PrivilegesListType,
} from "../privileges/user-privileges";
import { UserPayload } from "src/util/extended-types";
import {
  ForgotPasswordResponse,
  ValidateForgotPasswordResponse,
} from "./dto/forgot-password-response";
import {
  ForgotPasswordConfirmationInput,
  ForgotPasswordInput,
} from "./dto/forgot-password";
import { generateToken } from "../util/helper";
import { EmailService } from "../email/email.service";
import { TokenConfirmationInput } from "./dto/token-confirmation.input";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) {}

  async generateAccessToken(userPayload: UserPayload) {
    return this.jwtService.sign(userPayload);
  }

  async generateRefreshToken(userPayload: UserPayload) {
    return this.jwtService.sign(userPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: "7d",
    });
  }

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

    const access_token = await this.generateAccessToken({
      email: user.email,
      sub: user.id,
      role: user.role,
    });

    if (!access_token) {
      throw new Error("Access token creation error!");
    }

    const refresh_token = await this.generateRefreshToken({
      email: user.email,
      sub: user.id,
      role: user.role,
    });

    if (!refresh_token) {
      throw new Error("Refresh token creation error!");
    }

    return {
      access_token: access_token,
      refresh_token,
      user: result,
    };
  }

  async signup(signupUserInput) {
    try {
      const user = await this.usersService.findOne(signupUserInput.email);

      if (user) {
        throw new Error("User already exists");
      }

      const password = await bcrypt.hash(signupUserInput.password, 10);

      const confirmationToken = await generateToken();

      const newUser = await this.usersService.create({
        ...signupUserInput,
        password,
        confirmationToken,
      });

      if (!newUser) {
        throw new Error(
          "No User is Created. Please try again after some time!"
        );
      }

      const subject = "Verify Your Account";
      const body = `<p>Hello,</p> 
        <p>Thank you for registering. Please click the link below to verify your account:</p>
        <a href="${process.env.FRONTEND_BASE_URL}/token?confirmation_token=${confirmationToken}">Verify Account</a>
        <p>If you didn’t create this account, please ignore this email.</p>
        <p>Best regards.</p>
        `;

      const emailSent = await this.emailService.run(
        newUser.email,
        subject,
        body
      );

      if (!emailSent) {
        throw new Error(
          "No Confirmation email is sent. Please try again after some time!"
        );
      }

      return {
        message:
          "Thank you for signing up! Please check your email to confirm your account.",
      };
    } catch (error) {
      throw error;
    }
  }

  async tokenConfirmation(tokenConfirmationInput: TokenConfirmationInput) {
    try {
      const emailConfirmationToken = tokenConfirmationInput.token;
      const user = await this.usersService.findOneByToken(
        emailConfirmationToken
      );

      return {
        access_token: this.jwtService.sign({
          email: user.email,
          sub: user.id,
          role: user.role,
        }),
        refresh_token: await this.generateRefreshToken({
          email: user.email,
          sub: user.id,
          role: user.role,
        }),
        user,
      };
    } catch (error) {
      throw error;
    }
  }

  async getpermissions(ctx: any): Promise<any> {
    const { userId } = ctx.req.user;
    const user = await this.usersService.findOneById(userId);
    return this.rebuildPermissions(
      PrivilegesList,
      user?.role?.privileges as number[]
    );
  }

  rebuildPermissions(
    originalPermissions: PrivilegesListType,
    validCapabilities: number[]
  ): any {
    const rebuiltSections = {};
    for (const sectionkey in originalPermissions) {
      const section = originalPermissions[sectionkey];
      const rebuiltCapabilities = {};
      for (const capabilityKey in section.CAPABILITIES) {
        const capabilityValue = section.CAPABILITIES[capabilityKey];
        rebuiltCapabilities[capabilityKey] = validCapabilities.includes(
          capabilityValue
        )
          ? capabilityValue
          : null;
      }
      rebuiltSections[sectionkey] = {
        ...section,
        CAPABILITIES: rebuiltCapabilities,
      };
    }
    return rebuiltSections;
  }

  async forgotPassword(
    forgotPasswordInput: ForgotPasswordInput
  ): Promise<ForgotPasswordResponse> {
    const user = await this.usersService.findOne(forgotPasswordInput.email);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const { email, id, name } = user;

    const confirmationToken = await generateToken();
    const subject = "Forgot Password Request!";
    const body = `<p>Hello ${name}</p>
        <p>We received a request to reset the password for your [Service Name] account. To ensure the security of your account, please click the link below to set a new password:.</p> 
        <p>By clicking on this link ${process.env.FRONTEND_BASE_URL}/forgotpasswordconfirmation?confirmation_token=${confirmationToken}</p> 
        <p>Thanks</p>`;

    const emailSent = await this.emailService.run(email, subject, body);

    if (!emailSent) {
      throw new InternalServerErrorException(
        "Failed to send confirmation email!"
      );
    }

    try {
      await this.usersService.updateUser(id, {
        emailConfirmationToken: confirmationToken,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Failed to generate confirmation token!"
      );
    }

    return { token: confirmationToken };
  }

  async validateForgotPasswordToken(
    forgotPasswordConfirmationInput: ForgotPasswordConfirmationInput
  ): Promise<ValidateForgotPasswordResponse> {
    const { confirmationToken, newPassword } = forgotPasswordConfirmationInput;
    const user = await this.usersService.findOneByToken(confirmationToken);
    const { id } = user;

    if (!user) {
      throw new NotFoundException("User not found");
    }
    const password = await bcrypt.hash(newPassword, 10);
    try {
      await this.usersService.updateUser(id, {
        emailConfirmationToken: null,
        password,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Failed to generate confirmation token!"
      );
    }

    return { message: "Password has been reset. Try loggin in." };
  }
}
