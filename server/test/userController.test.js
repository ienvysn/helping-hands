const userController = require('../controller/userController');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const Organization = require('../models/Organization');

jest.mock('../models/User');
jest.mock('../models/Volunteer');
jest.mock('../models/Organization');

describe('User Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { id: 'mockUserId' },
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getProfile', () => {
        it('should get volunteer profile', async () => {
            const mockUser = {
                _id: 'mockUserId',
                email: 'test@example.com',
                userType: 'volunteer'
            };
            const mockProfile = { displayName: 'Volunteer Name' };

            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });
            Volunteer.findOne.mockResolvedValue(mockProfile);

            await userController.getProfile(req, res);

            expect(User.findById).toHaveBeenCalledWith('mockUserId');
            expect(Volunteer.findOne).toHaveBeenCalledWith({ userId: 'mockUserId' });
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: {
                    user: {
                        id: 'mockUserId',
                        email: 'test@example.com',
                        userType: 'volunteer'
                    },
                    profile: mockProfile
                }
            }));
        });

        it('should get organization profile', async () => {
            const mockUser = {
                _id: 'mockUserId',
                email: 'org@example.com',
                userType: 'organization'
            };
            const mockProfile = { organizationName: 'Org Name' };

            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });
            Organization.findOne.mockResolvedValue(mockProfile);

            await userController.getProfile(req, res);

            expect(Organization.findOne).toHaveBeenCalledWith({ userId: 'mockUserId' });
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    profile: mockProfile
                })
            }));
        });

        it('should return 404 if user not found', async () => {
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await userController.getProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'User not found'
            }));
        });
    });

    describe('updateVolunteerProfile', () => {
        it('should update volunteer profile', async () => {
            req.body = { displayName: 'New Name' };
            const mockProfile = {
                save: jest.fn().mockResolvedValue(true)
            };
            Volunteer.findOne.mockResolvedValue(mockProfile);

            await userController.updateVolunteerProfile(req, res);

            expect(Volunteer.findOne).toHaveBeenCalledWith({ userId: 'mockUserId' });
            expect(mockProfile.displayName).toBe('New Name');
            expect(mockProfile.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Profile updated successfully'
            }));
        });
    });
});
