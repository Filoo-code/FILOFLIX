
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { ContentItem } from "@/types/content";

interface ContentTableProps {
  contentList: ContentItem[];
  isLoading: boolean;
  onEdit: (content: ContentItem) => void;
  onDelete: (id: string) => void;
}

export const ContentTable = ({ contentList, isLoading, onEdit, onDelete }: ContentTableProps) => {
  if (isLoading) {
    return <p className="text-white">Loading content...</p>;
  }

  return (
    <div className="w-full">
      <div className="rounded-md border border-gray-700 bg-gray-900">
        <div className="max-h-96 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rating</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {contentList.map((content) => (
                <tr key={content.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm font-medium text-white max-w-xs truncate">{content.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-300 capitalize">{content.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{content.rating || 'N/A'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        onClick={() => onEdit(content)} 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-300 hover:text-white hover:bg-gray-800"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={() => onDelete(content.id)} 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300 hover:bg-gray-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {contentList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No content available. Add some content to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
