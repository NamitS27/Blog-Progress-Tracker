const Blog = require('../models/blog');
const userBlogRelation = require('../models/userBlogRelation');

exports.createBlog = async (req, res) => {
	const { title, type } = req.body;

	try {
		let blog = new Blog({
			title: title,
			type: type,
		});
		blog = await blog.save();
		await userBlogRelation.create({
			userId: req.user.id,
			blogId: blog.id,
		});
		return res.status(200).json({
			status: 200,
			blogId: blog.id,
			message: 'Blog created successfully',
		});
	} catch (err) {
		return res.status(500).json({
			status: 500,
			message: 'Internal server error',
		});
	}
}

exports.logTime = async (req, res) => {
	const { blogId, isOpen } = req.body;
	const { id: userId } = req.user;
	let message, status;

	try {
		let userBlogRelation = await userBlogRelation.findOne({ userId: userId, blogId: blogId });
		if (!userBlogRelation) {
			userBlogRelation = new userBlogRelation({
				userId: userId,
				blogId: blogId,
			});
		}

		// assuming that each time when the blog is opened / closed, the API will be called!
		if (isOpen) {
			userBlogRelation.openTime.add(Date.now());
		} else {
			userBlogRelation.closeTime.add(Date.now());
		}
		userBlogRelation = await userBlogRelation.save();

		message = 'Time updated successfully';
		status = 200;
		return res.status(status).json({
			message: message,
			status: status,
		});
	} catch (err) {
		console.log(err);
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
		const userBlogRelations = await userBlogRelation.findOne({ userId: userId, blogId: blogId });
		let timeSpent = 0;
		if (userBlogRelations) {
			const lastOpenTime = userBlogRelations.lastOpenTime;
			const lastCloseTime = userBlogRelations.lastCloseTime;

			for (let i = 0; i < lastOpenTime.length; i++) {
				if (lastCloseTime[i] && lastOpenTime[i] && lastCloseTime[i] > lastOpenTime[i]) {
					timeSpent += lastCloseTime[i] - lastOpenTime[i];
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
		console.log(err);
		return res.status(500).json({
			status: 500,
			message: 'Time spent unsuccesfull due to some error!',
		});
	}
};

exports.trackContentProgress = async (req, res) => {
	try {
		const { blogId, contentDetails } = req.body;
		const { id: userId } = req.user;

		let userBlogRelation = await userBlogRelation.findOne({ userId: userId, blogId: blogId });
		if (!userBlogRelation) {
			return res.status(204).json({
				status: 204,
				message: 'No user-blog relation found',
			});
		}
		contentDetails.forEach((content) => {
			let contentType = content.contentType;
			switch (contentType) {
				case 'video':
					// find in array of json objects
					let video = userBlogRelation.progress.find((video) => video.id === content.id);
					if (!video) {
						video = {
							id: content.id,
							contentType: contentType,
							attributes: content.attributes
						};
						userBlogRelation.progress.push(video);
					}
					// calculate percentage based on totla duration and current time
					video.progress = max(
						video.progress,
						(content.attributes.currentTime / content.attributes.duration) * 100
					);
					break;

				case 'pdf':
					let pdf = userBlogRelation.progress.find((pdf) => pdf.id === content.id);
					if (!pdf) {
						pdf = {
							id: content.id,
							contentType: contentType,
							attributes: content.attributes
						};
						userBlogRelation.progress.push(pdf);
					}
					pdf.progress = max(
						pdf.progress,
						(content.attributes.currentPage / content.attributes.totalPages) * 100
					);

				case 'image':
					let image = userBlogRelation.progress.find((image) => image.id === content.id);
					if (!image) {
						image = {
							id: content.id,
							contentType: contentType,
							attributes: content.attributes
						};
						userBlogRelation.progress.push(image);
					}
					image.progress = max(image.progress, content.attributes.isOpened * 100);

				case 'checklist':
					let checklist = userBlogRelation.progress.find((checklist) => checklist.id === content.id);
					if (!checklist) {
						checklist = {
							id: content.id,
							contentType: contentType,
							attributes: content.attributes
						};
						userBlogRelation.progress.push(checklist);
					}
					checklist.progress = max(
						checklist.progress,
						(content.attributes.checkedItems / content.attributes.totalItems.length()) * 100
					);

				default:
					return res.status(500).json({
						status: 500,
						message: 'Please specify content type',
					});
					break;
			}
		});
		// update the overall progress
		let total_content = userBlogRelation.progress.length;
		let total_progress = 0;
		userBlogRelation.progress.forEach((content) => {
			total_progress += content.progress;
		});
		userBlogRelation.progress = max(total_progress / total_content, userBlogRelation.progress);
		await userBlogRelation.save();
		return res.status(200).json({
			status: 200,
			message: 'Progress updated successfully',
		});
	} catch (err) {
		console.log(err);
		return res.status(500).json({
			status: 500,
			message: 'Something went wrong!',
		});
	}
};
