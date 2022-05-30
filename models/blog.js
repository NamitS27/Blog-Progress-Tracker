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
                id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Content"
                },
                // The importance factor is the weightage given to the content based on the information of the content
                importanceFactor: {
                    type: Number,
                    default: 1,
                    max: 5,
                },
            }
        ]
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Blog", blogSchema);
