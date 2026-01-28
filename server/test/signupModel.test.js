const mongoose = require('mongoose');
const Signup = require('../models/Signup');

describe('Signup Model Test', () => {
    const mockVolunteerId = new mongoose.Types.ObjectId();
    const mockOpportunityId = new mongoose.Types.ObjectId();

    it('should validate a signup with minimum required fields', () => {
        const signup = new Signup({
            volunteerId: mockVolunteerId,
            opportunityId: mockOpportunityId
        });

        const err = signup.validateSync();
        expect(err).toBeUndefined();
        expect(signup.status).toBe('pending');
        expect(signup.hoursAwarded).toBe(0);
    });

    it('should fail validation without required fields', () => {
        const signup = new Signup({});
        const err = signup.validateSync();
        expect(err.errors['volunteerId']).toBeDefined();
        expect(err.errors['opportunityId']).toBeDefined();
    });

    it('should fail validation with invalid status', () => {
        const signup = new Signup({
            volunteerId: mockVolunteerId,
            opportunityId: mockOpportunityId,
            status: 'invalid_status'
        });
        const err = signup.validateSync();
        expect(err.errors['status']).toBeDefined();
    });
});
