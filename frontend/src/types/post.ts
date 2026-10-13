export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export type PostContentBlock =
  | { type: 'text'; text: string }
  | { type: 'media'; url?: string; urls?: string[] };

export function getPostBlockMediaUrls(block: Extract<PostContentBlock, { type: 'media' }>): string[] {
  if (block.urls?.length) return block.urls;
  return block.url ? [block.url] : [];
}

export interface Post {
  id: string;
  title: string;
  date: string;
  author: string;
  content: string;
  likes: number;
  reposts?: number;
  comments_count: number;
  comments: Comment[];
  imageUrl?: string;
  mediaUrls?: string[];
  contentBlocks?: PostContentBlock[];
  isLiked?: boolean;
  isReposted?: boolean;
}

export function getPostContentBlocks(post: Pick<Post, 'content' | 'contentBlocks' | 'imageUrl' | 'mediaUrls'>): PostContentBlock[] {
  if (post.contentBlocks?.length) return post.contentBlocks;

  const blocks: PostContentBlock[] = [];
  if (post.content) blocks.push({ type: 'text', text: post.content });
  const media = post.mediaUrls?.length ? post.mediaUrls : post.imageUrl ? [post.imageUrl] : [];
  media.forEach((url) => blocks.push({ type: 'media', url }));
  return blocks;
}
