'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { suggestHashtags } from '@/ai/flows/suggest-hashtags';
import { addPost } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

const postSchema = z.object({
  text: z.string().min(1, 'Mood cannot be empty.').max(500, 'Mood is too long.'),
  hashtags: z.string().optional(),
});

export async function createPost(prevState: any, formData: FormData) {
  const validatedFields = postSchema.safeParse({
    text: formData.get('text'),
    hashtags: formData.get('hashtags'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { text, hashtags } = validatedFields.data;
  const image = formData.get('image') as File;
  let imageUrl: string | undefined;

  if (image && image.size > 0) {
    if (image.size > 4 * 1024 * 1024) { // 4MB limit
      return { errors: { image: ['Image size must be less than 4MB.'] } };
    }

    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const uniqueFilename = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
      const imagePath = path.join(uploadDir, uniqueFilename);
      const buffer = Buffer.from(await image.arrayBuffer());
      await fs.writeFile(imagePath, buffer);
      imageUrl = `/uploads/${uniqueFilename}`;
    } catch (error) {
        console.error('File upload failed:', error);
        return { error: 'Failed to upload image.' };
    }
  }

  const selectedHashtags = hashtags ? hashtags.split(',').filter(h => h) : [];

  try {
    await addPost({ text, imageUrl, hashtags: selectedHashtags });
    revalidatePath('/');
    return { success: true, message: 'Vibe posted!' };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create post.' };
  }
}


export async function getHashtagSuggestions(text: string): Promise<{ hashtags: string[] }> {
  if (!text.trim()) {
    return { hashtags: [] };
  }
  try {
    const result = await suggestHashtags({ text });
    return result;
  } catch (error) {
    console.error('Error getting hashtag suggestions:', error);
    return { hashtags: [] };
  }
}
