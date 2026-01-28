const mongoose = require('mongoose');
const Notification = require('../models/Notification');

describe('Notification Model Test', () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it('should validate a notification with minimum required fields', () => {
        const notification = new Notification({
            userId: mockUserId,
            notificationType: 'new_signup',
            title: 'New Signup',
            message: 'A volunteer has signed up.'
        });

        const err = notification.validateSync();
        expect(err).toBeUndefined();
        expect(notification.isRead).toBe(false);
    });

    it('should fail validation without required fields', () => {
        const notification = new Notification({});
        const err = notification.validateSync();
        expect(err.errors['userId']).toBeDefined();
        expect(err.errors['notificationType']).toBeDefined();
        expect(err.errors['title']).toBeDefined();
        expect(err.errors['message']).toBeDefined();
    });

    it('should fail validation with invalid notificationType', () => {
        const notification = new Notification({
            userId: mockUserId,
            notificationType: 'invalid_type',
            title: 'Test',
            message: 'Test message'
        });
        const err = notification.validateSync();
        expect(err.errors['notificationType']).toBeDefined();
    });
});
