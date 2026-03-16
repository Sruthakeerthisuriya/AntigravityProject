const crypto = require('crypto');
const router = require('./your-router-file'); // Adjust path as necessary
const generationService = require('../services/generationService');

jest.mock('../services/generationService');

describe('Webhook Router Tests', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GITHUB_WEBHOOK_SECRET = 'test-secret';
        process.env.Recipient_Email = 'test@example.com';
        
        req = {
            headers: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    afterEach(() => {
        delete process.env.GITHUB_WEBHOOK_SECRET;
        delete process.env.Recipient_Email;
    });

    const getHmac = (body) => {
        const hmac = crypto.createHmac('sha256', 'test-secret');
        return 'sha256=' + hmac.update(JSON.stringify(body)).digest('hex');
    };

    describe('POST /', () => {
        it('should return 400 if URL-encoded payload is invalid JSON', async () => {
            req.body = { payload: 'invalid-json' };
            const handler = router.stack.find(s => s.route.path === '/').route.stack[0].handle;
            await handler(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith('Invalid JSON in payload');
        });

        it('should return 401 if signature is missing when secret is configured', async () => {
            req.headers['x-github-event'] = 'push';
            const handler = router.stack.find(s => s.route.path === '/').route.stack[0].handle;
            await handler(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith('Invalid signature');
        });

        it('should return 401 if signature is incorrect', async () => {
            req.headers['x-github-event'] = 'push';
            req.headers['x-hub-signature-256'] = 'wrong-signature';
            req.body = { foo: 'bar' };
            const handler = router.stack.find(s => s.route.path === '/').route.stack[0].handle;
            await handler(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return 400 if push payload is malformed', async () => {
            req.headers['x-github-event'] = 'push';
            req.headers['x-hub-signature-256'] = getHmac({});
            req.body = {};
            const handler = router.stack.find(s => s.route.path === '/').route.stack[0].handle;
            await handler(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith('Malformed payload');
        });

        it('should ignore pushes to AI-generated branches', async () => {
            const payload = {
                repository: { name: 'repo', owner: { login: 'owner' } },
                commits: [],
                ref: 'refs/heads/ai-tests/feature-1'
            };
            req.headers['x-github-event'] = 'push';
            req.headers['x-hub-signature-256'] = getHmac(payload);
            req.body = payload;
            
            const handler = router.stack.find(s => s.route.path === '/').route.stack[0].handle;
            await handler(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith('Ignoring AI branch - no loop');
        });

        it('should return 400 if missing recipient email or identity', async () => {
            delete process.env.Recipient_Email;
            const payload = {
                repository: { name: 'repo', owner: { login: 'owner' } },
                commits: [{ added: ['file.js'] }],
                ref: 'refs/heads/main'
            };
            req.headers['x-github-event'] = 'push';
            req.headers['x-hub-signature-256'] = getHmac(payload);
            req.body = payload;
            
            const handler = router.stack.find(s => s.route.path === '/').route.stack[0].handle;
            await handler(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith('Missing config or identity');
        });

        it('should trigger test generation for valid source files', async () => {
            const payload = {
                repository: { name: 'my-repo', owner: { login: 'my-user' } },
                after: 'sha123',
                ref: 'refs/heads/main',
                commits: [
                    { added: ['src/app.js', 'docs/readme.md'], modified: ['lib/utils.py'] }
                ]
            };
            req.headers['x-github-event'] = 'push';
            req.headers['x-hub-signature-256'] = getHmac(payload);
            req.body = payload;
            
            generationService.generateTestsAndRaisePR.mockResolvedValue({});

            const handler = router.stack.find(s => s.route.path === '/').route.stack[0].handle;
            await handler(req, res);

            expect(generationService.generateTestsAndRaisePR).toHaveBeenCalledWith(
                'my-user',
                'my-repo',
                'sha123',
                ['src/app.js', 'lib/utils.py']
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith('Automated test generation triggered');
        });

        it('should return 200 with no action if no source files are changed', async () => {
            const payload = {
                repository: { name: 'repo', owner: { login: 'owner' } },
                commits: [{ added: ['test/app.test.js', 'CalculatorTest.java'] }],
                ref: 'refs/heads/main'
            };
            req.headers['x-github-event'] = 'push';
            req.headers['x-hub-signature-256'] = getHmac(payload);
            req.body = payload;
            
            const handler = router.stack.find(s => s.route.path === '/').route.stack[0].handle;
            await handler(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith('No source file changes');
            expect(generationService.generateTestsAndRaisePR).not.toHaveBeenCalled();
        });

        it('should fallback to push event if header is missing but commits exist', async () => {
            const payload = {
                repository: { name: 'repo', owner: { login: 'owner' } },
                commits: [{ added: ['main.py'] }],
                after: 'sha1'
            };
            req.headers['x-hub-signature-256'] = getHmac(payload);
            req.body = payload;
            
            generationService.generateTestsAndRaisePR.mockResolvedValue({});
            const handler = router.stack.find(s => s.route.path === '/').route.stack[0].handle;
            await handler(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith('Automated test generation triggered');
        });

        it('should handle ping or other events with 200', async () => {
            req.headers['x-github-event'] = 'ping';
            req.headers['x-hub-signature-256'] = getHmac({});
            req.body = {};
            const handler = router.stack.find(s => s.route.path === '/').route.stack[0].handle;
            await handler(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toMatch(/Event ping ignored/);
        });
    });

    describe('isSourceFile Logic', () => {
        // We extract the function logic from the router file for testing
        // Since it's not exported, we test it via the route logic or by exporting it in the source.
        // Assuming the tests have access to the internal function via the router's closure logic or helper.
        // Here we simulate the filtering inside the commit loop.

        const triggerIsSourceFile = (path) => {
            const payload = {
                repository: { name: 'r', owner: { login: 'o' } },
                commits: [{ added: [path] }],
                ref: 'refs/heads/main'
            };
            req.headers['x-github-event'] = 'push';
            req.headers['x-hub-signature-256'] = getHmac(payload);
            req.body = payload;
            return router.stack.find(s => s.route.path === '/').route.stack[0].handle(req, res);
        };

        it('identifies .js, .py, .java as source', async () => {
            await triggerIsSourceFile('src/index.js');
            expect(generationService.generateTestsAndRaisePR).toHaveBeenCalled();
        });

        it('rejects .txt or .md files', async () => {
            await triggerIsSourceFile('README.md');
            expect(generationService.generateTestsAndRaisePR).not.toHaveBeenCalled();
        });

        it('rejects Java test files', async () => {
            await triggerIsSourceFile('src/main/CalculatorTest.java');
            expect(generationService.generateTestsAndRaisePR).not.toHaveBeenCalled();
        });

        it('rejects files in /tests/ directory', async () => {
            await triggerIsSourceFile('project/tests/utils.js');
            expect(generationService.generateTestsAndRaisePR).not.toHaveBeenCalled();
        });

        it('rejects .test.js and .spec.js files', async () => {
            await triggerIsSourceFile('auth.test.js');
            await triggerIsSourceFile('auth.spec.js');
            expect(generationService.generateTestsAndRaisePR).not.toHaveBeenCalled();
        });

        it('rejects files in java-tests/ directory', async () => {
            await triggerIsSourceFile('java-tests/SomeClass.java');
            expect(generationService.generateTestsAndRaisePR).not.toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle repository owner name fallback if login is missing', async () => {
            const payload = {
                repository: { name: 'repo', owner: { name: 'owner-name' } },
                commits: [{ added: ['main.js'] }],
                after: 'sha1',
                ref: 'refs/heads/main'
            };
            req.headers['x-github-event'] = 'push';
            req.headers['x-hub-signature-256'] = getHmac(payload);
            req.body = payload;
            
            generationService.generateTestsAndRaisePR.mockResolvedValue({});
            const handler = router.stack.find(s => s.route.path === '/').route.stack[0].handle;
            await handler(req, res);
            expect(generationService.generateTestsAndRaisePR).toHaveBeenCalledWith(
                'owner-name', 'repo', 'sha1', ['main.js']
            );
        });

        it('should not crash if generationService fails', async () => {
            const payload = {
                repository: { name: 'repo', owner: { login: 'owner' } },
                commits: [{ added: ['main.js'] }],
                after: 'sha1',
                ref: 'refs/heads/main'
            };
            req.headers['x-github-event'] = 'push';
            req.headers['x-hub-signature-256'] = getHmac(payload);
            req.body = payload;
            
            generationService.generateTestsAndRaisePR.mockRejectedValue(new Error('Async Failure'));
            const handler = router.stack.find(s => s.route.path === '/').route.stack[0].handle;
            
            await expect(handler(req, res)).resolves.not.toThrow();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});