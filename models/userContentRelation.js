var mongoose = require('mongoose');

let userContentRelationSchema = mongoose.Schema(
	{
		user: { // FK to user
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			require: true,
		},
		content: { // FK to content
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Content',
			require: true,
		},
		/*
		user attributes consists of the information of the
		action performed by the user on the content
		*/
        userAttributes: {
            type: JSON
        },
        progress: {
            type: Number,
            default: 0,
            max: 100,
        }
	},
	{ timestamps: true, versionKey: false }
);

module.exports = mongoose.model('UserContentRelation', userContentRelationSchema);
