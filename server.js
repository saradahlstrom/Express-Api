import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import blogData from './data/blogposts.json' assert { type: 'json' };


dotenv.config();

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/projectMongo';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

const blogPostSchema = new mongoose.Schema({
  id: Number,
  date: String,
  title: String,
  content: String,
  author: String,
  commentsCount: Number,
  likes: Number,
  category: String,
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

if (process.env.RESET_DB) {
  const seedDatabase = async () => {
    await BlogPost.deleteMany({});
    blogData.forEach((item) => new BlogPost(item).save());
    console.log('Database seeded');
  };
  seedDatabase();
}

// Root Endpoint: Provides API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Blog API',
    availableEndpoints: [
      { method: 'GET', path: '/api/blogposts', description: 'Lists all blog posts' },
      { method: 'GET', path: '/api/blogposts/:id', description: 'Gets a single blog post by ID' },
      { method: 'GET', path: '/api/blogposts/category/:category', description: 'Gets blog posts by category' },
    ],
  });
});

// Endpoint to list all blog posts
app.get('/api/blogposts', async (req, res) => {
  const blogPosts = await BlogPost.find();
  res.json(blogPosts);
});

// Endpoint to get a single blog post by ID
app.get('/api/blogposts/:id', async (req, res) => {
  const blogPost = await BlogPost.findOne({ id: req.params.id });
  if (blogPost) {
    res.json(blogPost);
  } else {
    res.status(404).json({ error: 'Blog post not found' });
  }
});

// Endpoint to get blog posts by category
app.get('/api/blogposts/category/:category', async (req, res) => {
  const { category } = req.params;
  const blogPosts = await BlogPost.find({ category: category });
  if (blogPost) {
    res.json(blogPosts);
  } else {
    res.status(404).json({ error: 'No blog posts found in this category' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
