const request = require('supertest');
const express = require('express');
const notificationRoutes = require('../../routes/notificationRoutes');
const notificationController = require('../../controller/notificationController');
const authMiddleware = require('../../middleware/auth');

jest.mock('../../controller/notificationController');
jest.mock('../../middleware/auth');

describe('Notification Routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        authMiddleware.isAuthenticated.mockImplementation((req, res, next) => next());

        app.use('/api/notifications', notificationRoutes);
        jest.clearAllMocks();
    });

    describe('Notification Operations', () => {
        it('GET / should require auth and call getMyNotifications', async () => {
            notificationController.getMyNotifications.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).get('/api/notifications');

            expect(authMiddleware.isAuthenticated).toHaveBeenCalled();
            expect(notificationController.getMyNotifications).toHaveBeenCalled();
        });

        it('PUT /:id/read should require auth and call markNotificationAsRead', async () => {
            notificationController.markNotificationAsRead.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).put('/api/notifications/123/read');

            expect(authMiddleware.isAuthenticated).toHaveBeenCalled();
            expect(notificationController.markNotificationAsRead).toHaveBeenCalled();
        });
    });
});
