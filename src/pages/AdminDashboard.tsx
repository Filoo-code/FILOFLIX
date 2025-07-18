import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Plus, Home } from "lucide-react";
import { SocialMediaSettings } from "@/components/admin/SocialMediaSettings";
import { ContentModal } from "@/components/admin/ContentModal";
import { ContentTable } from "@/components/admin/ContentTable";
import { ContentItem, Episode } from "@/types/content";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem>({
    id: '',
    title: '',
    type: 'movie',
    thumbnail: null,
    video_url: '',
    rating: null,
    year: null,
    genre: null,
    description: null,
    download_url: null,
    subtitle: null,
    age_rating: null,
    category: null,
  });
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContentList(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to load content.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const openModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setSelectedContent({
      id: '',
      title: '',
      type: 'movie',
      thumbnail: null,
      video_url: '',
      rating: null,
      year: null,
      genre: null,
      description: null,
      download_url: null,
      subtitle: null,
      age_rating: null,
      category: null,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedContent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setSelectedContent(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleSubmit = async (episodes?: Episode[]) => {
    setIsLoading(true);
    try {
      let contentToSubmit = { ...selectedContent };

      // For series, store episodes as JSON in video_url field
      if (selectedContent.type === 'series' && episodes && episodes.length > 0) {
        contentToSubmit.video_url = JSON.stringify(episodes);
      }

      if (isEditMode && selectedContent.id) {
        const { error } = await supabase
          .from('content')
          .update(contentToSubmit)
          .eq('id', selectedContent.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Content updated successfully!"
        });
      } else {
        // Remove the id field for new content creation
        const { id, ...contentWithoutId } = contentToSubmit;
        const { error } = await supabase
          .from('content')
          .insert(contentWithoutId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Content created successfully!"
        });
      }

      fetchContent();
      closeModal();
    } catch (error) {
      console.error('Error creating/updating content:', error);
      toast({
        title: "Error",
        description: isEditMode ? "Failed to update content." : "Failed to create content.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (content: ContentItem) => {
    setSelectedContent(content);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this content?")) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content deleted successfully!"
      });
      fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete content.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentUpdate = (updatedContent: ContentItem) => {
    setSelectedContent(updatedContent);
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-red-600">
              FILOFLIX Admin
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={handleGoHome} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-800">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-800">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="content" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-gray-700">
            <TabsTrigger value="content" className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white">Content Management</TabsTrigger>
            <TabsTrigger value="social" className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white">Social Media</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-8">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Manage Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button onClick={openModal} className="bg-red-600 hover:bg-red-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Content
                  </Button>
                </div>

                <ContentTable
                  contentList={contentList}
                  isLoading={isLoading}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              </CardContent>
            </Card>

            <ContentModal
              isOpen={isModalOpen}
              isEditMode={isEditMode}
              selectedContent={selectedContent}
              isLoading={isLoading}
              onClose={closeModal}
              onSubmit={handleSubmit}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onContentUpdate={handleContentUpdate}
            />
          </TabsContent>

          <TabsContent value="social">
            <SocialMediaSettings />
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
