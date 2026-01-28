const mongoose = require('mongoose');
const User = require('../models/User');

describe('User Model Test', () => {

    // Test 1: Happy Path - Valid User with Password
    it('should validate a user with all required fields', () => {
        const userData = {
            email: 'test@example.com',
            passwordHash: 'hashedSecret123',
            userType: 'volunteer',
            profile: {
                displayName: 'Test User'
            }
        };
        const user = new User(userData);
        const err = user.validateSync();
        expect(err).toBeUndefined();
    });

    // Test 2: Required Fields Check
    it('should fail validation without required fields (email, userType)', () => {
        const user = new User({});
        const err = user.validateSync();

        expect(err.errors['email']).toBeDefined();
        expect(err.errors['userType']).toBeDefined();
    });

    // Test 3: Custom Logic - Password required if no Google ID
    it('should fail if neither passwordHash nor googleId is provided', () => {
        const user = new User({
            email: 'incomplete@example.com',
            userType: 'volunteer'
        });
        const err = user.validateSync();


        expect(err.errors['passwordHash']).toBeDefined();
    });

    // Test 4: Custom Logic - Google ID User (Password not required)
    it('should pass if googleId is provided without passwordHash', () => {
        const user = new User({
            email: 'googleuser@example.com',
            googleId: '1234567890',
            userType: 'volunteer'
        });
        const err = user.validateSync();
        expect(err).toBeUndefined();
    });

    // Test 5: Enum Validation
    it('should fail if userType is invalid', () => {
        const user = new User({
            email: 'test@example.com',
            passwordHash: 'pass',
            userType: 'admin'
        });
        const err = user.validateSync();
        expect(err.errors['userType']).toBeDefined();
    });

    // Test 6: Email Regex Validation
    it('should fail if email format is invalid', () => {
        const user = new User({
            email: 'invalid-email-format',
            passwordHash: 'pass',
            userType: 'volunteer'
        });
        const err = user.validateSync();
        expect(err.errors['email']).toBeDefined();
    });
});