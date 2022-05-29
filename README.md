# Blog Progress Tracker

<p>
    <a style="text-decoration:none">
        <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white">
    </a>
    <a style="text-decoration:none">
        <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
    </a>
    <a style="text-decoration:none">
        <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white">
    </a>
    <a style="text-decoration:none">
        <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge">
    </a>
<p>

Blog progress tracker tracks the progress of a blog for a particular user based on the progress of different content types present inside the blog.

## Table of Contents
- [Overview](#overview)
- [Architechture and APIs](#architechture-and-apis)
- [Installation and Running](#installation-and-running)


## Overview

The task consists of mainly three different entities:

- User
- Blog
- Content

Here blog can contain different types of content like _video_, _image_, _pdf_, _checklist_ and many more. For a particular user, the progress of the blog is tracked based on the progress of the individual content which is again tracked based on the user activity inside the blog.

## Architechture and APIs

The following image shows the flow of how the progress of the blog is tracked based on the content present inside the blog.

![](/images/Overview.png)

The API endpoints for the project that allows the user to interact with the blog are as follows:

- `sign-up`

Registers the user based on the email id and the password provided.

- `login`

Based on the email id and the password provided, the user is logged in.

- `create-blog`

Creates a blog based on details like title and the type of the blog.

- `update-blog`

Updates the blog title as well as adds / updates the content present inside the blog.

- `log-time`

Logs the time spent on the blog by the particular user.

- `time-spent/:blogId`

Fetches the time spent by the user for a particular blog.

- `track-content-progress`

Track the progress of a specific content inside the blog based on the attributes of the content and the user attirbutes performed on that specific content.

- `blog-progress/:blogId`

Computes the progress of the blog based on the progress of the individual content.


## Installation and Running

Before installing the dependencies, following technical requirements must be met:
-   Node.js version v12.18.0 or higher. Visit [here](https://nodejs.org/en/download/) for installation instructions.
-   NPM version v6.14.4 or higher. Visit [here](https://www.npmjs.com/get-npm) for installation instructions.
-   Postman for API testing and documentation. Visit [here](https://www.postman.com/downloads/) for downloading postman.
-   Mongo DB for the database. Visit [here](https://www.mongodb.com/try/download/community) for downloading.

The first step is to install the dependencies required to run the node application.
```bash
npm install
```

The next step is to run the node application.
```bash
npm start #non-dev mode
npm run dev #dev mode
```

> Before running the application, make sure to create a `.env` file which should contains the following details:
```bash
DBUSER=xxxxx # MongoDB database username
PASSWORD=xxxxx # MongDB database password
DBNAME=xxxxx # MongoDB database name
JWT_SECRET_KEY=xxxxx # JWT secret key
```