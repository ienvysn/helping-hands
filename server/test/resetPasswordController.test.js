const resetPasswordController = require('../controller/resetPasswordController');
const User = require('../models/User');
const emailUtils = require('../utils/email');
const crypto = require('crypto');
// mock bcryptjs separately if needed, but the controller uses bcryptjs which is different from bcrypt?
// The controller requires 'bcryptjs'.
const bcrypt = require('bcryptjs');

jest.mock('../models/User');
jest.mock('../utils/email');
jest.mock('crypto');
jest.mock('bcryptjs');

describe('Reset Password Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('forgetPassword', () => {
        it('should send reset link if user exists', async () => {
            req.body = { email: 'test@example.com' };
            const mockUser = {
                email: 'test@example.com',
                save: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(mockUser);
            crypto.randomBytes.mockReturnValue({
                toString: jest.fn().mockReturnValue('mockToken')
            });
            emailUtils.sendEmail.mockResolvedValue(true);

            await resetPasswordController.forgetPassword(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(mockUser.resetPasswordToken).toBe('mockToken');
            expect(mockUser.save).toHaveBeenCalled();
            expect(emailUtils.sendEmail).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: expect.stringContaining('Password reset link generated')
            }));
        });

        it('should return 404 if user not found', async () => {
            req.body = { email: 'unknown@example.com' };
            User.findOne.mockResolvedValue(null);

            await resetPasswordController.forgetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'User not found'
            }));
        });
    });

    describe('resetPassword', () => {
        it('should reset password successfully', async () => {
            req.body = { token: 'validToken', newPassword: 'password123' };
            const mockUser = {
                save: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedPassword');

            await resetPasswordController.resetPassword(req, res);

            expect(User.findOne).toHaveBeenCalledWith({
                resetPasswordToken: 'validToken',
                resetPasswordExpiry: { $gt: expect.any(Number) } // Checking Date.now() call is tricky, but logic passes
            });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
            expect(mockUser.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Password reset successful'
            });
        });
    });
});
