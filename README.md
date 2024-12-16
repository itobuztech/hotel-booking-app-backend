# NestJS Authentication and Role Based Access Control with GraphQL example

[![License](https://img.shields.io/github/license/saluki/nestjs-template.svg)](https://github.com/pgm-arthtemm/nestjs-auth-rbac-starter/blob/main/LICENSE)

Quick starter template for a [NestJS](https://nestjs.com/) **GraphQL** API with **user authentication** and **role based access control**.  
This template uses:

- GraphQL
- Prisma
- Postgres
- Apollo Server
- Passport-JWT

## Setup

Start by cloning the repository into your local workstation:

```sh
git clone https://github.com/pgm-arthtemm/nestjs-auth-rbac-starter.git my-project
```

This project is made with yarn. So use `yarn add`, not anything else.

```sh
cd ./my-project
yarn install
```

Create two `.env` files in the root of the project:

- `.env.development`
- `.env.production`

In the `.env.development` file, put the environment variables used in **development**.  
The `.env.production` file will contain all the environment variables for **production**.

To make connection with the database, fill in the right environment variables in the app.module.ts.

## Usage

When the database is connected, you can start up the server by running `yarn start:dev`.
A GraphQL schema will be generated. This will contain a Users table and all the dto's for user authentication.

To register a user:

- Go to the [GraphQL Playground](http://localhost:4000/graphql)
- Run the signup mutation using `email`, `password` and `username` variables

Running this mutation will create a new entry in the Users table **if the email is not already registered**.
The default Role will be set as USER. you can change this by creating a new role in the `roles` table and changing the default role in the `create` method of the `users.service.ts` file.

```js
  const defaultRole = await this.prisma.role.findFirst({
    select: {
      id: true,
    }
  });
```

To login a user:

- Go to the [GraphQL Playground](http://localhost:4000/graphql)
- Run the login mutation using `email` and `password` variables

Running this mutation will check the credentials of the user, if the credentials are correct, the mutation will return a JWT.
This token contains the user information, including the user role.

## Jwt Guards

To protect an API route, you can use a **JwtGuard**. This guard checks if the user has a valid JWT. You can apply this guard to the **UseGuard decorator** to queries and mutations inside a resolver.
In this example the findAll users query inside the `users.resolver.ts` file is protected using this guard.

```js
  @Query(() => [User], { name: 'users' })
  @UseGuards(JwtAuthGuard)
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
```

To send an authenticated request in the GraphQL playground, you can use the JWT that was returned after loggin in.
Add this to the HTTP Headers.  
**Remove the "<>"**.

```json
{
  "Authorization": "Bearer <your token>"
}
```

## Role Guards

The protect an API route from a specific user Role, you can use a **Roles** guard. This guard checks if the user has the correct roles to access the specified route.
In this example the findAll users query inside the `users.resolver.ts` file is protected using this guard.  
Only a user with the OWNER role can access this endpoint.

```js
  @Query(() => [User], { name: 'users' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.OWNER)
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
```


## Permissions Guards

The protect an API route from a specific user Permission, you can use a **PermissionsAND** or **PermissionsOR** guard. These guards check if the user has the correct privilege to access the specified resolver.


```js
  @Query(() => User, { name: 'account' })
  @UseGuards(JwtAuthGuard, PermissionsGuardOR)
  @Permissions([PrivilegesList.PROFILE.CAPABILITIES.VIEW])
  findOne(@Context() ctx: any): Promise<User> {
    return this.accountService.findOne();
  }
```

##  E2E Tests:

You need to have `dotenv` installed globally. Create a separate database for testing and update in the **.env.test** accordingly.
Run `dotenv -e .env.test -- npx prisma migrate dev` and `dotenv -e .env.test -- npx prisma db seed` to create the tables and populate the test database. Run migrations using `yarn run test:e2e`.

