'use strict';

const assert = require('assert').strict;
const AssertionError = assert.AssertionError;

describe(`OperationTourCode`, function () {
	it('should pass the custom format validator', function () {
		try {
			const tryFormat = Dex.formats.validate(
				// Example challenge codes:
				//`[Gen 9] Random Battle@@@Chimera 1v1 Rule,Max Team Size=24,Adjust Level=100,Terastal Clause`
				`[Gen 9] Random Doubles Battle@@@Chimera 1v1 Rule,Max Team Size=24,Adjust Level=100,Terastal Clause`
			);
			const format = Dex.formats.get(tryFormat, true);
		} catch (err) {
			throw new AssertionError({
				message: "Expected custom format to be valid, but it failed validator:\n" + err,
				stackStartFunction: assert.legalFormat,
			});
		}
	});
});
