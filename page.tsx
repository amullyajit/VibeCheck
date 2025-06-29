import { getPosts } from '@/lib/db';
import PostForm from '@/components/post-form';
import MoodFeed from '@/components/mood-feed';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <h1 className="font-headline text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>VibeCheck</h1>
        </div>
      </header>
      <main className="container mx-auto flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-2xl">
          <section id="create-post" className="mb-8">
            <PostForm />
          </section>
          <section id="feed">
            <MoodFeed posts={posts} />
          </section>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Built with ❤️ for sharing vibes.</p>
      </footer>
    </div>
  );
}
