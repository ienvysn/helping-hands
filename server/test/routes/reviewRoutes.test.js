const request = require('supertest');
const express = require('express');
const reviewRoutes = require('../../routes/reviewRoutes');
const reviewController = require('../../controller/reviewController');
const authMiddleware = require('../../middleware/auth');

jest.mock('../../controller/reviewController');
jest.mock('../../middleware/auth');

describe('Review Routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        authMiddleware.isAuthenticated.mockImplementation((req, res, next) => next());
        authMiddleware.isVolunteer.mockImplementation((req, res, next) => next());

        app.use('/api/reviews', reviewRoutes);
        jest.clearAllMocks();
    });

    describe('Volunteer Review Operations', () => {
        it('POST / should require volunteer role and call createReview', async () => {
            reviewController.createReview.mockImplementation((req, res) => res.status(201).json({ success: true }));

            await request(app).post('/api/reviews').send({ rating: 5, comment: 'Great' });

            expect(authMiddleware.isAuthenticated).toHaveBeenCalled();
            expect(authMiddleware.isVolunteer).toHaveBeenCalled();
            expect(reviewController.createReview).toHaveBeenCalled();
        });

        it('GET /my-reviews should require volunteer role and call getMyReviews', async () => {
            reviewController.getMyReviews.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).get('/api/reviews/my-reviews');

            expect(authMiddleware.isAuthenticated).toHaveBeenCalled();
            expect(authMiddleware.isVolunteer).toHaveBeenCalled();
            expect(reviewController.getMyReviews).toHaveBeenCalled();
        });

        it('PUT /:reviewId should require volunteer role and call updateReview', async () => {
            reviewController.updateReview.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).put('/api/reviews/123').send({ comment: 'Updated' });

            expect(authMiddleware.isAuthenticated).toHaveBeenCalled();
            expect(authMiddleware.isVolunteer).toHaveBeenCalled();
            expect(reviewController.updateReview).toHaveBeenCalled();
        });

        it('DELETE /:reviewId should require volunteer role and call deleteReview', async () => {
            reviewController.deleteReview.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).delete('/api/reviews/123');

            expect(authMiddleware.isAuthenticated).toHaveBeenCalled();
            expect(authMiddleware.isVolunteer).toHaveBeenCalled();
            expect(reviewController.deleteReview).toHaveBeenCalled();
        });
    });

    describe('Public Review Routes', () => {
        it('GET /organization/:organizationId should call getOrganizationReviews', async () => {
            reviewController.getOrganizationReviews.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).get('/api/reviews/organization/org123');

            expect(reviewController.getOrganizationReviews).toHaveBeenCalled();
        });

        it('GET /opportunity/:opportunityId should call getOpportunityReviews', async () => {
            reviewController.getOpportunityReviews.mockImplementation((req, res) => res.json({ success: true }));

            await request(app).get('/api/reviews/opportunity/opp123');

            expect(reviewController.getOpportunityReviews).toHaveBeenCalled();
        });
    });
});
