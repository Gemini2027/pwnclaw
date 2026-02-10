import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  author: string;
  tags: string[];
  readingTime: string;
  content: string;
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  
  return files
    .map(file => getPost(file.replace('.md', '')))
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const stats = readingTime(content);
  
  // V12: Validate date format
  const rawDate = data.date || '2026-01-01';
  const date = isNaN(Date.parse(rawDate)) ? '2026-01-01' : rawDate;

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    date,
    updated: data.updated,
    author: data.author || 'PwnClaw',
    tags: data.tags || [],
    readingTime: stats.text,
    content,
  };
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = new Set<string>();
  posts.forEach(p => p.tags.forEach(t => tags.add(t)));
  return Array.from(tags).sort();
}
