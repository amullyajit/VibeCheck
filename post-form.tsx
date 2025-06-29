'use client';

import { useEffect, useRef, useState, useTransition, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createPost, getHashtagSuggestions } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Loader2, Send, X, Sparkles } from 'lucide-react';
import Image from 'next/image';

const initialState = {
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      Post Vibe
    </Button>
  );
}

export default function PostForm() {
  const [formState, formAction] = useActionState(createPost, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (newText.trim().length > 10) {
        startSuggestionTransition(async () => {
          const { hashtags } = await getHashtagSuggestions(newText);
          setSuggestedHashtags(hashtags.filter(h => !selectedHashtags.includes(h)));
        });
      } else {
        setSuggestedHashtags([]);
      }
    }, 500);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if(formRef.current) {
      const fileInput = formRef.current.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setSuggestedHashtags(prev => prev.filter(t => t !== tag));
  };

  useEffect(() => {
    if (formState.success) {
      formRef.current?.reset();
      setText('');
      setImagePreview(null);
      setSelectedHashtags([]);
      setSuggestedHashtags([]);
    }
  }, [formState]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Share Your Vibe</CardTitle>
      </CardHeader>
      <form ref={formRef} action={formAction}>
        <CardContent className="space-y-4">
          <Textarea
            name="text"
            placeholder="What's on your mind?"
            value={text}
            onChange={handleTextChange}
            rows={4}
            required
            className="font-body"
          />
          {formState?.errors?.text && <p className="text-sm text-destructive">{formState.errors.text[0]}</p>}
          
          <Input id="image-upload" name="image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          
          {imagePreview && (
            <div className="relative w-32 h-32">
              <Image src={imagePreview} alt="Image preview" fill className="rounded-md object-cover" />
              <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={removeImage}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {(suggestedHashtags.length > 0 || isSuggesting) && <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Sparkles className="w-4 h-4" style={{color: 'hsl(var(--primary))'}} /> AI Suggestions</label>}
            {isSuggesting && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
            <div className="flex flex-wrap gap-2">
              {suggestedHashtags.map(tag => (
                <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => toggleHashtag(tag)}>{tag}</Badge>
              ))}
            </div>
          </div>
          
          {selectedHashtags.length > 0 &&
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Selected Hashtags</label>
              <div className="flex flex-wrap gap-2">
                {selectedHashtags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => toggleHashtag(tag)}>
                    {tag}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          }
          <input type="hidden" name="hashtags" value={selectedHashtags.join(',')} />

        </CardContent>
        <CardFooter className="flex justify-between items-center">
            <Button type="button" variant="outline" size="icon" asChild>
                <label htmlFor="image-upload" className="cursor-pointer">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="sr-only">Upload image</span>
                </label>
            </Button>
            <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
