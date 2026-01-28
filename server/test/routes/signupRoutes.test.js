const request = require('supertest');
const express = require('express');
const signupRoutes = require('../../routes/signupRoute');
const signUpController = require('../../controller/signUpController');
const authMiddleware = require('../../middleware/auth');

jest.mock('../../controller/signUpController');
jest.mock('../../middleware/auth');
jest.mock('../../middleware/validate', () => (schema) => (req, res, next) => next());

describe('Signup Routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        authMiddleware.isAuthenticated.mockImplementation((req, res, next) => next());
        authMiddleware.isVolunteer.mockImplementation((req, res, next) => next());

        app.use('/api/signups', signupRoutes);
        jest.clearAllMocks();
    });

    describe('Volunteer Signup Operations', () => {
        it('POST / should require volunteer role and call signUpForOpportunity', async () => {
            signUpController.signUpForOpportunity.mockImplementation((req, res) => res.status(201).json({ success: true }));

            await request(app).post('/api/signups').send({ opportunityId: '123' });

            expect(authMiddleware.isAuthenticated).toHaveBeenCalled();
            expect(authMiddleware.isVolunteer).toHaveBeenCalled();
            expect(signUpController.signUpForOpportunity).toHaveBeenCalled();
        });

        it('GET /my-signups should require volunteer role and call getMySignups', async () => {
            signUpController.getMySignups.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).get('/api/signups/my-signups');

            expect(authMiddleware.isAuthenticated).toHaveBeenCalled();
            expect(authMiddleware.isVolunteer).toHaveBeenCalled();
            expect(signUpController.getMySignups).toHaveBeenCalled();
        });
    });
});
