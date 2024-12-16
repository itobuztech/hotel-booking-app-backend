import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setup } from './utils/app';

describe('Get Graphql Schema (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await setup(app);
  });

  it('/ (Fetch Schema:)', async () => {
    const expectedTypes = ['Boolean', 'CreateUserInput', 'DateTime'];

    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `{
          __schema {
            types {
              name
            }
          }
        }`,
      })
      .expect(200)
      .expect((response: any) => {
        const data = JSON.parse(response.res.text);
        const receivedTypes = (data.data.__schema.types.map(type => type.name));
        const containsSome = expectedTypes.some(type => receivedTypes.includes(type));
        expect(containsSome).toBe(true);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
