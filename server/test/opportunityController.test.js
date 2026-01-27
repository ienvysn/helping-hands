const opportunityController = require('../controller/opportunityController');
const Opportunity = require('../models/Opportunity');
const Organization = require('../models/Organization');
const notificationHelper = require('../utils/notificationHelper');

jest.mock('../models/Opportunity');
jest.mock('../models/Organization');
jest.mock('../utils/notificationHelper');

describe('Opportunity Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { id: 'mockUserId' },
            body: {},
            query: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('createOpportunity', () => {
        it('should create an opportunity successfully', async () => {
            req.body = {
                title: 'New Event',
                eventDate: '2023-12-25'
            };
            const mockOrg = { _id: 'orgId' };
            Organization.findOne.mockResolvedValue(mockOrg);
            Opportunity.create.mockResolvedValue({ _id: 'oppId', ...req.body });

            await opportunityController.createOpportunity(req, res);

            expect(Organization.findOne).toHaveBeenCalledWith({ userId: 'mockUserId' });
            expect(Opportunity.create).toHaveBeenCalledWith(expect.objectContaining({
                organizationId: 'orgId',
                title: 'New Event'
            }));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Opportunity created successfully'
            }));
        });

        it('should return 404 if organization profile not found', async () => {
            Organization.findOne.mockResolvedValue(null);

            await opportunityController.createOpportunity(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Organization profile not found'
            }));
        });
    });

    describe('getAllOpportunities', () => {
        it('should get opportunities with filters', async () => {
            req.query = { search: 'clean', page: 1, limit: 10 };
            const mockOpps = [{ title: 'Clean Park' }];
            const mockTotal = 1;

            Opportunity.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockOpps)
            });
            Opportunity.countDocuments.mockResolvedValue(mockTotal);

            await opportunityController.getAllOpportunities(req, res);

            expect(Opportunity.find).toHaveBeenCalled(); // Arguments are complex, just checking call
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.objectContaining({
                    opportunities: mockOpps,
                    pagination: expect.any(Object)
                })
            }));
        });
    });

    describe('getOpportunityById', () => {
        it('should get opportunity by ID', async () => {
            req.params.id = 'oppId';
            const mockOpp = { _id: 'oppId', title: 'Event' };
            Opportunity.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockOpp)
            });

            await opportunityController.getOpportunityById(req, res);

            expect(Opportunity.findById).toHaveBeenCalledWith('oppId');
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockOpp
            });
        });

        it('should return 404 if opportunity not found', async () => {
            req.params.id = 'oppId';
            Opportunity.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await opportunityController.getOpportunityById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
