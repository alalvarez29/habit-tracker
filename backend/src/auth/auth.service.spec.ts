import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  const jwtService = { sign: jest.fn().mockReturnValue('signed-jwt') } as any;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    authService = new AuthService(usersService, jwtService);
  });

  describe('register', () => {
    it('hashea la contraseña antes de persistir al usuario', async () => {
      usersService.create.mockImplementation(async (data) => ({
        id: 'user-1',
        email: data.email,
        password: data.password,
        name: data.name ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await authService.register({ email: 'a@a.com', password: 'plain-password' });

      const persistedPassword = usersService.create.mock.calls[0][0].password;
      expect(persistedPassword).not.toBe('plain-password');
      expect(await bcrypt.compare('plain-password', persistedPassword)).toBe(true);
    });
  });

  describe('validateUser', () => {
    it('lanza UnauthorizedException si el usuario no existe', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(authService.validateUser('nadie@nada.com', 'x')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lanza UnauthorizedException si la contraseña no coincide', async () => {
      const hashed = await bcrypt.hash('correcta', 10);
      usersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'a@a.com',
        password: hashed,
        name: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(authService.validateUser('a@a.com', 'incorrecta')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('retorna el usuario si la contraseña coincide', async () => {
      const hashed = await bcrypt.hash('correcta', 10);
      const user = {
        id: 'user-1',
        email: 'a@a.com',
        password: hashed,
        name: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      usersService.findByEmail.mockResolvedValue(user);

      await expect(authService.validateUser('a@a.com', 'correcta')).resolves.toEqual(user);
    });
  });
});
