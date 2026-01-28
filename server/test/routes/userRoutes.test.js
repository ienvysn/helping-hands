const request = require('supertest');
const express = require('express');
const userRoutes = require('../../routes/userRoutes');
const userController = require('../../controller/userController');
const authMiddleware = require('../../middleware/auth');

jest.mock('../../controller/userController');
jest.mock('../../middleware/auth');

describe('User Routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        authMiddleware.isAuthenticated.mockImplementation((req, res, next) => next());
        authMiddleware.isVolunteer.mockImplementation((req, res, next) => next());
        authMiddleware.isOrganization.mockImplementation((req, res, next) => next());

        app.use('/api/user', userRoutes);
        jest.clearAllMocks();
    });

    describe('Profile Routes', () => {
        it('GET /profile should require auth and call getProfile', async () => {
            userController.getProfile.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).get('/api/user/profile');

            expect(authMiddleware.isAuthenticated).toHaveBeenCalled();
            expect(userController.getProfile).toHaveBeenCalled();
        });

        it('PUT /profile/volunteer should require volunteer role and call updateVolunteerProfile', async () => {
            userController.updateVolunteerProfile.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).put('/api/user/profile/volunteer').send({ displayName: 'Test' });

            expect(authMiddleware.isAuthenticated).toHaveBeenCalled();
            expect(authMiddleware.isVolunteer).toHaveBeenCalled();
            expect(userController.updateVolunteerProfile).toHaveBeenCalled();
        });

        it('PUT /profile/organization should require organization role and call updateOrganizationProfile', async () => {
            userController.updateOrganizationProfile.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).put('/api/user/profile/organization').send({ organizationName: 'Org' });

            expect(authMiddleware.isAuthenticated).toHaveBeenCalled();
            expect(authMiddleware.isOrganization).toHaveBeenCalled();
            expect(userController.updateOrganizationProfile).toHaveBeenCalled();
        });
    });
});
