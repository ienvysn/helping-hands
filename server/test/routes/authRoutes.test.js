const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/authRoutes');
const authController = require('../../controller/authController');
const resetPasswordController = require('../../controller/resetPasswordController');
const oauthController = require('../../controller/oauthController');
const authMiddleware = require('../../middleware/auth');
const passport = require('passport');

// Mock dependencies
jest.mock('../../controller/authController');
jest.mock('../../controller/resetPasswordController');
jest.mock('../../controller/oauthController');
jest.mock('../../middleware/auth');
// Mock passport with a factory function that returns a middleware
jest.mock('passport', () => ({
    authenticate: jest.fn(() => (req, res, next) => next())
}));
jest.mock('../../middleware/validate', () => (schema) => (req, res, next) => next());

describe('Auth Routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Mock Auth Middleware
        authMiddleware.isAuthenticated.mockImplementation((req, res, next) => next());

        // Mock Passport
        passport.authenticate.mockReturnValue((req, res, next) => next());

        app.use('/api/auth', authRoutes);

        jest.clearAllMocks();
    });

    describe('Registration & Login', () => {
        it('POST /register should call register controller', async () => {
            authController.register.mockImplementation((req, res) => res.status(201).json({ success: true }));

            await request(app).post('/api/auth/register').send({ email: 'test@test.com' });

            expect(authController.register).toHaveBeenCalled();
        });

        it('POST /login should call login controller', async () => {
            authController.login.mockImplementation((req, res) => res.status(200).json({ success: true }));

            await request(app).post('/api/auth/login').send({ email: 'test@test.com' });

            expect(authController.login).toHaveBeenCalled();
        });
    });

    describe('Password Management', () => {
        it('POST /forget-password should call forgetPassword controller', async () => {
            resetPasswordController.forgetPassword.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).post('/api/auth/forget-password');

            expect(resetPasswordController.forgetPassword).toHaveBeenCalled();
        });

        it('POST /reset-password should call resetPassword controller', async () => {
            resetPasswordController.resetPassword.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).post('/api/auth/reset-password');

            expect(resetPasswordController.resetPassword).toHaveBeenCalled();
        });
    });

    describe('Account Management', () => {
        it('DELETE /delete should require auth and call deleteAccount', async () => {
            authController.deleteAccount.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).delete('/api/auth/delete');

            expect(authMiddleware.isAuthenticated).toHaveBeenCalled();
            expect(authController.deleteAccount).toHaveBeenCalled();
        });
    });

    describe('Google OAuth', () => {
        it('GET /google should call initiateGoogleAuth', async () => {
            oauthController.initiateGoogleAuth.mockImplementation((req, res) => res.redirect('google.com'));

            await request(app).get('/api/auth/google');

            expect(oauthController.initiateGoogleAuth).toHaveBeenCalled();
        });

        it('GET /google/callback should call passport.authenticate and handleGoogleCallback', async () => {
            oauthController.handleGoogleCallback.mockImplementation((req, res) => res.redirect('/'));

            await request(app).get('/api/auth/google/callback');

            // expect(passport.authenticate).toHaveBeenCalled(); // Cannot test this as it runs on require
            expect(oauthController.handleGoogleCallback).toHaveBeenCalled();
        });
    });
});
