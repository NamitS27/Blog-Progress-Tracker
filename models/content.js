var mongoose = require("mongoose");

let contentSchema = mongoose.Schema(
    {
        type: String,
        attributes: JSON, // attributes of the content like title, description, duration, item list etc.
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Content", contentSchema);
