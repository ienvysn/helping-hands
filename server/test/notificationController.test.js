const notificationController = require('../controller/notificationController');
const Notification = require('../models/Notification');

jest.mock('../models/Notification');

describe('Notification Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { id: 'mockUserId' },
            query: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getMyNotifications', () => {
        it('should fetch notifications with pagination', async () => {
            const mockNotifications = [{ title: 'Note 1' }, { title: 'Note 2' }];
            const mockTotal = 2;

            Notification.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockResolvedValue(mockNotifications) // Final chain resolves
            });
            Notification.countDocuments.mockResolvedValue(mockTotal);

            await notificationController.getMyNotifications(req, res);

            expect(Notification.find).toHaveBeenCalledWith({ userId: 'mockUserId' });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    notifications: mockNotifications,
                    pagination: {
                        total: mockTotal,
                        page: 1,
                        limit: 20,
                        totalPages: 1
                    }
                }
            });
        });

        it('should handle errors gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            Notification.find.mockImplementation(() => {
                throw new Error('Database error');
            });

            await notificationController.getMyNotifications(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'Error fetching notifications'
            }));
            consoleSpy.mockRestore();
        });
    });

    describe('markNotificationAsRead', () => {
        it('should mark a notification as read', async () => {
            req.params.id = 'noteId';
            const mockNotification = { _id: 'noteId', isRead: true };
            Notification.findOneAndUpdate.mockResolvedValue(mockNotification);

            await notificationController.markNotificationAsRead(req, res);

            expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: 'noteId', userId: 'mockUserId' },
                { isRead: true },
                { new: true }
            );
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockNotification
            });
        });

        it('should return 404 if notification not found', async () => {
            req.params.id = 'noteId';
            Notification.findOneAndUpdate.mockResolvedValue(null);

            await notificationController.markNotificationAsRead(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'Notification not found'
            }));
        });
    });
});
