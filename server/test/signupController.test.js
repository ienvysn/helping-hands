const signUpController = require('../controller/signUpController');
const Volunteer = require('../models/Volunteer');
const Opportunity = require('../models/Opportunity');
const Signup = require('../models/Signup');
const Organization = require('../models/Organization');
const notificationHelper = require('../utils/notificationHelper');

jest.mock('../models/Volunteer');
jest.mock('../models/Opportunity');
jest.mock('../models/Signup');
jest.mock('../models/Organization');
jest.mock('../utils/notificationHelper');

describe('Signup Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: {
                _id: 'userId',
                volunteerProfile: { _id: 'volId' }
            },
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('signUpForOpportunity', () => {
        it('should sign up successfully', async () => {
            req.body = { opportunityId: 'oppId' };
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            const mockOpp = {
                _id: 'oppId',
                isActive: true,
                eventDate: futureDate,
                title: 'Event'
            };
            const mockOrg = { userId: 'orgUserId' };
            const mockSignup = { status: 'pending' };

            Opportunity.findById.mockResolvedValue(mockOpp);
            Signup.countDocuments.mockResolvedValue(0);
            Signup.findOne.mockResolvedValue(null);
            Signup.create.mockResolvedValue(mockSignup);
            Organization.findById.mockResolvedValue(mockOrg);

            await signUpController.signUpForOpportunity(req, res);

            expect(Opportunity.findById).toHaveBeenCalledWith('oppId');
            expect(Signup.create).toHaveBeenCalled();
            expect(Organization.findById).toHaveBeenCalled();
            expect(notificationHelper.createNotification).toHaveBeenCalledTimes(2); // One for user, one for org
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 400 if already signed up', async () => {
            req.body = { opportunityId: 'oppId' };
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            const mockOpp = {
                isActive: true,
                eventDate: futureDate
            };
            Opportunity.findById.mockResolvedValue(mockOpp);
            Signup.findOne.mockResolvedValue({ status: 'pending' });

            await signUpController.signUpForOpportunity(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: 'You have already signed up'
            }));
        });
    });

    describe('getMySignups', () => {
        it('should get volunteer signups', async () => {
            req.user.id = 'userId';
            const mockVol = { _id: 'volId' };
            const mockSignups = [{ status: 'confirmed' }];

            Volunteer.findOne.mockResolvedValue(mockVol);
            Signup.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(mockSignups)
                })
            });

            await signUpController.getMySignups(req, res);

            expect(Volunteer.findOne).toHaveBeenCalledWith({ userId: 'userId' });
            expect(Signup.find).toHaveBeenCalledWith({ volunteerId: 'volId' });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockSignups
            });
        });
    });
});
