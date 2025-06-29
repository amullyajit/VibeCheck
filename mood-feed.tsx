import type { Post } from '@/lib/types';
import MoodPostCard from './mood-post-card';

interface MoodFeedProps {
  posts: Post[];
}

export default function MoodFeed({ posts }: MoodFeedProps) {
  return (
    <div className="space-y-6">
      {posts.length > 0 ? (
        posts.map((post) => <MoodPostCard key={post.id} post={post} />)
      ) : (
        <div className="text-center text-muted-foreground py-16 px-4 border-2 border-dashed rounded-lg">
          <h3 className="font-headline text-lg">The feed is quiet...</h3>
          <p className="font-body">Be the first to share a vibe!</p>
        </div>
      )}
    </div>
  );
}
