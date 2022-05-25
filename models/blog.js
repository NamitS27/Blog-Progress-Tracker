var mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

let blogSchema = mongoose.Schema(
    {
        title: {
            type: String,
        },
        type: {
            type: String,
        }
    },
    { timestamps: true, versionKey: false }
);

blogSchema.plugin(autoIncrement.plugin, "Blog");

module.exports = mongoose.model("Blog", blogSchema);
