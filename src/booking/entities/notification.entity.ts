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

  @Field(() => String, { nullable: true })
  name?: UserDB["name"];

  @Field(() => String)
  email: UserDB["email"];
}

@ObjectType()
export class Notification {
  @Field(() => ID)
  id: NotificationDB["id"];

  @Field(() => String)
  description: NotificationDB["description"];

  @Field(() => String)
  customerNumber: NotificationDB["customerNumber"];

  @Field(() => String, { nullable: true })
  customerEmail?: NotificationDB["customerEmail"];

  @Field(() => String)
  status: NotificationDB["status"];

  @Field(() => UserNotification)
  User: UserNotification;

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
