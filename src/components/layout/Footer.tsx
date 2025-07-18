import { useState, useEffect } from "react";
import { Facebook, Instagram, Youtube, Send, MessageSquare } from "lucide-react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface SocialMediaLinks {
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  x_url: string;
}

export const Footer = () => {
  const [socialLinks, setSocialLinks] = useState<SocialMediaLinks>({
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    x_url: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [suggesterName, setSuggesterName] = useState('');
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
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

      setSocialLinks(linksData);
    } catch (error) {
      console.error('Error fetching social media links:', error);
    }
  };

  const openModal = (content: string) => {
    setModalContent(content);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent('');
    setSuggestion('');
    setSuggesterName('');
  };

  const submitSuggestion = async () => {
    if (!suggestion.trim()) return;

    setSubmittingSuggestion(true);
    try {
      // Store suggestion in admin_settings table for admin to review
      const { error } = await supabase
        .from('admin_settings')
        .insert({
          setting_key: `suggestion_${Date.now()}`,
          setting_value: JSON.stringify({
            name: suggesterName || 'Anonymous',
            suggestion: suggestion,
            timestamp: new Date().toISOString()
          })
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your suggestion has been submitted successfully!"
      });
      closeModal();
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to submit suggestion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  const getModalContent = () => {
    switch (modalContent) {
      case 'help':
        return (
          <div className="text-gray-300">
            <h3 className="text-xl font-bold text-white mb-4">Help Center</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">How to Download Content</h4>
                <div className="space-y-2 text-sm">
                  <p>1. Navigate to any movie or series you want to download</p>
                  <p>2. Click on the content to open the video player</p>
                  <p>3. Look for the "Download" button (if available for that content)</p>
                  <p>4. Click the download button to start downloading</p>
                  <p>5. The file will be saved to your device's downloads folder</p>
                  <p className="text-yellow-400 italic">Note: Download availability depends on content licensing and may not be available for all movies/series.</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Video Loading Issues</h4>
                <p className="text-sm">Please be patient while the video loads. Our content is streamed in high quality, which may take a moment depending on your internet connection. If videos don't load, try refreshing the page or checking your internet connection.</p>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold text-white mb-2">Submit a Suggestion</h4>
                <Button 
                  onClick={() => setModalContent('suggestions')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Suggestion
                </Button>
              </div>
            </div>
          </div>
        );

      case 'suggestions':
        return (
          <div className="text-gray-300">
            <h3 className="text-xl font-bold text-white mb-4">Send Suggestion</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Your Name (Optional)</label>
                <Input
                  value={suggesterName}
                  onChange={(e) => setSuggesterName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Your Suggestion</label>
                <Textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="Tell us what you'd like to see improved or added to FILOFLIX..."
                  className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
                />
              </div>
              <Button 
                onClick={submitSuggestion}
                disabled={submittingSuggestion || !suggestion.trim()}
                className="bg-red-600 hover:bg-red-700 text-white w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {submittingSuggestion ? 'Submitting...' : 'Submit Suggestion'}
              </Button>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="text-gray-300">
            <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Manager Contact Information</h4>
                <div className="space-y-2">
                  <p><strong>Mobile:</strong> +254104289080</p>
                  <p><strong>Email:</strong> famousfeelins1@gmail.com</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Follow Us on Social Media</h4>
                <div className="flex space-x-4">
                  {socialLinks.facebook_url && (
                    <a href={socialLinks.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                      <Facebook className="w-5 h-5" />
                      Facebook
                    </a>
                  )}
                  {socialLinks.x_url && (
                    <a href={socialLinks.x_url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                      <X className="w-5 h-5" />
                      X
                    </a>
                  )}
                  {socialLinks.instagram_url && (
                    <a href={socialLinks.instagram_url} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-2">
                      <Instagram className="w-5 h-5" />
                      Instagram
                    </a>
                  )}
                  {socialLinks.youtube_url && (
                    <a href={socialLinks.youtube_url} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2">
                      <Youtube className="w-5 h-5" />
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="text-gray-300">
            <h3 className="text-xl font-bold text-white mb-4">Privacy Policy</h3>
            <div className="space-y-4 text-sm max-h-96 overflow-y-auto">
              <p>At FILOFLIX, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our streaming service.</p>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Information We Collect</h4>
                <p>We collect information you provide directly to us when you create an account, such as your name, email address, payment information, and viewing preferences. We also automatically collect certain information about your device and how you use our service, including your IP address, browser type, operating system, and viewing history.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">How We Use Your Information</h4>
                <p>We use your information to provide and improve our streaming service, process payments, send you communications about your account or new features, personalize your viewing experience, and comply with legal obligations. We may also use your data to recommend content based on your viewing history and preferences.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Information Sharing and Disclosure</h4>
                <p>We do not sell your personal information to third parties. We may share your information with service providers who help us operate our platform, such as payment processors and cloud hosting providers. We may also disclose your information if required by law or to protect our rights and the safety of our users.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Data Security</h4>
                <p>We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Your Rights and Choices</h4>
                <p>You have the right to access, update, or delete your personal information. You can also opt out of marketing communications and choose your privacy settings through your account dashboard. For residents of certain jurisdictions, additional rights may apply under local privacy laws.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Children's Privacy</h4>
                <p>Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us to have it removed.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Changes to This Policy</h4>
                <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our platform and updating the effective date. Your continued use of our service after such changes constitutes acceptance of the updated policy.</p>
              </div>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="text-gray-300">
            <h3 className="text-xl font-bold text-white mb-4">Terms of Service</h3>
            <div className="space-y-4 text-sm max-h-96 overflow-y-auto">
              <p>Welcome to FILOFLIX. By using our streaming service, you agree to be bound by these Terms of Service. Please read them carefully.</p>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Acceptance of Terms</h4>
                <p>By accessing or using FILOFLIX, you agree to comply with and be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Description of Service</h4>
                <p>FILOFLIX is a subscription-based streaming service that allows you to watch movies, TV shows, and other video content on internet-connected devices. Our service and content may vary by geographical location and may change from time to time.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">User Accounts</h4>
                <p>You must create an account to use our service. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You must provide accurate information and keep it updated.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Subscription and Payment</h4>
                <p>Our service is provided on a subscription basis. You will be charged the applicable subscription fee at the beginning of each billing period. All payments are non-refundable except as required by applicable law. We reserve the right to change our subscription prices with notice.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Prohibited Uses</h4>
                <p>You may not use our service for any unlawful purpose or in any way that could damage, disable, or impair our service. You may not attempt to gain unauthorized access to our systems, reproduce or distribute our content without permission, or use automated systems to access our service.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Content and Intellectual Property</h4>
                <p>All content available on FILOFLIX is protected by copyright and other intellectual property laws. You may stream content for your personal, non-commercial use only. You may not download, copy, or distribute any content except where explicitly permitted.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Limitation of Liability</h4>
                <p>To the fullest extent permitted by law, FILOFLIX shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising from your use of our service.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Termination</h4>
                <p>We may terminate or suspend your account and access to our service at any time, with or without notice, for any reason, including if you violate these Terms of Service. You may cancel your subscription at any time through your account settings.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Changes to Terms</h4>
                <p>We reserve the right to modify these Terms of Service at any time. We will provide notice of material changes by posting the updated terms on our platform. Your continued use of our service after such changes constitutes acceptance of the new terms.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <footer className="bg-black border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-2xl font-bold text-red-600 mb-4">FILOFLIX</h3>
              <p className="text-gray-400 text-sm">
                Your ultimate destination for movies, series, and exclusive trailers. 
                Stream the most thrilling content from around the world.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/content?type=movie" className="hover:text-white transition-colors">Movies</a></li>
                <li><a href="/content?type=series" className="hover:text-white transition-colors">TV Shows</a></li>
                <li><a href="/content?type=trailer" className="hover:text-white transition-colors">Trailers</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => openModal('help')} className="hover:text-white transition-colors text-left">Help Center</button></li>
                <li><button onClick={() => openModal('contact')} className="hover:text-white transition-colors text-left">Contact Us</button></li>
                <li><button onClick={() => openModal('privacy')} className="hover:text-white transition-colors text-left">Privacy Policy</button></li>
                <li><button onClick={() => openModal('terms')} className="hover:text-white transition-colors text-left">Terms of Service</button></li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                {socialLinks.facebook_url && (
                  <a href={socialLinks.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.x_url && (
                  <a href={socialLinks.x_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.instagram_url && (
                  <a href={socialLinks.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.youtube_url && (
                  <a href={socialLinks.youtube_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 FILOFLIX. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 relative">
            <Button
              onClick={closeModal}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
            {getModalContent()}
          </div>
        </div>
      )}
    </>
  );
};
