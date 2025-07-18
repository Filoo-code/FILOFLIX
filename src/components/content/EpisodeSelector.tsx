
import React from "react";
import { Button } from "@/components/ui/button";
import { Episode } from "@/types/content";

interface EpisodeSelectorProps {
  isOpen: boolean;
  episodes: Episode[];
  onEpisodeSelect: (episode: Episode) => void;
  onClose: () => void;
}

export const EpisodeSelector = ({ isOpen, episodes, onEpisodeSelect, onClose }: EpisodeSelectorProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-white mb-4">Select Episode</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {episodes.map((episode) => (
            <Button
              key={episode.episode_number}
              variant="outline"
              className="w-full justify-start text-left border-gray-600 text-white hover:bg-gray-800"
              onClick={() => onEpisodeSelect(episode)}
            >
              <div>
                <div className="font-semibold">Episode {episode.episode_number}</div>
                {episode.title && <div className="text-sm text-gray-400">{episode.title}</div>}
              </div>
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={onClose}
          className="w-full mt-4 border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
