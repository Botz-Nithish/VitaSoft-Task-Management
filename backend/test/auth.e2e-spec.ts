import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const USER_PASSWORD = 'Password123!';

const mockUser = {
  id: 'user-uuid-001',
  name: 'Test User',
  email: 'test@example.com',
  password: '', // filled in beforeAll after hashing
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  task: {},
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    mockUser.password = await bcrypt.hash(USER_PASSWORD, 1);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── POST /auth/register ──────────────────────────────────────────────────

  describe('POST /auth/register', () => {
    it('201 — registers a new user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: USER_PASSWORD })
        .expect(201);

      expect(res.body).toEqual({
        message: 'Registration successful',
        userId: mockUser.id,
        name: mockUser.name,
      });
    });

    it('409 — rejects duplicate email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: USER_PASSWORD })
        .expect(409);
    });

    it('400 — rejects missing name', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: USER_PASSWORD })
        .expect(400);
    });

    it('400 — rejects missing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test User', password: USER_PASSWORD })
        .expect(400);
    });

    it('400 — rejects missing password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test User', email: 'test@example.com' })
        .expect(400);
    });
  });

  // ─── POST /auth/login ─────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    it('200 — returns accessToken and user info on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: mockUser.email, password: USER_PASSWORD })
        .expect(200);

      expect(res.body).toMatchObject({
        accessToken: expect.any(String),
        userId: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it('401 — rejects unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: USER_PASSWORD })
        .expect(401);
    });

    it('401 — rejects wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: mockUser.email, password: 'WrongPassword!' })
        .expect(401);
    });

    it('400 — rejects missing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: USER_PASSWORD })
        .expect(400);
    });

    it('400 — rejects missing password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: mockUser.email })
        .expect(400);
    });
  });

  // ─── POST /auth/logout ────────────────────────────────────────────────────

  describe('POST /auth/logout', () => {
    let token: string;

    beforeAll(async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: mockUser.email, password: USER_PASSWORD });

      token = res.body.accessToken as string;
    });

    it('200 — logs out with valid JWT', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.message).toBe('Logged out successfully');
    });

    it('401 — rejects request without token', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });

    it('401 — rejects malformed token', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer not.a.real.token')
        .expect(401);
    });
  });
});
