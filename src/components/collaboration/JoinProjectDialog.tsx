import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface JoinProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinProjectDialog: React.FC<JoinProjectDialogProps> = ({ open, onOpenChange }) => {
  const [projectId, setProjectId] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!projectId.trim() || !inviteToken.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please enter both Project ID and invite token',
        variant: 'destructive',
      });
      return;
    }

    setIsJoining(true);
    try {
      const { error } = await (supabase.rpc as any)('join_project_via_token', {
        p_project_id: projectId.trim(),
        p_token: inviteToken.trim(),
      });

      if (error) throw error;

      toast({
        title: 'Joined project',
        description: 'You have been added as a contributor',
      });

      onOpenChange(false);
      setProjectId('');
      setInviteToken('');
      navigate(`/project/${projectId.trim()}`);
    } catch (error: any) {
      toast({
        title: 'Failed to join project',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a Project</DialogTitle>
          <DialogDescription>
            Enter the Project ID and invite token shared by the project owner
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="projectId">Project ID</Label>
            <Input
              id="projectId"
              placeholder="e.g. a1b2c3d4-e5f6-..."
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inviteToken">Invite Token</Label>
            <Input
              id="inviteToken"
              placeholder="Paste invite token here"
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleJoin}
            disabled={isJoining}
            className="bg-gradient-primary text-primary-foreground"
          >
            {isJoining ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Users className="w-4 h-4 mr-2" />
            )}
            Join Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
