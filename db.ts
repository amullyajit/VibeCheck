import fs from 'fs/promises';
import path from 'path';
import type { Post } from './types';

// Using src/lib/posts.json to avoid issues with write access in other directories
const postsFilePath = path.join(process.cwd(), 'src', 'lib', 'posts.json');

async function readPosts(): Promise<Post[]> {
  try {
    await fs.access(postsFilePath);
    const data = await fs.readFile(postsFilePath, 'utf-8');
    return JSON.parse(data) as Post[];
  } catch (error) {
    // If file doesn't exist or other error, return empty array
    return [];
  }
}

async function writePosts(posts: Post[]): Promise<void> {
  await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8');
}

export async function getPosts(): Promise<Post[]> {
  const posts = await readPosts();
  return posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function addPost(post: Omit<Post, 'id' | 'timestamp'>): Promise<Post> {
  const posts = await readPosts();
  const newPost: Post = {
    ...post,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };
  posts.unshift(newPost); // Add to the beginning for chronological order
  await writePosts(posts);
  return newPost;
}
