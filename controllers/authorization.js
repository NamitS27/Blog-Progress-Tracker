const User = require("../models/user");

exports.signUp = async (req, res) => {
    let message, status, data;

    try {
        const user = new User(req.body);
        let newUser = await user.save();
        let token = newUser.generateJWT();

        newUser = newUser.sanitize();

        data = {
            token: token,
            user: newUser,
        };
        message = "User registered successfully";
        status = 200;
        return res.status(status).json({
            data: data,
            message: message,
            status: status,
        });
    } catch (err) {
        message = "User registeration unsuccesfull due to some error!";
        status = 500;
        console.error(err);
        // To check if the same email is already registered
        if (err.name === "MongoError" && err.code === 11000) {
            message = `${req.body.email} is already in use!`;
            status = 403;
        }

        return res.status(status).json({
            message: message,
            status: status,
        });
    }
};

exports.login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    let message, status, data;

    try {
        let user = await adminUser.findOne({ email: email });
        if (!user) {
            message = `The email address ${email} is not associated with any account. Double-check your email address and try again`;
            status = 401;
            return res.status(status).json({
                message: message,
                status: status,
            });
        }

        if (!user.comparePassword(password)) {
            message = "Invalid email or password";
            status = 401;
            return res.status(status).json({
                message: message,
                status: status,
            });
        }

        let token = user.generateJWT();
        user = user.sanitize();

        data = {
            token: token,
            user: user,
        };
        message = "User logged in successfully";
        status = 200;
        return res.status(status).json({
            data: data,
            message: message,
            status: status,
        });
    } catch (err) {
        console.error(err);
        message = "User login unsuccesfull due to some error!";
        status = 500;
        return res.status(status).json({
            message: message,
            status: status,
        });
    }
};