const opportunityController = require('../controller/opportunityController');
const Opportunity = require('../models/Opportunity');
const Organization = require('../models/Organization');
const Signup = require('../models/Signup');
const VolunteerProfile = require('../models/Volunteer');
const notificationHelper = require('../utils/notificationHelper');

jest.mock('../models/Opportunity');
jest.mock('../models/Organization');
jest.mock('../models/Signup');
jest.mock('../models/Volunteer');
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

            expect(Opportunity.find).toHaveBeenCalled();
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

    describe('updateOpportunity', () => {
        it('should update opportunity successfully', async () => {
            req.params.id = 'oppId';
            req.body = { title: 'Updated Title', description: 'Updated Description' };

            const mockOrg = { _id: 'orgId' };
            const mockOpp = {
                _id: 'oppId',
                organizationId: { equals: jest.fn().mockReturnValue(true) },
                title: 'Old Title',
                save: jest.fn().mockResolvedValue(true)
            };

            Opportunity.findById.mockResolvedValue(mockOpp);
            Organization.findOne.mockResolvedValue(mockOrg);

            await opportunityController.updateOpportunity(req, res);

            expect(mockOpp.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Opportunity updated successfully'
            }));
        });

        it('should return 404 if opportunity not found', async () => {
            req.params.id = 'oppId';
            Opportunity.findById.mockResolvedValue(null);

            await opportunityController.updateOpportunity(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Opportunity not found'
            }));
        });

        it('should return 403 if user does not own the opportunity', async () => {
            req.params.id = 'oppId';
            const mockOrg = { _id: 'orgId' };
            const mockOpp = {
                organizationId: { equals: jest.fn().mockReturnValue(false) }
            };

            Opportunity.findById.mockResolvedValue(mockOpp);
            Organization.findOne.mockResolvedValue(mockOrg);

            await opportunityController.updateOpportunity(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'You can only update your own opportunities'
            }));
        });
    });

    describe('deleteOpportunity', () => {
        it('should delete opportunity successfully', async () => {
            req.params.id = 'oppId';
            const mockOrg = { _id: 'orgId' };
            const mockOpp = {
                _id: 'oppId',
                organizationId: { equals: jest.fn().mockReturnValue(true) },
                isActive: true,
                save: jest.fn().mockResolvedValue(true)
            };

            Opportunity.findById.mockResolvedValue(mockOpp);
            Organization.findOne.mockResolvedValue(mockOrg);

            await opportunityController.deleteOpportunity(req, res);

            expect(mockOpp.isActive).toBe(false);
            expect(mockOpp.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Opportunity deleted successfully'
            }));
        });

        it('should return 404 if opportunity not found', async () => {
            req.params.id = 'oppId';
            Opportunity.findById.mockResolvedValue(null);

            await opportunityController.deleteOpportunity(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 403 if user does not own the opportunity', async () => {
            req.params.id = 'oppId';
            const mockOrg = { _id: 'orgId' };
            const mockOpp = {
                organizationId: { equals: jest.fn().mockReturnValue(false) }
            };

            Opportunity.findById.mockResolvedValue(mockOpp);
            Organization.findOne.mockResolvedValue(mockOrg);

            await opportunityController.deleteOpportunity(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('getMyOpportunities', () => {
        it('should get organization opportunities with signup counts', async () => {
            req.query = { page: 1, limit: 10 };
            const mockOrg = { _id: 'orgId' };
            const mockOpps = [{ _id: 'opp1', title: 'Event 1' }];

            Organization.findOne.mockResolvedValue(mockOrg);
            Opportunity.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockOpps)
            });
            Opportunity.countDocuments.mockResolvedValue(1);
            Signup.countDocuments.mockResolvedValue(5);

            await opportunityController.getMyOpportunities(req, res);

            expect(Organization.findOne).toHaveBeenCalledWith({ userId: 'mockUserId' });
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.objectContaining({
                    opportunities: expect.any(Array),
                    pagination: expect.any(Object)
                })
            }));
        });

        it('should return 404 if organization not found', async () => {
            Organization.findOne.mockResolvedValue(null);

            await opportunityController.getMyOpportunities(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Organization profile not found'
            }));
        });
    });

    describe('getOrganizationStats', () => {
        it('should return organization statistics', async () => {
            const mockOrg = {
                _id: 'orgId',
                averageRating: 4.5,
                totalReviews: 10
            };
            const mockOpps = [
                { _id: 'opp1', durationHours: 3 },
                { _id: 'opp2', durationHours: 5 }
            ];

            Organization.findOne.mockResolvedValue(mockOrg);
            Opportunity.find.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockOpps)
            });
            Opportunity.countDocuments.mockResolvedValue(2);
            Signup.distinct.mockResolvedValue(['vol1', 'vol2', 'vol3']);
            Signup.aggregate.mockResolvedValue([{ _id: null, totalHours: 50 }]);

            await opportunityController.getOrganizationStats(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.objectContaining({
                    eventsOrganized: 2,
                    totalVolunteers: 3,
                    totalHours: 50,
                    rating: 4.5,
                    totalReviews: 10
                })
            }));
        });

        it('should return 404 if organization not found', async () => {
            Organization.findOne.mockResolvedValue(null);

            await opportunityController.getOrganizationStats(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('getOpportunitySignups', () => {
        it('should get signups for an opportunity', async () => {
            req.params.opportunityId = 'oppId';
            const mockSignups = [
                { _id: 'signup1', volunteerId: { displayName: 'John' } }
            ];

            Signup.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockSignups)
            });

            await opportunityController.getOpportunitySignups(req, res);

            expect(Signup.find).toHaveBeenCalledWith({
                opportunityId: 'oppId',
                status: { $in: ['pending', 'confirmed'] }
            });
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                count: 1,
                data: mockSignups
            }));
        });
    });

    describe('confirmAllSignups', () => {
        it('should confirm all pending signups', async () => {
            req.params.opportunityId = 'oppId';
            const mockOrg = { _id: 'orgId' };
            const mockOpp = {
                _id: 'oppId',
                organizationId: { equals: jest.fn().mockReturnValue(true) },
                title: 'Test Event'
            };
            const mockSignups = [
                { volunteerId: { userId: 'user1' } },
                { volunteerId: { userId: 'user2' } }
            ];

            Opportunity.findById.mockResolvedValue(mockOpp);
            Organization.findOne.mockResolvedValue(mockOrg);
            Signup.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockSignups)
            });
            Signup.updateMany.mockResolvedValue({ modifiedCount: 2 });
            notificationHelper.createNotification.mockResolvedValue(true);

            await opportunityController.confirmAllSignups(req, res);

            expect(Signup.updateMany).toHaveBeenCalled();
            expect(notificationHelper.createNotification).toHaveBeenCalledTimes(2);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                count: 2
            }));
        });

        it('should return 404 if opportunity not found', async () => {
            req.params.opportunityId = 'oppId';
            Opportunity.findById.mockResolvedValue(null);

            await opportunityController.confirmAllSignups(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 403 if user does not own the opportunity', async () => {
            req.params.opportunityId = 'oppId';
            const mockOrg = { _id: 'orgId' };
            const mockOpp = {
                organizationId: { equals: jest.fn().mockReturnValue(false) }
            };

            Opportunity.findById.mockResolvedValue(mockOpp);
            Organization.findOne.mockResolvedValue(mockOrg);

            await opportunityController.confirmAllSignups(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('confirmOneSignup', () => {
        it('should confirm a single signup', async () => {
            req.params.opportunityId = 'oppId';
            req.body.volunteerId = 'volId';

            const mockOrg = { _id: 'orgId' };
            const mockOpp = {
                _id: 'oppId',
                organizationId: { equals: jest.fn().mockReturnValue(true) },
                title: 'Test Event'
            };
            const mockSignup = {
                status: 'pending',
                volunteerId: { userId: 'userId' },
                save: jest.fn().mockResolvedValue(true)
            };

            Opportunity.findById.mockResolvedValue(mockOpp);
            Organization.findOne.mockResolvedValue(mockOrg);
            Signup.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockSignup)
            });
            notificationHelper.createNotification.mockResolvedValue(true);

            await opportunityController.confirmOneSignup(req, res);

            expect(mockSignup.status).toBe('confirmed');
            expect(mockSignup.save).toHaveBeenCalled();
            expect(notificationHelper.createNotification).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if signup not found', async () => {
            req.params.opportunityId = 'oppId';
            req.body.volunteerId = 'volId';

            const mockOrg = { _id: 'orgId' };
            const mockOpp = {
                organizationId: { equals: jest.fn().mockReturnValue(true) }
            };

            Opportunity.findById.mockResolvedValue(mockOpp);
            Organization.findOne.mockResolvedValue(mockOrg);
            Signup.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await opportunityController.confirmOneSignup(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('rejectOneSignup', () => {
        it('should reject a single signup', async () => {
            req.params.opportunityId = 'oppId';
            req.body.volunteerId = 'volId';

            const mockOrg = { _id: 'orgId' };
            const mockOpp = {
                _id: 'oppId',
                organizationId: { equals: jest.fn().mockReturnValue(true) },
                title: 'Test Event'
            };
            const mockSignup = {
                status: 'pending',
                volunteerId: { userId: 'userId' },
                save: jest.fn().mockResolvedValue(true)
            };

            Opportunity.findById.mockResolvedValue(mockOpp);
            Organization.findOne.mockResolvedValue(mockOrg);
            Signup.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockSignup)
            });
            notificationHelper.createNotification.mockResolvedValue(true);

            await opportunityController.rejectOneSignup(req, res);

            expect(mockSignup.status).toBe('rejected');
            expect(mockSignup.save).toHaveBeenCalled();
            expect(notificationHelper.createNotification).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Signup rejected'
            }));
        });

        it('should return 404 if opportunity not found', async () => {
            req.params.opportunityId = 'oppId';
            req.body.volunteerId = 'volId';
            Opportunity.findById.mockResolvedValue(null);

            await opportunityController.rejectOneSignup(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('markAttendance', () => {
        it('should mark attendance for volunteers', async () => {
            req.params.opportunityId = 'oppId';
            req.body.attendance = [
                { signupId: 'signup1', attended: true }
            ];

            const mockOrg = { _id: 'orgId' };
            const mockOpp = {
                _id: 'oppId',
                organizationId: { equals: jest.fn().mockReturnValue(true) },
                title: 'Test Event',
                durationHours: 3,
                eventDate: new Date('2023-01-01')
            };
            const mockVolunteer = {
                totalHours: 10,
                save: jest.fn().mockResolvedValue(true)
            };
            const mockSignup = {
                _id: 'signup1',
                status: 'confirmed',
                volunteerId: {
                    userId: 'userId',
                    totalHours: 10,
                    save: jest.fn().mockResolvedValue(true)
                },
                save: jest.fn().mockResolvedValue(true)
            };

            Opportunity.findById.mockResolvedValue(mockOpp);
            Organization.findOne.mockResolvedValue(mockOrg);
            Signup.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockSignup)
            });
            notificationHelper.createNotification.mockResolvedValue(true);

            await opportunityController.markAttendance(req, res);

            expect(mockSignup.status).toBe('attended');
            expect(mockSignup.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Attendance marked successfully'
            }));
        });

        it('should return 400 if attendance array is empty', async () => {
            req.params.opportunityId = 'oppId';
            req.body.attendance = [];

            await opportunityController.markAttendance(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Attendance array is required'
            }));
        });

        it('should return 404 if opportunity not found', async () => {
            req.params.opportunityId = 'oppId';
            req.body.attendance = [{ signupId: 'signup1', attended: true }];
            Opportunity.findById.mockResolvedValue(null);

            await opportunityController.markAttendance(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('calculateLevel', () => {
        it('should calculate correct levels based on hours', () => {
            expect(opportunityController.calculateLevel(5)).toBe(1);
            expect(opportunityController.calculateLevel(15)).toBe(2);
            expect(opportunityController.calculateLevel(30)).toBe(3);
            expect(opportunityController.calculateLevel(75)).toBe(4);
            expect(opportunityController.calculateLevel(150)).toBe(5);
            expect(opportunityController.calculateLevel(250)).toBe(6);
        });
    });
});
