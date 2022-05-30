const Content = require('../models/content');
const Blog = require('../models/blog');
const UserBlogRelation = require('../models/userBlogRelation');
const UserContentRelation = require('../models/userContentRelation');
const { cacheSimulator, addToCache, getCache } = require('../utils/cacheSimulator');
const { default: mongoose } = require('mongoose');

exports.createBlog = async (req, res) => {
	const { title, type, contentDetails } = req.body;

	try {
		let blog = new Blog({
			title: title,
			type: type,
		});
		/**
		 * Based on the content details provided, content is created
		 * and added to the blog along with the weightage/importance factor.
		 */
		for(let i = 0; i < contentDetails.length; i++) {
			let eachContentDetails = contentDetails[i];
			let content = await Content.create({
				type: eachContentDetails.type,
				attributes: eachContentDetails.attributes
			});
			blog.content.push({
				id: content.id,
				importanceFactor: eachContentDetails.importanceFactor,
			});
		}
		blog = await blog.save();

		return res.status(201).json({
			status: 201,
			blogId: blog.id,
			message: 'Blog created successfully',
		});
	} catch (err) {
		console.error(err);
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
		/**
		 * Based on the value of isOpen, the user is either opening or closing the blog.
		 * If the user is opening the blog, the openTime is updated.
		 * If the user is closing the blog, the closeTime is updated.
		 */
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
		console.error(err);
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
		if (userBlogRelation) {
			const openTime = userBlogRelation.openTime;
			const closeTime = userBlogRelation.closeTime;

			/**
			 * Calculating the time spent on the blog by the user using all the time logs.
			 * If the user has not closed the blog, the time spent is the time since the user opened the blog.
			 */
			let timeSpent = openTime.reduce((acc, curr, idx) =>  acc + (closeTime[idx] - curr), 0);

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
		console.error(err);
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
			/**
			 * Indexing on userId and contentId to find the userContentRelation will
			 * increase the performance of the query.
			 */
			let userContentRelation = await UserContentRelation.findOneAndUpdate(
				{
					user: userId,
					content: eachContentDetails.id,
				},
				{
					$set: {
						userAttributes: eachContentDetails.userAttributes
					}
				},
				{ upsert: true, new: true }
			).populate('content');

			let content = userContentRelation.content;

			/**
			 * tracking the progress of the each content of the blog based on the attributes of the content
			 * and the actions performed by the user.
			 */
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
						(eachContentDetails.userAttributes.checkedItems.length() / content.attributes.items.length()) * 100
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
		console.error(err);
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

		let totalProgress = getCache(`blogProgress-${blogId}`);
		if (totalProgress) {
			return res.status(200).json({
				status: 200,
				totalProgress: totalProgress,
				isCached: true,
			});
		}
		totalProgress = 0;
		let totalImportance = 0;

		let blog = await Blog.findById(blogId);
		if (!blog) {
			return res.status(204).json({
				status: 204,
				message: 'Specified blog not found',
			});
		}

		/**
		 * Calculating the progress of the blog based on the progress of each content
		 * through the method of weighted average.
		 */
		for(let i = 0; i < blog.content.length; i++) {
			let content = blog.content[i];
			let userContentRelation = await UserContentRelation.findOne({
				user: userId,
				content: mongoose.Types.ObjectId(content.id),
			});
			totalProgress += (userContentRelation.progress * content.importanceFactor);
			totalImportance += content.importanceFactor;
		}
		totalProgress = totalProgress / totalImportance;

		addToCache(`blogProgress-${blogId}`, totalProgress);
		return res.status(200).json({
			status: 200,
			totalProgress: totalProgress,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			status: 500,
			message: 'Something went wrong!',
		});
	}
};