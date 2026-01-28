const authController = require('../controller/authController');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const Organization = require('../models/Organization');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../models/User');
jest.mock('../models/Volunteer');
jest.mock('../models/Organization');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should return 400 if user already exists', async () => {
            req.body = { email: 'test@example.com' };
            User.findOne.mockResolvedValue({ email: 'test@example.com' });

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
        });

        it('should register a new volunteer successfully', async () => {
            req.body = {
                email: 'new@example.com',
                password: 'password123',
                userType: 'volunteer',
                displayName: 'Test Volunteer'
            };

            User.findOne.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedPassword');
            const mockUserSaved = { _id: 'mockUserId', ...req.body };
            User.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(mockUserSaved),
                _id: 'mockUserId'
            }));
            Volunteer.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue({})
            }));
            jwt.sign.mockReturnValue('mockToken');

            await authController.register(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'new@example.com' });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(User).toHaveBeenCalled();
            expect(Volunteer).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                token: 'mockToken'
            }));
        });
    });

    describe('login', () => {
        it('should return 401 if user not found', async () => {
            req.body = { email: 'notfound@example.com', password: 'password' };
            User.findOne.mockResolvedValue(null);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User Not Found' }));
        });

        it('should return 400 if password does not match', async () => {
            req.body = { email: 'test@example.com', password: 'wrongpassword' };
            const mockUser = {
                _id: 'userId',
                email: 'test@example.com',
                passwordHash: 'hashedPassword',
                userType: 'volunteer'
            };
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid password' });
        });

        it('should login successfully with correct credentials', async () => {
            req.body = { email: 'test@example.com', password: 'correctpassword' };
            const mockUser = {
                _id: 'userId',
                email: 'test@example.com',
                passwordHash: 'hashedPassword',
                userType: 'volunteer'
            };
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mockToken');

            await authController.login(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Login successful',
                data: expect.objectContaining({ token: 'mockToken' })
            }));
        });
    });
});
