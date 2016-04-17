var getElementXPath = function (element, ignoreId) {
	var path = [];

	do {
		if (element.id && !ignoreId) {
			path.unshift('id("' + element.id + '")');

			// No need to continue to ascend since we found a unique root
			break;
		}
		else if (element.parentNode) {
			var nodeName = element.nodeName;
			var hasNamedSiblings = Boolean(element.previousElementSibling || element.nextElementSibling);
			// XPath is 1-indexed
			var index = 1;
			var sibling = element;

			if (hasNamedSiblings) {
				while ((sibling = sibling.previousElementSibling)) {
					if (sibling.nodeName === nodeName) {
						++index;
					}
				}

				path.unshift(nodeName + '[' + index + ']');
			}
			else {
				path.unshift(nodeName);
			}
		}
		// The root node
		else {
			path.unshift('');
		}
	} while ((element = element.parentNode));

	return path.join('/');
};

// Override for adding event listeners
var oldAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(eventName, eventHandler)
{
	console.info('register', eventName, 'on', this, getElementXPath(this));
	oldAddEventListener.call(this, eventName, function(event) {
		console.info('->', eventName, event.keyCode && String.fromCodePoint(event.keyCode),
		             'on', getElementXPath(event.target), eventHandler);
		eventHandler(event);
	});
};
