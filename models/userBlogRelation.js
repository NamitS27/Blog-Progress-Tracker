var mongoose = require('mongoose');

let userBlogRelationSchema = mongoose.Schema(
	{
		user: { // FK to user
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			require: true,
		},
		blog: { // FK to blog
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Blog',
			require: true,
		},
		// openTime and closeTime stores the open and close time of the blog evertime the user opens / closes the blog
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
