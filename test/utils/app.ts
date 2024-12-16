import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

export const setup = async (app) => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    app.useLogger(console);
    return app;
}