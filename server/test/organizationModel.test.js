const mongoose = require('mongoose');
const Organization = require('../models/Organization');

describe('Organization Model Test', () => {

    // Helper: Create a random ObjectId so we don't fail 'unique' constraints if we were using a real DB,
    // though validateSync() doesn't check DB uniqueness, it's good practice.
    const mockUserId = new mongoose.Types.ObjectId();

    // Test 1: Happy Path
    it('should validate an organization with minimum required fields', () => {
        const org = new Organization({
            userId: mockUserId,
            organizationName: 'Helping Hands Inc.'
        });

        const err = org.validateSync();
        expect(err).toBeUndefined(); // Should be no errors

        // Check defaults
        expect(org.mission).toBe('');
        expect(org.averageRating).toBe(0);
        expect(org.socialMedia.facebook).toBe('');
        expect(org.categories).toEqual([]);
    });

    // Test 2: Required Fields
    it('should fail validation without required fields', () => {
        const org = new Organization({}); // Empty object
        const err = org.validateSync();

        expect(err.errors['userId']).toBeDefined();
        expect(err.errors['organizationName']).toBeDefined();
    });

    // Test 3: Rating Validation (Min/Max)
    it('should validate averageRating range (0-5)', () => {
        // Test invalid high rating
        const orgHigh = new Organization({
            userId: mockUserId,
            organizationName: 'Test Org',
            averageRating: 6 // Max is 5
        });
        const errHigh = orgHigh.validateSync();
        expect(errHigh.errors['averageRating']).toBeDefined();

        // Test invalid low rating
        const orgLow = new Organization({
            userId: mockUserId,
            organizationName: 'Test Org',
            averageRating: -1 // Min is 0
        });
        const errLow = orgLow.validateSync();
        expect(errLow.errors['averageRating']).toBeDefined();
    });

    // Test 4: Nested Fields (Social Media)
    it('should handle nested socialMedia fields correctly', () => {
        const org = new Organization({
            userId: mockUserId,
            organizationName: 'Social Org',
            socialMedia: {
                twitter: '@helpinghands'
            }
        });

        // Validate it
        const err = org.validateSync();
        expect(err).toBeUndefined();

        // valid fields should be set, others should be default
        expect(org.socialMedia.twitter).toBe('@helpinghands');
        expect(org.socialMedia.facebook).toBe('');
    });
});
