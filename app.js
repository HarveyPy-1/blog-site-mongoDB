const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

require("dotenv").config();

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
	useNewUrlParser: true,
});

// Define BlogPost Schema
const blogPostSchema = {
	name: {
		type: String,
		required: true,
	},
	postContent: {
		type: String,
		required: true,
	},
};

// Create Model (collection) based on the defined Schema above
const BlogPost = mongoose.model("BlogPost", blogPostSchema);

// Default item to be added, if there's no post
const welcomeContent = new BlogPost({
	name: "Welcome To Your Blog",
	postContent:
		"Step into a world of captivating stories, insightful knowledge, and thought-provoking ideas. We're your go-to source for diverse content crafted to entertain, enlighten, and engage. Our mission is to curate articles that cater to your interests and curiosities, offering something for everyone. Join our vibrant community, share your thoughts, and be a part of the conversation. At Harvey's Blog, we're excited to guide you through a journey of discovery and exploration in the world of blogging.",
});

// Add items to the database
async function showWelcomeContent() {
	try {
		await welcomeContent.save();
	} catch (error) {
		console.error(error);
	}
}

let allPosts;
app.get("/", async (req, res) => {
	// Find all the items in the database and display on the homepage. If none, add welcomeContent and display it
	async function loadItems() {
		allPosts = await BlogPost.find();

		if (allPosts.length === 0) {
			try {
				await showWelcomeContent();
			} catch (err) {
				console.error(err);
			}
		}

		console.log("Items loaded successfully...");
	}

	await loadItems();

	res.render("home", { allPosts: allPosts });
});

app.get("/about", (req, res) => {
	res.render("about");
});

app.get("/contact", (req, res) => {
	res.render("contact");
});

app.get("/compose", (req, res) => {
	let value = "";
	res.render("compose", { value });
});

app.post("/compose", (req, res) => {
	const postTitle = req.body.blogName;

	const postBody = req.body.blogContent;

	const newBlogPost = new BlogPost({
		name: postTitle,
		postContent: postBody,
	});

	try {
		newBlogPost.save();
		console.log("New Post saved successfully...");
	} catch (error) {
		console.error(error);
	}

	res.redirect("/");
});

// Route variables. Used to generate dynamic links
app.get("/posts/:postLink", (req, res) => {
	const variableLinkID = req.params.postLink; 

	BlogPost.findOne({
		_id: variableLinkID,
	})
		.then((foundPost) => {
			if (!foundPost) {
				res.render("compose", { value: variableLinkID });
			} else {
				res.render("post", {
					postTitle: foundPost.name,
					postContent: foundPost.postContent,
				});
			}
		})
		.catch((error) => {
			console.error(error);
		});
});

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}...`);
});
