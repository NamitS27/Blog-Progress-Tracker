var mongoose = require('mongoose');

let userContentRelationSchema = mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			require: true,
		},
		content: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Content',
			require: true,
		},
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
