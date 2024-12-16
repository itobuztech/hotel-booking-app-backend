import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setup } from './utils/app';

describe('Auth (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        app = await setup(app);
    });

    it('/ (Login:)', async () => {
        await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                    mutation Login($loginUserInput: LoginUserInput!) {
                        login(loginUserInput: $loginUserInput) {
                            access_token
                        }
                    }
                `,
                variables: {
                    "loginUserInput": {
                        "email": "palash@itobuz.com",
                        "password": "Itobuz#1234"
                    }
                }
            })
            .expect(200)
            .expect((response: any) => {
                const text = JSON.parse(response.request.res.text);
                expect(text).toHaveProperty(['data', 'login', 'access_token']);
            });
    });

    afterEach(async () => {
        await app.close();
    });
});
