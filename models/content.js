var mongoose = require("mongoose");

let contentSchema = mongoose.Schema(
    {
        type: String,
        attributes: JSON,
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Content", contentSchema);
