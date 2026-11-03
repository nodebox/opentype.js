import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

describe('package entry points', function () {
    let consumer;

    beforeEach(function () {
        consumer = mkdtempSync(join(tmpdir(), 'opentype-consumer-'));
        mkdirSync(join(consumer, 'node_modules'));
        symlinkSync(fileURLToPath(new URL('../', import.meta.url)), join(consumer, 'node_modules/opentype.js'), 'dir');
    });

    afterEach(function () {
        rmSync(consumer, { recursive: true, force: true });
    });

    it('resolves named ESM imports to the ESM build', function () {
        const output = execFileSync(process.execPath, ['--input-type=module', '--eval', `
            import { Font, parse } from 'opentype.js';
            import assert from 'node:assert/strict';
            assert.equal(typeof Font, 'function');
            assert.equal(typeof parse, 'function');
            console.log(import.meta.resolve('opentype.js'));
        `], { cwd: consumer, encoding: 'utf8' });
        assert.match(output.trim(), /\/dist\/opentype\.mjs$/);
    });

    it('keeps CommonJS, distribution subpaths and package metadata available', function () {
        const require = createRequire(join(consumer, 'consumer.cjs'));
        assert.equal(typeof require('opentype.js').parse, 'function');
        assert.equal(typeof require('opentype.js/dist/opentype.js').Font, 'function');
        assert.equal(require('opentype.js/package.json').name, 'opentype.js');
    });
});
