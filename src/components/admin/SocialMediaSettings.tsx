
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { X } from "lucide-react";

interface SocialMediaLinks {
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  x_url: string;
}

export const SocialMediaSettings = () => {
  const [links, setLinks] = useState<SocialMediaLinks>({
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    x_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSocialMediaLinks();
  }, []);

  const fetchSocialMediaLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['facebook_url', 'instagram_url', 'youtube_url', 'x_url']);

      if (error) throw error;

      const linksData: SocialMediaLinks = {
        facebook_url: '',
        instagram_url: '',
        youtube_url: '',
        x_url: ''
      };

      data?.forEach(item => {
        if (item.setting_key in linksData) {
          linksData[item.setting_key as keyof SocialMediaLinks] = item.setting_value || '';
        }
      });

      setLinks(linksData);
    } catch (error) {
      console.error('Error fetching social media links:', error);
      toast({
        title: "Error",
        description: "Failed to fetch social media links.",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updates = Object.entries(links).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert(update, { onConflict: 'setting_key' });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Social media links updated successfully!"
      });
    } catch (error) {
      console.error('Error updating social media links:', error);
      toast({
        title: "Error",
        description: "Failed to update social media links.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: keyof SocialMediaLinks, value: string) => {
    setLinks(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Social Media Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="facebook_url" className="flex items-center gap-2">
            <Facebook className="w-4 h-4" />
            Facebook URL
          </Label>
          <Input
            id="facebook_url"
            type="url"
            placeholder="https://facebook.com/yourpage"
            value={links.facebook_url}
            onChange={(e) => handleInputChange('facebook_url', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram_url" className="flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Instagram URL
          </Label>
          <Input
            id="instagram_url"
            type="url"
            placeholder="https://instagram.com/yourprofile"
            value={links.instagram_url}
            onChange={(e) => handleInputChange('instagram_url', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube_url" className="flex items-center gap-2">
            <Youtube className="w-4 h-4" />
            YouTube URL
          </Label>
          <Input
            id="youtube_url"
            type="url"
            placeholder="https://youtube.com/yourchannel"
            value={links.youtube_url}
            onChange={(e) => handleInputChange('youtube_url', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="x_url" className="flex items-center gap-2">
            <X className="w-4 h-4" />
            X (Twitter) URL
          </Label>
          <Input
            id="x_url"
            type="url"
            placeholder="https://x.com/yourhandle"
            value={links.x_url}
            onChange={(e) => handleInputChange('x_url', e.target.value)}
          />
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : "Save Social Media Links"}
        </Button>
      </CardContent>
    </Card>
  );
};
