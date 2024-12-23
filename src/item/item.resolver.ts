import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { ItemService } from "./item.service";
import { CreateItemInput } from "./dto/create-item.input";
import { createSucess } from "src/types/inputtypes/create-success.entity";

@Resolver()
export class ItemResolver {
  constructor(private readonly itemService: ItemService) { }

  @Mutation(() => createSucess)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.ADMIN)
  // @Permissions([PrivilegesList.COURSE_MANAGEMENT.CAPABILITIES.CREATE])
  itemCreate(
    @Context() ctx,
    @Args("createItemInput") createItemInput: CreateItemInput
  ) {
    return this.itemService.createItem(ctx, createItemInput);
  }
}
