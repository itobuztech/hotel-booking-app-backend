import { ArgumentsHost, Catch, NotFoundException } from "@nestjs/common";
import { GqlExceptionFilter, GqlArgumentsHost } from "@nestjs/graphql";
import { GraphQLError } from "graphql";

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements GqlExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    return new GraphQLError(exception.message, {
      extensions: {
        code: "NOT_FOUND",
        status: 404,
      },
    });
  }
}
