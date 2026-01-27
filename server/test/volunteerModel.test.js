const mongoose = require('mongoose');
const VolunteerProfile = require('../models/Volunteer');

describe('Volunteer Model Test', () => {

    const mockUserId = new mongoose.Types.ObjectId();

    it('should create a volunteer profile with default values', () => {
        const volunteer = new VolunteerProfile({
            userId: mockUserId
        });


        expect(volunteer.totalHours).toBe(0);
        expect(volunteer.completed).toBe(0);
        expect(volunteer.level).toBe(1);
    });

    it('should fail validation without userId', () => {
        const volunteer = new VolunteerProfile({});
        const err = volunteer.validateSync();
        expect(err.errors['userId']).toBeDefined();
    });

    describe('Level Calculation Logic (Virtual Field)', () => {

        const testCases = [
            { hours: 0, expected: 1 },
            { hours: 9, expected: 1 },
            { hours: 10, expected: 2 },
            { hours: 24, expected: 2 },
            { hours: 25, expected: 3 },
            { hours: 49, expected: 3 },
            { hours: 50, expected: 4 },
            { hours: 99, expected: 4 },
            { hours: 100, expected: 5 },
            { hours: 199, expected: 5 },
            { hours: 200, expected: 6 },
            { hours: 350, expected: 7 },
        ];

        testCases.forEach(({ hours, expected }) => {
            it(`should return level ${expected} when totalHours is ${hours}`, () => {
                const volunteer = new VolunteerProfile({
                    userId: mockUserId,
                    totalHours: hours
                });
                expect(volunteer.level).toBe(expected);
            });
        });
    });

    it('should enforce max length on aboutMe', () => {
        const longText = 'a'.repeat(501);
        const volunteer = new VolunteerProfile({
            userId: mockUserId,
            aboutMe: longText
        });
        const err = volunteer.validateSync();
        expect(err.errors['aboutMe']).toBeDefined();
    });
});

