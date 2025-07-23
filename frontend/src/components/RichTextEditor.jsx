import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Link, Link2Off, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const MenuBar = ({ editor, onSave, isSaving }) => {
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);

    useEffect(() => {
        if (editor) {
            setLinkUrl(editor.getAttributes('link').href || '');
        }
    }, [editor]);

    const setLink = useCallback(() => {
        if (linkUrl === null) {
            return;
        }

        if (linkUrl === '') {
            editor.chain().focus().unsetLink().run();
            return;
        }

        editor.chain().focus().setLink({ href: linkUrl }).run();
        setShowLinkInput(false);
    }, [editor, linkUrl]);

    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2 p-2 border-b rounded-t-xl">
            <Toggle
                size="sm"
                pressed={editor.isActive('bold')}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('italic')}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('strike')}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('code')}
                onPressedChange={() => editor.chain().focus().toggleCode().run()}
            >
                <Code className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('bulletList')}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('orderedList')}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>
            <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
                <PopoverTrigger asChild>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('link')}
                        onPressedChange={() => {
                            if (editor.isActive('link')) {
                                editor.chain().focus().unsetLink().run();
                            } else {
                                setShowLinkInput(true);
                            }
                        }}
                    >
                        {editor.isActive('link') ? <Link2Off className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                    </Toggle>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Link</h4>
                            <p className="text-sm text-muted-foreground">
                                Set the link URL.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="link">URL</Label>
                            <Input
                                id="link"
                                defaultValue={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && setLink()}
                            />
                            <Button size="sm" onClick={setLink}>Apply</Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            <Button onClick={onSave} disabled={isSaving} className="ml-auto rounded-xl">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
            </Button>
        </div>
    );
};

export default function RichTextEditor({
    content,
    onContentChange,
    onSave,
    isSaving,
    onBlur,
}) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            
            
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onContentChange(editor.getHTML());
        },
        onBlur: () => {
            onBlur();
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none p-4',
            },
        },
    });

    useEffect(() => {
        
        
        if (editor && editor.getHTML() !== content && !isSaving) {
            editor.commands.setContent(content, false);
        }
    }, [content, editor, isSaving]);

    return (
        <div className="border rounded-xl overflow-hidden">
            <MenuBar editor={editor} onSave={onSave} isSaving={isSaving} />
            <EditorContent editor={editor} className="h-[300px] overflow-y-auto" />
        </div>
    );
}