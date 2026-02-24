import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Image, FileText, Trash2, GripVertical } from 'lucide-react';

interface StoryBlock {
    id: string;
    title: string;
    content: string;
    images: string[];
}


export function AdditionalInformation() {
    const [storyBlocks, setStoryBlocks] = React.useState<StoryBlock[]>([
        { id: '1', title: '', content: '', images: [] }
    ]);

    const addStoryBlock = () => {
        const newBlock: StoryBlock = {
            id: Date.now().toString(),
            title: '',
            content: '',
            images: []
        };
        setStoryBlocks(prev => [...prev, newBlock]);
    };

    const removeStoryBlock = (id: string) => {
        setStoryBlocks(prev => prev.filter(block => block.id !== id));
    };

    const updateStoryBlock = (id: string, updates: Partial<StoryBlock>) => {
        setStoryBlocks(prev =>
            prev.map(block => (block.id === id ? { ...block, ...updates } : block))
        );
    };

    const handleImageUpload = (blockId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            // In a real implementation, you would upload the files and get URLs
            // For now, we'll create object URLs for preview
            const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
            const block = storyBlocks.find(b => b.id === blockId);
            if (block) {
                updateStoryBlock(blockId, {
                    images: [...block.images, ...imageUrls]
                });
            }
        }
    };

    const removeImage = (blockId: string, imageIndex: number) => {
        const block = storyBlocks.find(b => b.id === blockId);
        if (block) {
            updateStoryBlock(blockId, {
                images: block.images.filter((_, idx) => idx !== imageIndex)
            });
        }
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Stories & Media</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Add compelling stories, images, and supporting documentation for your project
                            </p>
                        </div>
                        <Button onClick={addStoryBlock} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Story Block
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {storyBlocks.map((block, index) => (
                <Card key={block.id} className="shadow-card">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                                <CardTitle className="text-lg">Story Block {index + 1}</CardTitle>
                            </div>
                            {storyBlocks.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeStoryBlock(block.id)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor={`title-${block.id}`}>Story Title</Label>
                            <Input
                                id={`title-${block.id}`}
                                placeholder="e.g., Community Impact Story"
                                value={block.title}
                                onChange={(e) => updateStoryBlock(block.id, { title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`content-${block.id}`}>Story Content</Label>
                            <Textarea
                                id={`content-${block.id}`}
                                placeholder="Tell your story here... Describe the impact, challenges overcome, people involved, and outcomes achieved."
                                className="min-h-[200px]"
                                value={block.content}
                                onChange={(e) => updateStoryBlock(block.id, { content: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                {block.content.length} characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Images & Media</Label>
                            <div className="border-2 border-dashed border-border rounded-lg p-6">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Image className="w-8 h-8 text-muted-foreground" />
                                    <div className="text-center">
                                        <label
                                            htmlFor={`image-upload-${block.id}`}
                                            className="text-sm text-primary hover:underline cursor-pointer"
                                        >
                                            Click to upload
                                        </label>
                                        <span className="text-sm text-muted-foreground"> or drag and drop</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        PNG, JPG, GIF up to 10MB
                                    </p>
                                    <input
                                        id={`image-upload-${block.id}`}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(block.id, e)}
                                    />
                                </div>
                            </div>

                            {block.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                    {block.images.map((image, imgIdx) => (
                                        <div key={imgIdx} className="relative group">
                                            <img
                                                src={image}
                                                alt={`Story ${index + 1} - Image ${imgIdx + 1}`}
                                                className="w-full h-40 object-cover rounded-lg"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeImage(block.id, imgIdx)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-2 border-t">
                            <div className="space-y-2">
                                <Label htmlFor={`documents-${block.id}`}>Supporting Documents</Label>
                                <div className="border border-border rounded-lg p-4 text-center">
                                    <FileText className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                                    <label
                                        htmlFor={`documents-${block.id}`}
                                        className="text-sm text-primary hover:underline cursor-pointer"
                                    >
                                        Upload PDFs, Reports, or Documents
                                    </label>
                                    <input
                                        id={`documents-${block.id}`}
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        multiple
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <div className="flex justify-center">
                <Button onClick={addStoryBlock} variant="outline" size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Story Block
                </Button>
            </div>
        </div>
    );
}
