const request = require('supertest');
const express = require('express');
const opportunityRoutes = require('../../routes/opportunityRoutes');
const opportunityController = require('../../controller/opportunityController');
const authMiddleware = require('../../middleware/auth');

// Mock dependencies
jest.mock('../../controller/opportunityController');
jest.mock('../../middleware/auth');
jest.mock('../../middleware/validate', () => (schema) => (req, res, next) => next());

describe('Opportunity Routes', () => {
    let app;

    beforeEach(() => {
        // Setup Express App
        app = express();
        app.use(express.json());

        // Mock Auth Middleware default behavior (allow by default for specific tests)
        authMiddleware.isAuthenticated.mockImplementation((req, res, next) => {
            req.user = { id: 'mockUserId', role: 'organization' };
            next();
        });
        authMiddleware.isOrganization.mockImplementation((req, res, next) => next());

        // Setup Routes
        app.use('/api/opportunities', opportunityRoutes);

        jest.clearAllMocks();
    });

    describe('Public Routes', () => {
        it('GET / should call getAllOpportunities', async () => {
            opportunityController.getAllOpportunities.mockImplementation((req, res) => res.status(200).json({ success: true }));

            await request(app).get('/api/opportunities');

            expect(opportunityController.getAllOpportunities).toHaveBeenCalled();
        });

        it('GET /:id should call getOpportunityById', async () => {
            opportunityController.getOpportunityById.mockImplementation((req, res) => res.status(200).json({ success: true }));

            await request(app).get('/api/opportunities/123');

            expect(opportunityController.getOpportunityById).toHaveBeenCalled();
        });
    });

    describe('Organization Protected Routes', () => {
        it('POST / should require auth and organization role', async () => {
            opportunityController.createOpportunity.mockImplementation((req, res) => res.status(201).json({ success: true }));

            await request(app).post('/api/opportunities').send({ title: 'Test' });

            expect(authMiddleware.isAuthenticated).toHaveBeenCalled();
            expect(authMiddleware.isOrganization).toHaveBeenCalled();
            expect(opportunityController.createOpportunity).toHaveBeenCalled();
        });

        it('GET /my/list should check auth and call getMyOpportunities', async () => {
            opportunityController.getMyOpportunities.mockImplementation((req, res) => res.status(200).json({ success: true }));

            await request(app).get('/api/opportunities/my/list');

            expect(authMiddleware.isAuthenticated).toHaveBeenCalled();
            expect(authMiddleware.isOrganization).toHaveBeenCalled();
            expect(opportunityController.getMyOpportunities).toHaveBeenCalled();
        });

        it('GET /my/stats should check auth and call getOrganizationStats', async () => {
            opportunityController.getOrganizationStats.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).get('/api/opportunities/my/stats');

            expect(opportunityController.getOrganizationStats).toHaveBeenCalled();
        });

        it('PUT /:id should check auth and call updateOpportunity', async () => {
            opportunityController.updateOpportunity.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).put('/api/opportunities/123').send({ title: 'Update' });

            expect(opportunityController.updateOpportunity).toHaveBeenCalled();
        });

        it('DELETE /:id should check auth and call deleteOpportunity', async () => {
            opportunityController.deleteOpportunity.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).delete('/api/opportunities/123');

            expect(opportunityController.deleteOpportunity).toHaveBeenCalled();
        });
    });

    describe('Signup Management Routes', () => {
        it('GET /:opportunityId/signups should call getOpportunitySignups', async () => {
            opportunityController.getOpportunitySignups.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).get('/api/opportunities/123/signups');

            expect(opportunityController.getOpportunitySignups).toHaveBeenCalled();
        });

        it('POST /:opportunityId/signups/confirmAll should call confirmAllSignups', async () => {
            opportunityController.confirmAllSignups.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).post('/api/opportunities/123/signups/confirmAll');

            expect(opportunityController.confirmAllSignups).toHaveBeenCalled();
        });

        it('PUT /:opportunityId/signups/confirmOne should call confirmOneSignup', async () => {
            opportunityController.confirmOneSignup.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).put('/api/opportunities/123/signups/confirmOne');

            expect(opportunityController.confirmOneSignup).toHaveBeenCalled();
        });

        it('POST /:opportunityId/signups/rejectOne should call rejectOneSignup', async () => {
            opportunityController.rejectOneSignup.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).post('/api/opportunities/123/signups/rejectOne');

            expect(opportunityController.rejectOneSignup).toHaveBeenCalled();
        });
    });

    describe('Attendance Routes', () => {
        it('PUT /:opportunityId/attendance should call markAttendance', async () => {
            opportunityController.markAttendance.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).put('/api/opportunities/123/attendance');

            expect(opportunityController.markAttendance).toHaveBeenCalled();
        });
    });

    describe('Middleware Integration Failure Cases', () => {
        it('should return 401 if isAuthenticated throws/fails', async () => {
            authMiddleware.isAuthenticated.mockImplementation((req, res, next) => {
                res.status(401).json({ message: 'Unauthorized' });
            });

            const response = await request(app).post('/api/opportunities').send({ title: 'Test' });

            expect(response.status).toBe(401);
            expect(opportunityController.createOpportunity).not.toHaveBeenCalled();
        });

        it('should return 403 if isOrganization fails', async () => {
            authMiddleware.isOrganization.mockImplementation((req, res, next) => {
                res.status(403).json({ message: 'Forbidden' });
            });

            const response = await request(app).post('/api/opportunities').send({ title: 'Test' });

            expect(response.status).toBe(403);
            expect(opportunityController.createOpportunity).not.toHaveBeenCalled();
        });
    });
});
