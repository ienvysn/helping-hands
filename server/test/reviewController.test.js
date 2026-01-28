const reviewController = require('../controller/reviewController');
const Review = require('../models/Review');
const Signup = require('../models/Signup');
const Opportunity = require('../models/Opportunity');
const Volunteer = require('../models/Volunteer');
const Organization = require('../models/Organization');

jest.mock('../models/Review');
jest.mock('../models/Signup');
jest.mock('../models/Opportunity');
jest.mock('../models/Volunteer');
jest.mock('../models/Organization');

describe('Review Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { id: 'mockUserId' },
            body: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('createReview', () => {
        it('should create a review successfully', async () => {
            req.body = {
                opportunityId: 'oppId',
                rating: 5,
                comment: 'Great!'
            };

            const mockVolunteer = { _id: 'volId' };
            const mockOpp = {
                _id: 'oppId',
                eventDate: new Date('2020-01-01'), // Past date
                organizationId: 'orgId'
            };
            const mockSignup = { status: 'attended' };

            Volunteer.findOne.mockResolvedValue(mockVolunteer);
            Opportunity.findById.mockResolvedValue(mockOpp);
            Signup.findOne.mockResolvedValue(mockSignup);
            Review.findOne.mockResolvedValue(null);
            Review.create.mockResolvedValue({ ...req.body, _id: 'reviewId' });
            Review.find.mockResolvedValue([{ rating: 5 }]); // For updateOrganizationRating

            await reviewController.createReview(req, res);

            expect(Volunteer.findOne).toHaveBeenCalledWith({ userId: 'mockUserId' });
            expect(Opportunity.findById).toHaveBeenCalledWith('oppId');
            expect(Signup.findOne).toHaveBeenCalledWith({
                volunteerId: 'volId',
                opportunityId: 'oppId',
                status: 'attended'
            });
            expect(Review.create).toHaveBeenCalled();
            expect(Organization.findByIdAndUpdate).toHaveBeenCalled(); // via updateOrganizationRating
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 400 if event is in the future', async () => {
            req.body = { opportunityId: 'oppId', rating: 5, comment: 'test' };
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            const mockOpp = {
                eventDate: futureDate,
                organizationId: 'orgId'
            };
            Volunteer.findOne.mockResolvedValue({ _id: 'volId' });
            Opportunity.findById.mockResolvedValue(mockOpp);
            Signup.findOne.mockResolvedValue({ status: 'attended' });

            await reviewController.createReview(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'You can only review past events'
            }));
        });
    });

    describe('getOrganizationReviews', () => {
        it('should get reviews for an organization', async () => {
            req.params.organizationId = 'orgId';
            const mockReviews = [{ comment: 'Nice' }];

            Review.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockReviews)
            });

            await reviewController.getOrganizationReviews(req, res);

            expect(Review.find).toHaveBeenCalledWith({ organizationId: 'orgId' });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 1,
                data: mockReviews
            });
        });
    });
});
