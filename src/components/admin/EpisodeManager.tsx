
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Episode {
  id?: string;
  episode_number: number;
  title: string;
  embed_code: string; // Changed from video_url to embed_code for consistency
  download_url?: string;
  description?: string;
  thumbnail_url?: string;
  duration?: string;
}

interface EpisodeManagerProps {
  episodes: Episode[];
  onEpisodesChange: (episodes: Episode[]) => void;
  isEditMode: boolean;
}

export const EpisodeManager = ({ episodes, onEpisodesChange, isEditMode }: EpisodeManagerProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addEpisode = () => {
    const newEpisode: Episode = {
      episode_number: episodes.length + 1,
      title: '',
      embed_code: '', // Changed from video_url to embed_code
      download_url: '',
      description: '',
      thumbnail_url: '',
      duration: ''
    };
    onEpisodesChange([...episodes, newEpisode]);
    setEditingIndex(episodes.length);
  };

  const updateEpisode = (index: number, field: keyof Episode, value: string | number) => {
    const updatedEpisodes = episodes.map((episode, i) => 
      i === index ? { ...episode, [field]: value } : episode
    );
    onEpisodesChange(updatedEpisodes);
  };

  const removeEpisode = (index: number) => {
    const updatedEpisodes = episodes.filter((_, i) => i !== index);
    // Renumber episodes
    const renumberedEpisodes = updatedEpisodes.map((episode, i) => ({
      ...episode,
      episode_number: i + 1
    }));
    onEpisodesChange(renumberedEpisodes);
    setEditingIndex(null);
  };

  const toggleEdit = (index: number) => {
    setEditingIndex(editingIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-white text-lg font-semibold">Episodes</Label>
        <Button
          type="button"
          onClick={addEpisode}
          variant="outline"
          size="sm"
          className="border-gray-600 text-white hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Episode
        </Button>
      </div>

      {episodes.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No episodes added yet. Click "Add Episode" to get started.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {episodes.map((episode, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm text-white">
                    Episode {episode.episode_number}: {episode.title || 'Untitled'}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      onClick={() => toggleEdit(index)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => removeEpisode(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {editingIndex === index && (
                <CardContent className="pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-300 text-xs">Episode Number</Label>
                      <Input
                        type="number"
                        value={episode.episode_number}
                        onChange={(e) => updateEpisode(index, 'episode_number', parseInt(e.target.value) || 1)}
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-xs">Duration</Label>
                      <Input
                        value={episode.duration || ''}
                        onChange={(e) => updateEpisode(index, 'duration', e.target.value)}
                        placeholder="e.g., 45 min"
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-xs">Title</Label>
                    <Input
                      value={episode.title}
                      onChange={(e) => updateEpisode(index, 'title', e.target.value)}
                      placeholder="Episode title"
                      className="bg-gray-700 border-gray-600 text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-xs">Video URL/Embed Code</Label>
                    <Textarea
                      value={episode.embed_code}
                      onChange={(e) => updateEpisode(index, 'embed_code', e.target.value)}
                      placeholder="Paste iframe embed code or video URL here..."
                      className="bg-gray-700 border-gray-600 text-white text-sm"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-xs">Download URL (Optional)</Label>
                    <Input
                      type="url"
                      value={episode.download_url || ''}
                      onChange={(e) => updateEpisode(index, 'download_url', e.target.value)}
                      placeholder="https://..."
                      className="bg-gray-700 border-gray-600 text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-xs">Thumbnail URL (Optional)</Label>
                    <Input
                      type="url"
                      value={episode.thumbnail_url || ''}
                      onChange={(e) => updateEpisode(index, 'thumbnail_url', e.target.value)}
                      placeholder="https://..."
                      className="bg-gray-700 border-gray-600 text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-xs">Description (Optional)</Label>
                    <Textarea
                      value={episode.description || ''}
                      onChange={(e) => updateEpisode(index, 'description', e.target.value)}
                      placeholder="Episode description..."
                      className="bg-gray-700 border-gray-600 text-white text-sm"
                      rows={2}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
