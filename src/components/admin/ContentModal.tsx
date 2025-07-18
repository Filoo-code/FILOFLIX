import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ContentItem, Episode } from "@/types/content";
import { EpisodeManager } from "./EpisodeManager";

interface ContentModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  selectedContent: ContentItem;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (episodes?: Episode[]) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (value: string) => void;
  onContentUpdate: (updatedContent: ContentItem) => void;
}

export const ContentModal = ({
  isOpen,
  isEditMode,
  selectedContent,
  isLoading,
  onClose,
  onSubmit,
  onInputChange,
  onSelectChange,
  onContentUpdate
}: ContentModalProps) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const { toast } = useToast();

  // Load episodes when editing existing series
  useEffect(() => {
    if (isEditMode && selectedContent.type === 'series' && selectedContent.id) {
      try {
        const parsedEpisodes = JSON.parse(selectedContent.video_url || '[]');
        if (Array.isArray(parsedEpisodes)) {
          // Convert old format to new format if needed
          const convertedEpisodes = parsedEpisodes.map(ep => ({
            ...ep,
            embed_code: ep.embed_code || ep.video_url || '', // Handle both old and new formats
          }));
          setEpisodes(convertedEpisodes);
        }
      } catch (error) {
        console.log('No existing episodes or invalid format');
        setEpisodes([]);
      }
    } else if (!isEditMode || selectedContent.type !== 'series') {
      setEpisodes([]);
    }
  }, [isEditMode, selectedContent.type, selectedContent.id, selectedContent.video_url]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}-${randomString}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cover-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('cover-images')
        .getPublicUrl(filePath);

      onContentUpdate({
        ...selectedContent,
        thumbnail: data.publicUrl
      });

      toast({
        title: "Success",
        description: "Image uploaded successfully!"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEpisodesChange = (newEpisodes: Episode[]) => {
    setEpisodes(newEpisodes);
  };

  const handleSubmit = () => {
    if (selectedContent.type === 'series') {
      onSubmit(episodes);
    } else {
      onSubmit();
    }
  };

  if (!isOpen) return null;

  const isSeries = selectedContent.type === 'series';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <CardTitle className="text-2xl font-bold mb-4 text-white">
          {isEditMode ? 'Edit Content' : 'Add Content'}
        </CardTitle>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="title" className="text-white">Title</Label>
            <Input 
              id="title" 
              name="title" 
              value={selectedContent.title} 
              onChange={onInputChange} 
              className="bg-gray-800 border-gray-600 text-white" 
            />
          </div>
          <div>
            <Label htmlFor="subtitle" className="text-white">Subtitle</Label>
            <Input 
              id="subtitle" 
              name="subtitle" 
              value={selectedContent.subtitle || ''} 
              onChange={onInputChange} 
              className="bg-gray-800 border-gray-600 text-white" 
              placeholder="Optional subtitle"
            />
          </div>
          <div>
            <Label htmlFor="type" className="text-white">Type</Label>
            <Select onValueChange={onSelectChange} defaultValue={selectedContent.type}>
              <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="movie" className="text-white">Movie</SelectItem>
                <SelectItem value="series" className="text-white">Series</SelectItem>
                <SelectItem value="trailer" className="text-white">Trailer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white">Cover Photo</Label>
            <div className="space-y-2">
              {selectedContent.thumbnail && (
                <div className="relative inline-block">
                  <img 
                    src={selectedContent.thumbnail} 
                    alt="Cover" 
                    className="w-32 h-48 object-cover rounded border border-gray-600"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0"
                    onClick={() => onContentUpdate({ ...selectedContent, thumbnail: null })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="bg-gray-800 border-gray-600 text-white file:bg-gray-700 file:text-white file:border-0"
                />
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
              {uploadingImage && <p className="text-sm text-gray-400">Uploading...</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="thumbnail" className="text-white">Thumbnail URL (Alternative)</Label>
            <Input 
              id="thumbnail" 
              name="thumbnail" 
              type="url" 
              value={selectedContent.thumbnail || ''} 
              onChange={onInputChange} 
              className="bg-gray-800 border-gray-600 text-white" 
              placeholder="Or paste image URL"
            />
          </div>

          {/* Show traditional video/download fields for movies and trailers */}
          {!isSeries && (
            <>
              <div>
                <Label htmlFor="video_url" className="text-white">Video URL</Label>
                <Input 
                  id="video_url" 
                  name="video_url" 
                  type="url" 
                  value={selectedContent.video_url} 
                  onChange={onInputChange} 
                  className="bg-gray-800 border-gray-600 text-white" 
                />
              </div>
              <div>
                <Label htmlFor="download_url" className="text-white">Download URL</Label>
                <Input 
                  id="download_url" 
                  name="download_url" 
                  type="url" 
                  value={selectedContent.download_url || ''} 
                  onChange={onInputChange} 
                  className="bg-gray-800 border-gray-600 text-white" 
                  placeholder="Optional: Direct download link" 
                />
              </div>
            </>
          )}

          {/* Show episode manager for series */}
          {isSeries && (
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
              <EpisodeManager
                episodes={episodes}
                onEpisodesChange={handleEpisodesChange}
                isEditMode={isEditMode}
              />
            </div>
          )}

          <div>
            <Label htmlFor="rating" className="text-white">Rating</Label>
            <Input 
              id="rating" 
              name="rating" 
              type="number" 
              value={selectedContent.rating || ''} 
              onChange={onInputChange} 
              className="bg-gray-800 border-gray-600 text-white" 
            />
          </div>
          <div>
            <Label htmlFor="year" className="text-white">Year</Label>
            <Input 
              id="year" 
              name="year" 
              type="number" 
              value={selectedContent.year || ''} 
              onChange={onInputChange} 
              className="bg-gray-800 border-gray-600 text-white" 
            />
          </div>
          <div>
            <Label htmlFor="genre" className="text-white">Genre</Label>
            <Input 
              id="genre" 
              name="genre" 
              value={selectedContent.genre || ''} 
              onChange={onInputChange} 
              className="bg-gray-800 border-gray-600 text-white" 
            />
          </div>
          <div>
            <Label htmlFor="age_rating" className="text-white">Age Rating</Label>
            <Select 
              onValueChange={(value) => onContentUpdate({ ...selectedContent, age_rating: value })} 
              defaultValue={selectedContent.age_rating || ''}
            >
              <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select age rating" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="G" className="text-white">G - General Audiences</SelectItem>
                <SelectItem value="PG" className="text-white">PG - Parental Guidance</SelectItem>
                <SelectItem value="PG-13" className="text-white">PG-13 - Parents Strongly Cautioned</SelectItem>
                <SelectItem value="R" className="text-white">R - Restricted</SelectItem>
                <SelectItem value="NC-17" className="text-white">NC-17 - Adults Only</SelectItem>
                <SelectItem value="18+" className="text-white">18+ - Adults Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={selectedContent.description || ''} 
              onChange={onInputChange} 
              className="bg-gray-800 border-gray-600 text-white" 
            />
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose} 
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading} 
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'Submitting...' : (isEditMode ? 'Update Content' : 'Create Content')}
          </Button>
        </div>
      </div>
    </div>
  );
};
