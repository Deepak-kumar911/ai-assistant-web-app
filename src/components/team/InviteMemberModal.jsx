import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { inviteMemberApi } from '../../api/accountApi';
import { toast } from 'react-toastify';
import { Mail, Shield, UserCheck, Copy, Check } from 'lucide-react';

export default function InviteMemberModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [copied, setCopied] = useState(false);

  const resetState = () => {
    setEmail('');
    setRole('member');
    setGeneratedInvite(null);
    setCopied(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleCopyLink = () => {
    if (!generatedInvite?.inviteUrl) return;
    navigator.clipboard.writeText(generatedInvite.inviteUrl);
    setCopied(true);
    toast.success('Invite link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const res = await inviteMemberApi({ email: email.trim(), role });
      if (res?.data?.status === 1 || res?.status === 201) {
        toast.success(`Invitation sent to ${email}`);
        setGeneratedInvite(res.data);
        if (onSuccess) {
          onSuccess(res.data);
        }
      } else {
        toast.error(res?.data?.message || 'Failed to send invitation');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send invitation';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : handleClose}
      size="md"
      title={generatedInvite ? 'Invitation Sent' : 'Invite Team Member'}
      description={
        generatedInvite
          ? 'The invitation has been generated and emailed to your team member.'
          : 'Collaborate with teammates by inviting them to this workspace.'
      }
    >
      {generatedInvite ? (
        <ModalBody className="space-y-4">
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <UserCheck className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-white">
              Invitation emailed to <span className="text-cyan-300 font-semibold">{email}</span>
            </p>
            <p className="text-xs text-gray-400">
              Role: <span className="capitalize text-white font-medium">{role}</span> · Valid for 7 days
            </p>
          </div>

          {generatedInvite.inviteUrl && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">
                Or share this direct invite link:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedInvite.inviteUrl}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 select-all focus:outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="shrink-0 gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
          )}
        </ModalBody>
      ) : (
        <form onSubmit={handleSubmit}>
          <ModalBody className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
              autoFocus
            />

            <Select
              label="Workspace Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'member', label: 'Member — Can view and manage agents' },
                { value: 'owner', label: 'Owner — Full workspace, billing, & member controls' },
              ]}
              helperText={
                role === 'owner'
                  ? 'Owners can invite other members, edit billing, and manage workspace settings.'
                  : 'Members can create and edit AI agents and access operational dashboards.'
              }
            />
          </ModalBody>

          <ModalFooter className="gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={loading}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              className="gap-1.5"
            >
              <Shield className="w-4 h-4" />
              Send Invitation
            </Button>
          </ModalFooter>
        </form>
      )}

      {generatedInvite && (
        <ModalFooter>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleClose}
            className="w-full"
          >
            Done
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
}
