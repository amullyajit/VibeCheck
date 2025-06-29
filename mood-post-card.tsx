import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/lib/types';

interface MoodPostCardProps {
  post: Post;
}

export default function MoodPostCard({ post }: MoodPostCardProps) {
  return (
    <article className="animate-in fade-in-0 duration-500">
      <Card>
        <CardHeader>
          <p className="font-body text-card-foreground whitespace-pre-wrap">{post.text}</p>
        </CardHeader>
        {post.imageUrl && (
          <CardContent>
            <div data-ai-hint="mood abstract" className="relative aspect-video w-full overflow-hidden rounded-lg border">
              <Image
                src={post.imageUrl}
                alt="User uploaded image for mood post"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </CardContent>
        )}
        <CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}</span>
          </div>
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.hashtags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardFooter>
      </Card>
    </article>
  );
}
