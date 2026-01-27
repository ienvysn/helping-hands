const mongoose = require('mongoose');
const Review = require('../models/Review');

describe('Review Model Test', () => {
    const mockVolunteerId = new mongoose.Types.ObjectId();
    const mockOpportunityId = new mongoose.Types.ObjectId();
    const mockOrganizationId = new mongoose.Types.ObjectId();

    it('should validate a review with correct fields', () => {
        const review = new Review({
            volunteerId: mockVolunteerId,
            opportunityId: mockOpportunityId,
            organizationId: mockOrganizationId,
            rating: 5,
            comment: 'Great experience, very organized.'
        });

        const err = review.validateSync();
        expect(err).toBeUndefined();
    });

    it('should fail validation without required fields', () => {
        const review = new Review({});
        const err = review.validateSync();
        expect(err.errors['volunteerId']).toBeDefined();
        expect(err.errors['opportunityId']).toBeDefined();
        expect(err.errors['organizationId']).toBeDefined();
        expect(err.errors['rating']).toBeDefined();
        expect(err.errors['comment']).toBeDefined();
    });

    it('should validate rating range', () => {
        const reviewLow = new Review({
            volunteerId: mockVolunteerId,
            opportunityId: mockOpportunityId,
            organizationId: mockOrganizationId,
            rating: 0,
            comment: 'Valid comment length here.'
        });
        const errLow = reviewLow.validateSync();
        expect(errLow.errors['rating']).toBeDefined();

        const reviewHigh = new Review({
            volunteerId: mockVolunteerId,
            opportunityId: mockOpportunityId,
            organizationId: mockOrganizationId,
            rating: 6,
            comment: 'Valid comment length here.'
        });
        const errHigh = reviewHigh.validateSync();
        expect(errHigh.errors['rating']).toBeDefined();
    });

    it('should validate comment length', () => {
        const reviewShort = new Review({
            volunteerId: mockVolunteerId,
            opportunityId: mockOpportunityId,
            organizationId: mockOrganizationId,
            rating: 4,
            comment: 'Short'
        });
        const errShort = reviewShort.validateSync();
        expect(errShort.errors['comment']).toBeDefined();
    });
});
