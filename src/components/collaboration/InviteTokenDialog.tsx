import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Loader2, RefreshCw, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface InviteTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

export const InviteTokenDialog: React.FC<InviteTokenDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  projectName,
}) => {
  const [token, setToken] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateToken = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await (supabase.rpc as any)('generate_invite_token', {
        p_project_id: projectId,
      });

      if (error) throw error;

      setToken(data as string);
      toast({
        title: 'Invite token generated',
        description: 'Share this token with your team members',
      });
    } catch (error: any) {
      toast({
        title: 'Error generating token',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
          <DialogDescription>
            Generate an invite token for "{projectName}". Share both the Project ID and token with your team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Project ID</Label>
            <div className="flex gap-2">
              <Input value={projectId} readOnly className="font-mono text-xs" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(projectId, 'Project ID')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Invite Token</Label>
            {token ? (
              <div className="flex gap-2">
                <Input value={token} readOnly className="font-mono text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(token, 'Invite token')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={generateToken}
                disabled={isGenerating}
                variant="outline"
                className="w-full"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Generate Invite Token
              </Button>
            )}
          </div>

          {token && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground">
                Share both the <strong>Project ID</strong> and <strong>Invite Token</strong> with
                your team member. They can use "Join Project" on their dashboard.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); setToken(''); }}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
