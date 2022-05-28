const Content = require('../models/content');
const Blog = require('../models/blog');
const UserBlogRelation = require('../models/userBlogRelation');
const UserContentRelation = require('../models/userContentRelation');
const mongoose = require('mongoose');

exports.createBlog = async (req, res) => {
	const { title, type } = req.body;

	try {
		let blog = new Blog({
			title: title,
			type: type,
		});
		blog = await blog.save();

		return res.status(201).json({
			status: 201,
			blogId: blog.id,
			message: 'Blog created successfully',
		});
	} catch (err) {
		return res.status(500).json({
			status: 500,
			message: 'Internal server error',
		});
	}
};

exports.updateBlog = async (req, res) => {
	const { blogId, title, contentDetails } = req.body;
	try {
		let blog = await Blog.findById(blogId);
		if (!blog) {
			return res.status(404).json({
				status: 404,
				message: 'Blog not found',
			});
		}

		blog.title = title;
		contentDetails.forEach(async (eachContentDetails) => {
			if (eachContentDetails.operation === 'create') {
				let content = await Content.create({
					type: eachContentDetails.type,
					attributes: eachContentDetails.attributes,
				});
				blog.content.push(mongoose.Types.ObjectId(content.id));
			} else if (eachContentDetails.operation === 'update') {
				let content = await Content.findById(eachContentDetails.id);
				content.attributes = eachContentDetails.attributes;
				await content.save();
			}
		});
		await blog.save();
		// blog = await blog.save();

		return res.status(200).json({
			status: 200,
			message: 'Blog updated successfully',
		});
	} catch (err) {
		return res.status(500).json({
			status: 500,
			message: 'Internal server error',
		});
	}
};

exports.logTime = async (req, res) => {
	const { blogId, isOpen } = req.body;
	const { id: userId } = req.user;
	let message, status;

	try {
		await UserBlogRelation.findOneAndUpdate(
			{ user: userId, blog: blogId },
			{
				$push: {
					[isOpen ? 'openTime' : 'closeTime']: Date.now(),
				},
			},
			{ upsert: true }
		);

		message = 'Time updated successfully';
		status = 200;
		return res.status(status).json({
			message: message,
			status: status,
		});
	} catch (err) {
		message = 'Time update unsuccesfull due to some error!';
		status = 500;
		return res.status(status).json({
			message: message,
			status: status,
		});
	}
};

exports.timeSpent = async (req, res) => {
	try {
		const { blogId } = req.params;
		const { id: userId } = req.user;
		const userBlogRelation = await UserBlogRelation.findOne({ user: userId, blog: blogId });
		let timeSpent = 0;
		if (userBlogRelation) {
			const openTime = userBlogRelation.openTime;
			const closeTime = userBlogRelation.closeTime;

			for (let i = 0; i < openTime.length; i++) {
				if (closeTime[i] && openTime[i] && closeTime[i] > openTime[i]) {
					// time spent for each blog in seconds
					timeSpent += (closeTime[i] - openTime[i]) / 1000;
				}
			}
			return res.status(200).json({
				timeSpent: timeSpent,
				status: 200,
			});
		}
		return res.status(204).json({
			status: 204,
			message: 'No time spent for this blog',
		});
	} catch (err) {
		return res.status(500).json({
			status: 500,
			message: 'Time spent unsuccesfull due to some error!',
		});
	}
};

exports.trackContentProgress = async (req, res) => {
	try {
		const { contentDetails } = req.body;
		const { id: userId } = req.user;

		contentDetails.forEach(async (eachContentDetails) => {
			let conditionData = {
				user: userId,
				content: eachContentDetails.id,
			}
			let userContentRelation = await UserContentRelation.findOneAndUpdate(
				conditionData,
				{
					$set: {
						userAttributes: eachContentDetails.userAttributes
					}
				},
				{ upsert: true, new: true }
			).populate('content');

			let content = userContentRelation.content;

			switch (content.type) {
				case 'video':
					userContentRelation.progress = Math.max(
						userContentRelation.progress,
						(eachContentDetails.userAttributes.currentTime / content.attributes.duration) * 100
					);
					break;

				case 'pdf':
					userContentRelation.progress = Math.max(
						userContentRelation.progress,
						(eachContentDetails.userAttributes.pagesRead / content.attributes.totalPages) * 100
					);
					break;

				case 'image':
					userContentRelation.progress = Math.max(
						userContentRelation.progress,
						eachContentDetails.userAttributes.isOpened * 100
					);
					break;

				case 'checklist':
					userContentRelation.progress = Math.max(
						userContentRelation.progress,
						(eachContentDetails.userAttributes.checkedItems / content.attributes.totalItems.length()) * 100
					);
					break;

				default:
					return res.status(500).json({
						status: 500,
						message: 'Please specify content type',
					});
			}
			await userContentRelation.save();
		});

		return res.status(200).json({
			status: 200,
			message: 'Progress updated successfully',
		});
	} catch (err) {
		return res.status(500).json({
			status: 500,
			message: 'Something went wrong!',
		});
	}
};

exports.fetchBlogProgress = async (req, res) => {
	try {
		const { blogId } = req.params;
		const { id: userId } = req.user;

		let blog = await Blog.findById(blogId);
		if (!blog) {
			return res.status(204).json({
				status: 204,
				message: 'Specified blog not found',
			});
		}
		let totalContent = blog.content.length;
		let totalProgress = 0;

		let contentProgress = await UserContentRelation.find({
			user: userId,
			content: { $in: blog.content },
		}).populate('content');
		contentProgress.forEach((content) => {
			totalProgress += content.progress;
		});
		totalProgress = totalProgress / totalContent;
		return res.status(200).json({
			status: 200,
			totalProgress: totalProgress,
		});
	} catch (err) {
		return res.status(500).json({
			status: 500,
			message: 'Something went wrong!',
		});
	}
};
