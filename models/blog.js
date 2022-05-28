var mongoose = require("mongoose");

let blogSchema = mongoose.Schema(
    {
        title: {
            type: String,
        },
        type: {
            type: String,
        },
        content: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Content"
            }
        ]
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Blog", blogSchema);
