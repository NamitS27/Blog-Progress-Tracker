var mongoose = require('mongoose');

let userBlogRelationSchema = mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			require: true,
		},
		blog: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Blog',
			require: true,
		},
		openTime: [
			{
				type: Date,
				default: Date.now,
			}
		],
		closeTime: [
			{
				type: Date,
				default: Date.now,
			}
		],
	},
	{ timestamps: true, versionKey: false }
);

module.exports = mongoose.model('UserBlogRelation', userBlogRelationSchema);
