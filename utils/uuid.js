export const createUUID = () => {
	// Generate random hexadecimal digits
	var digits = "0123456789abcdef";
	var n = digits.length;

	// Generate random hexadecimal digits and concatenate them to form the UUID
	var uuid = "";
	for (var i = 0; i < 32; i++) {
		uuid += digits[Math.floor(Math.random() * n)];
	}

	// Add hyphens to the UUID to separate it into groups
	uuid =
		uuid.substr(0, 8) +
		"-" +
		uuid.substr(8, 4) +
		"-" +
		uuid.substr(12, 4) +
		"-" +
		uuid.substr(16, 4) +
		"-" +
		uuid.substr(20, 12);

	return uuid;
};
