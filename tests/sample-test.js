define(function (require) {
	var tdd = require('intern!tdd');
	tdd.suite('recorder-generated suite', function () {
		tdd.test('Test 1', function () {
			return this.remote
				.get('http://localhost:3000/?/')
				.findByXpath('id("new-todo")')
					.moveMouseTo(89, 24)
					.clickMouseButton(0)
				.pressKeys('onetwothree')
					.end()
				.findByXpath('id("todo-list")/LI[3]/DIV[1]/INPUT[1]')
					.moveMouseTo(17, 20)
					.clickMouseButton(0)
					.end()
				.findByXpath('id("todo-list")/LI[2]/DIV[1]/INPUT[1]')
					.moveMouseTo(19, 23)
					.clickMouseButton(0)
					.end()
				.findByXpath('id("clear-completed")')
					.moveMouseTo(42.171875, 7)
					.clickMouseButton(0);
		});
	});
});
