var mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

let userBlogRelationSchema = mongoose.Schema(
	{
		userId: {
			type: Number,
			ref: 'User',
			require: true,
		},
		blogId: {
			type: Number,
			ref: 'Blog',
			require: true,
		},
		lastOpenTime: [
			{
				type: Date,
				default: Date.now,
			},
		],
		lastCloseTime: [
			{
				type: Date,
				default: Date.now,
			},
		],
		totalProgess: {
			type: Number,
			default: 0,
			max: 100,
		},
		progress: [
			{
				contentType: String,
				progress: {
					type: Number,
					default: 0,
					max: 100,
				},
				attributes: JSON,
			},
		],
	},
	{ timestamps: true, versionKey: false }
);

userBlogRelationSchema.plugin(autoIncrement.plugin, 'UserBlogRelation');

module.exports = mongoose.model('UserBlogRelation', userBlogRelationSchema);
