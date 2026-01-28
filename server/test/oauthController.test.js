const jwt = require('jsonwebtoken');
const passport = require('passport');
const oauthController = require('../controller/oauthController');

jest.mock('jsonwebtoken');
jest.mock('passport');

describe('OAuth Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {},
            session: {},
            user: null
        };
        res = {
            redirect: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('initiateGoogleAuth', () => {
        it('should store userType in session and call passport.authenticate', () => {
            req.query.userType = 'organization';

            const mockAuthenticateFunction = jest.fn();
            passport.authenticate.mockReturnValue(mockAuthenticateFunction);

            oauthController.initiateGoogleAuth(req, res, next);

            expect(req.session.userType).toBe('organization');
            expect(passport.authenticate).toHaveBeenCalledWith('google', {
                scope: ['profile', 'email']
            });
            expect(mockAuthenticateFunction).toHaveBeenCalledWith(req, res, next);
        });

        it('should default to volunteer if no userType is provided', () => {
            const mockAuthenticateFunction = jest.fn();
            passport.authenticate.mockReturnValue(mockAuthenticateFunction);

            oauthController.initiateGoogleAuth(req, res, next);

            expect(req.session.userType).toBe('volunteer');
            expect(passport.authenticate).toHaveBeenCalledWith('google', {
                scope: ['profile', 'email']
            });
        });

        it('should handle volunteer userType', () => {
            req.query.userType = 'volunteer';

            const mockAuthenticateFunction = jest.fn();
            passport.authenticate.mockReturnValue(mockAuthenticateFunction);

            oauthController.initiateGoogleAuth(req, res, next);

            expect(req.session.userType).toBe('volunteer');
        });
    });

    describe('handleGoogleCallback', () => {
        it('should generate JWT and redirect with token and userType', () => {
            req.user = {
                _id: 'userId123',
                userType: 'volunteer'
            };
            const mockToken = 'mock.jwt.token';

            jwt.sign.mockReturnValue(mockToken);

            oauthController.handleGoogleCallback(req, res);

            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 'userId123' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            expect(res.redirect).toHaveBeenCalledWith(
                `http://localhost:3000/auth/callback?token=${mockToken}&userType=volunteer`
            );
        });

        it('should handle organization userType', () => {
            req.user = {
                _id: 'orgUserId456',
                userType: 'organization'
            };
            const mockToken = 'mock.jwt.token.org';

            jwt.sign.mockReturnValue(mockToken);

            oauthController.handleGoogleCallback(req, res);

            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 'orgUserId456' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            expect(res.redirect).toHaveBeenCalledWith(
                `http://localhost:3000/auth/callback?token=${mockToken}&userType=organization`
            );
        });

        it('should redirect to login with error on JWT signing failure', () => {
            req.user = {
                _id: 'userId123',
                userType: 'volunteer'
            };

            jwt.sign.mockImplementation(() => {
                throw new Error('JWT signing failed');
            });

            // Mock console.error to avoid cluttering test output
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            oauthController.handleGoogleCallback(req, res);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Google callback error:',
                expect.any(Error)
            );
            expect(res.redirect).toHaveBeenCalledWith(
                'http://localhost:3000/login?error=auth_failed'
            );

            consoleErrorSpy.mockRestore();
        });

        it('should handle missing user object gracefully', () => {
            req.user = null;

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            oauthController.handleGoogleCallback(req, res);

            expect(res.redirect).toHaveBeenCalledWith(
                'http://localhost:3000/login?error=auth_failed'
            );

            consoleErrorSpy.mockRestore();
        });

        it('should handle undefined userType', () => {
            req.user = {
                _id: 'userId123',
                userType: undefined
            };
            const mockToken = 'mock.jwt.token';

            jwt.sign.mockReturnValue(mockToken);

            oauthController.handleGoogleCallback(req, res);

            expect(res.redirect).toHaveBeenCalledWith(
                `http://localhost:3000/auth/callback?token=${mockToken}&userType=undefined`
            );
        });
    });
});
