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

const mockTask = {
  id: 'task-uuid-001',
  title: 'Fix login bug',
  description: 'The login page throws 500 on wrong password.',
  taskType: 'Bug',
  status: 'NOT_STARTED',
  priority: 'MEDIUM',
  dueDate: null,
  completedAt: null,
  userId: mockUser.id,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  task: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('Tasks (e2e)', () => {
  let app: INestApplication<App>;
  // JWT issued for mockUser — valid for the lifetime of this test suite
  let token: string;

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

    // Obtain a real JWT — JWT strategy validates the token signature, not the DB,
    // so this token remains valid for all task tests regardless of mock resets.
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: mockUser.email, password: USER_PASSWORD });

    token = res.body.accessToken as string;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── POST /tasks ──────────────────────────────────────────────────────────

  describe('POST /tasks', () => {
    it('201 — creates a task with title and description', async () => {
      mockPrisma.task.create.mockResolvedValue(mockTask);

      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Fix login bug', description: 'Throws 500 on wrong password.' })
        .expect(201);

      expect(res.body).toMatchObject({ id: mockTask.id, title: mockTask.title });
    });

    it('201 — creates a task with all optional fields', async () => {
      const full = { ...mockTask, taskType: 'Feature', status: 'STARTED', priority: 'HIGH' };
      mockPrisma.task.create.mockResolvedValue(full);

      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New feature',
          description: 'Implements dark mode.',
          taskType: 'Feature',
          status: 'STARTED',
          priority: 'HIGH',
          dueDate: '2026-04-01T00:00:00.000Z',
        })
        .expect(201);

      expect(res.body.status).toBe('STARTED');
    });

    it('400 — rejects invalid status enum', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task', description: 'Desc.', status: 'INVALID' })
        .expect(400);
    });

    it('400 — rejects extra unknown fields (whitelist)', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task', description: 'Desc.', unknownField: 'value' })
        .expect(400);
    });

    it('401 — rejects unauthenticated request', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Task', description: 'Desc.' })
        .expect(401);
    });
  });

  // ─── GET /tasks ───────────────────────────────────────────────────────────

  describe('GET /tasks', () => {
    it('200 — returns all tasks for the user', async () => {
      mockPrisma.task.findMany.mockResolvedValue([mockTask]);

      const res = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].id).toBe(mockTask.id);
    });

    it('200 — returns empty array when user has no tasks', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('401 — rejects unauthenticated request', async () => {
      await request(app.getHttpServer()).get('/tasks').expect(401);
    });
  });

  // ─── GET /tasks/types ─────────────────────────────────────────────────────

  describe('GET /tasks/types', () => {
    it('200 — returns distinct task type strings', async () => {
      mockPrisma.task.findMany.mockResolvedValue([{ taskType: 'Bug' }, { taskType: 'Feature' }]);

      const res = await request(app.getHttpServer())
        .get('/tasks/types')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toEqual(['Bug', 'Feature']);
    });

    it('200 — returns empty array when no types exist', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/tasks/types')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('401 — rejects unauthenticated request', async () => {
      await request(app.getHttpServer()).get('/tasks/types').expect(401);
    });
  });

  // ─── GET /tasks/:id ───────────────────────────────────────────────────────

  describe('GET /tasks/:id', () => {
    it('200 — returns the task by ID', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(mockTask);

      const res = await request(app.getHttpServer())
        .get(`/tasks/${mockTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.id).toBe(mockTask.id);
      expect(res.body.title).toBe(mockTask.title);
    });

    it('404 — returns not found for unknown ID', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/tasks/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('401 — rejects unauthenticated request', async () => {
      await request(app.getHttpServer()).get(`/tasks/${mockTask.id}`).expect(401);
    });
  });

  // ─── PATCH /tasks/:id ─────────────────────────────────────────────────────

  describe('PATCH /tasks/:id', () => {
    it('200 — updates task title', async () => {
      const updated = { ...mockTask, title: 'Updated title' };
      mockPrisma.task.findFirst.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue(updated);

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${mockTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated title' })
        .expect(200);

      expect(res.body.title).toBe('Updated title');
    });

    it('200 — sets completedAt when status changes to FINISHED', async () => {
      const finished = { ...mockTask, status: 'FINISHED', completedAt: new Date().toISOString() };
      mockPrisma.task.findFirst.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue(finished);

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${mockTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'FINISHED' })
        .expect(200);

      expect(res.body.status).toBe('FINISHED');
      expect(res.body.completedAt).not.toBeNull();
    });

    it('404 — returns not found for unknown ID', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch('/tasks/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' })
        .expect(404);
    });

    it('400 — rejects invalid status enum', async () => {
      await request(app.getHttpServer())
        .patch(`/tasks/${mockTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    it('400 — rejects invalid priority enum', async () => {
      await request(app.getHttpServer())
        .patch(`/tasks/${mockTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ priority: 'URGENT' })
        .expect(400);
    });

    it('400 — rejects extra unknown fields (whitelist)', async () => {
      await request(app.getHttpServer())
        .patch(`/tasks/${mockTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ unknownField: 'value' })
        .expect(400);
    });

    it('401 — rejects unauthenticated request', async () => {
      await request(app.getHttpServer())
        .patch(`/tasks/${mockTask.id}`)
        .send({ title: 'Updated' })
        .expect(401);
    });
  });

  // ─── DELETE /tasks/:id ────────────────────────────────────────────────────

  describe('DELETE /tasks/:id', () => {
    it('200 — deletes the task and returns message', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(mockTask);
      mockPrisma.task.delete.mockResolvedValue(mockTask);

      const res = await request(app.getHttpServer())
        .delete(`/tasks/${mockTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.message).toBe('Task deleted successfully');
    });

    it('404 — returns not found for unknown ID', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/tasks/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('401 — rejects unauthenticated request', async () => {
      await request(app.getHttpServer()).delete(`/tasks/${mockTask.id}`).expect(401);
    });
  });
});
