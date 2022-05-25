var mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let userSchema = mongoose.Schema(
    {
        name: {
            type: String,
        },
        email: {
            type: String,
            require: true,
            unique: true,
        },
        password: {
            type: String,
            require: true,
        },
    },
    { timestamps: true, versionKey: false }
);

userSchema.plugin(autoIncrement.plugin, "User");

userSchema.pre("save", function (next) {
    const user = this;

    if (!user.isModified("password")) return next();

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateJWT = function () {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 1);

    let payload = {
        id: this._id,
    };

    return jwt.sign(payload, process.env.ADMIN_ACCESS_KEY, {
        expiresIn: parseInt(expirationDate.getTime() / 1000, 10),
    });
};

userSchema.methods.sanitize = function () {
    var user = this;
    user = user.toObject();

    delete user.password;
    delete user.createdAt;
    delete user.updatedAt;

    return user;
};

module.exports = mongoose.model("User", userSchema);
