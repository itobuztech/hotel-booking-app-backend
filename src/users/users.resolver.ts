import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from './entities/user.entity';
import { UserRole } from '@prisma/client';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  @Query(() => [User], { name: 'users', nullable: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  findOne(@Args('email') email: string): Promise<User> {
    return this.usersService.findOne(email);
  }

  @Mutation(() => User)
  create(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.usersService.create(createUserInput);
  }
}
