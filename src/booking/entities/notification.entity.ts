import { ObjectType, Field, ID, Int } from "@nestjs/graphql";
import {
  Notification as NotificationDB,
  User as UserDB,
  Booking as BookingDB,
} from "@prisma/client";
import { TotalCount } from "../../types/inputtypes/toalCount.entity";

@ObjectType()
export class UserNotification {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  name: UserDB["name"];

  @Field(() => ID)
  email: UserDB["email"];
}

// @ObjectType()
// export class BookingNotification {
//   @Field(() => ID)
//   id: string;

//   @Field(() => ID)
//   name: BookingDB[""];

//   @Field(() => ID)
//   email: BookingDB["email"];
// }

@ObjectType()
export class Notification {
  @Field(() => ID)
  id: NotificationDB["id"];

  @Field(() => String)
  description: NotificationDB["description"];

  @Field(() => String)
  customerNumber: NotificationDB["customerNumber"];

  @Field(() => String)
  customerEmail: NotificationDB["customerEmail"];

  @Field(() => String)
  status: NotificationDB["status"];

  @Field(() => UserNotification)
  user: UserNotification;

  // @Field(() => UserNotification)
  // user: UserNotification;

  @Field(() => Date)
  createdAt: NotificationDB["createdAt"];
}

@ObjectType()
export class PaginatedNotification extends TotalCount {
  @Field(() => [Notification])
  notifications: Notification[];

  @Field(() => Number)
  unreadNotificationCount: number;
}
