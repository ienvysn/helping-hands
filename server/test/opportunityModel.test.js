const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');

describe('Opportunity Model Test', () => {
    const mockOrgId = new mongoose.Types.ObjectId();

    it('should validate an opportunity with minimum required fields', () => {
        const opportunity = new Opportunity({
            organizationId: mockOrgId,
            title: 'Clean the Park',
            description: 'Help us clean the city park.',
            eventDate: new Date(),
            opportunityType: 'on-site'
        });

        const err = opportunity.validateSync();
        expect(err).toBeUndefined();
        expect(opportunity.isActive).toBe(true);
        expect(opportunity.cause).toBe('Other');
    });

    it('should fail validation without required fields', () => {
        const opportunity = new Opportunity({});
        const err = opportunity.validateSync();
        expect(err.errors['organizationId']).toBeDefined();
        expect(err.errors['title']).toBeDefined();
        expect(err.errors['description']).toBeDefined();
        expect(err.errors['eventDate']).toBeDefined();
    });

    it('should fail validation with invalid enums', () => {
        const opportunity = new Opportunity({
            organizationId: mockOrgId,
            title: 'Test',
            description: 'Test',
            eventDate: new Date(),
            opportunityType: 'invalid_type',
            cause: 'invalid_cause'
        });
        const err = opportunity.validateSync();
        expect(err.errors['opportunityType']).toBeDefined();
        expect(err.errors['cause']).toBeDefined();
    });
});
