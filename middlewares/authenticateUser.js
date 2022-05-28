const jwt = require("jsonwebtoken");

// function for a middleware in order to check whether the token is okay or not so that the protected routes can be accessed
function authenticateToken(req, res, next) {
	// spliting the Authorization header into two parts as it contains Bearer + Token
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	let message, status;
	if (!token) {
		message = "Token is missing!";
		status = 401;
		return res.status(status).json({
			message: message,
			status: status,
		});
	}
	jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
		// verify the token
		if (err) {
			message = "Cannot verify the token or the token has expired!";
			status = 403;
			return res.status(status).json({
				message: message,
				status: status,
			});
		}
		req.user = user;
	});
	next(); // will make call to the function using the middleware
}

module.exports = authenticateToken;
