import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  User, 
  Mail, 
  Trash2, 
  RefreshCw, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Lock,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import { listMembersApi, updateMemberRoleApi, removeMemberApi, inviteMemberApi } from '../../api/accountApi';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LoadingState } from '../../components/ui/LoadingState';
import InviteMemberModal from '../../components/team/InviteMemberModal';

export default function TeamMembers() {
  const auth = useSelector((state) => state?.auth);
  const currentUserId = auth?.details?._id || auth?.details?.id;
  const currentRole = auth?.role || auth?.account?.role || 'member';
  const isOwner = currentRole === 'owner';
  const accountName = auth?.account?.name || 'Workspace';

  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Remove member confirm state
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  // Role updating map (userId -> loading boolean)
  const [updatingRoles, setUpdatingRoles] = useState({});

  // Resending map (email -> loading boolean)
  const [resendingMap, setResendingMap] = useState({});

  const fetchMembers = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const res = await listMembersApi();
      if (res?.data?.status === 1 || res?.status === 200) {
        setMembers(res?.data?.members || []);
        setPendingInvites(res?.data?.pendingInvites || []);
      } else {
        toast.error(res?.data?.message || 'Failed to load team members');
      }
    } catch (err) {
      console.error('Failed to load team members:', err);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Handle member role change (Task 40 & 41)
  const handleRoleChange = async (member, newRole) => {
    if (member.role === newRole) return;
    if (!isOwner) {
      toast.error('Only workspace owners can modify member roles');
      return;
    }

    const userId = member.userId;
    setUpdatingRoles((prev) => ({ ...prev, [userId]: true }));

    try {
      const res = await updateMemberRoleApi(userId, { role: newRole });
      if (res?.data?.status === 1 || res?.status === 200) {
        toast.success(`Updated role for ${member.name || member.email} to ${newRole}`);
        // Update local state without reloading
        setMembers((prev) =>
          prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m))
        );
      } else {
        toast.error(res?.data?.message || 'Failed to update member role');
      }
    } catch (err) {
      const code = err?.response?.data?.code;
      const msg = err?.response?.data?.message;

      if (code === 'LAST_OWNER_CANNOT_BE_DEMOTED') {
        toast.error('Cannot demote the last remaining owner of the account');
      } else {
        toast.error(msg || 'Failed to update member role');
      }
    } finally {
      setUpdatingRoles((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Handle remove member
  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    const userId = memberToRemove.userId;

    try {
      setRemoving(true);
      const res = await removeMemberApi(userId);
      if (res?.data?.status === 1 || res?.status === 200) {
        toast.success(`Removed ${memberToRemove.name || memberToRemove.email} from workspace`);
        setMembers((prev) => prev.filter((m) => m.userId !== userId));
        setMemberToRemove(null);
      } else {
        toast.error(res?.data?.message || 'Failed to remove member');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to remove member';
      toast.error(msg);
    } finally {
      setRemoving(false);
    }
  };

  // Handle resending invitation
  const handleResendInvite = async (invite) => {
    const email = invite.email;
    setResendingMap((prev) => ({ ...prev, [email]: true }));

    try {
      const res = await inviteMemberApi({ email, role: invite.role || 'member' });
      if (res?.data?.status === 1 || res?.status === 201) {
        toast.success(`Invitation resent to ${email}`);
        // Refresh invites to show updated timestamp
        fetchMembers(true);
      } else {
        toast.error(res?.data?.message || 'Failed to resend invitation');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to resend invitation';
      toast.error(msg);
    } finally {
      setResendingMap((prev) => ({ ...prev, [email]: false }));
    }
  };

  // Called when a new invite is created via modal
  const handleInviteSuccess = () => {
    fetchMembers(true);
  };

  const getInitials = (name, email) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              Team & Members
            </h1>
            <Badge variant="cyan" size="sm" className="hidden sm:inline-flex">
              {accountName}
            </Badge>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Manage your workspace team members, permissions, and pending invitations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMembers(true)}
            disabled={loading || refreshing}
            className="gap-1.5"
            title="Refresh members list"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {isOwner && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsInviteModalOpen(true)}
              className="gap-1.5"
              id="invite-member-btn"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Member</span>
            </Button>
          )}
        </div>
      </div>

      {/* Read-only banner for Members */}
      {!isOwner && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs sm:text-sm">
          <Lock className="w-4 h-4 shrink-0 text-violet-400" />
          <span>
            <strong>Read-only view:</strong> You are currently viewing this workspace as a <strong>Member</strong>. Only Workspace Owners can invite, remove, or modify member roles.
          </span>
        </div>
      )}

      {/* Main Members Section */}
      {loading ? (
        <Card className="p-12">
          <LoadingState text="Loading workspace team members..." />
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active Members Card */}
          <Card className="overflow-hidden border border-white/10 bg-[#0F1117]/80 backdrop-blur-md">
            <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-semibold text-white">Active Members</h2>
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/5 text-gray-400 border border-white/10">
                  {members.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/5 bg-white/[0.02]">
                    <TableHead className="py-3 px-4 text-xs font-semibold text-gray-400">User</TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold text-gray-400">Role</TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold text-gray-400">Status</TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold text-gray-400">Joined</TableHead>
                    {isOwner && (
                      <TableHead className="py-3 px-4 text-xs font-semibold text-gray-400 text-right">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const isSelf = member.userId?.toString() === currentUserId?.toString();
                    const isUpdating = Boolean(updatingRoles[member.userId]);

                    return (
                      <TableRow
                        key={member._id || member.userId}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Member Identity */}
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.name || member.email}
                                className="w-9 h-9 rounded-full object-cover border border-white/10"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center justify-center">
                                {getInitials(member.name, member.email)}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">
                                  {member.name || member.email?.split('@')[0]}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400 block">{member.email}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Member Role Control */}
                        <TableCell className="py-3 px-4">
                          {isOwner ? (
                            <div className="inline-flex items-center gap-1.5">
                              <select
                                value={member.role}
                                disabled={isUpdating}
                                onChange={(e) => handleRoleChange(member, e.target.value)}
                                className={`text-xs font-medium rounded-lg px-2.5 py-1.5 bg-[#131D31] border transition-colors focus:outline-none cursor-pointer ${
                                  member.role === 'owner'
                                    ? 'border-violet-500/40 text-violet-300 hover:border-violet-500/60'
                                    : 'border-cyan-500/40 text-cyan-300 hover:border-cyan-500/60'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                <option value="member" className="bg-[#0F172A] text-gray-200">
                                  Member
                                </option>
                                <option value="owner" className="bg-[#0F172A] text-gray-200">
                                  Owner
                                </option>
                              </select>
                              {isUpdating && (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                              )}
                            </div>
                          ) : (
                            <Badge
                              variant={member.role === 'owner' ? 'violet' : 'cyan'}
                              size="sm"
                              className="capitalize"
                            >
                              {member.role === 'owner' ? (
                                <ShieldCheck className="w-3 h-3 mr-1" />
                              ) : (
                                <User className="w-3 h-3 mr-1" />
                              )}
                              {member.role}
                            </Badge>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </span>
                        </TableCell>

                        {/* Joined Date */}
                        <TableCell className="py-3 px-4 text-xs text-gray-400">
                          {member.joinedAt
                            ? new Date(member.joinedAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '—'}
                        </TableCell>

                        {/* Actions (Owner-only) */}
                        {isOwner && (
                          <TableCell className="py-3 px-4 text-right">
                            {isSelf ? (
                              <span className="text-xs text-gray-500 italic">—</span>
                            ) : member.role === 'owner' ? (
                              <span
                                className="text-xs text-gray-500 italic"
                                title="Demote to member before removing"
                              >
                                Owner protected
                              </span>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMemberToRemove(member)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                title="Remove member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Pending Invitations Section */}
          <Card className="overflow-hidden border border-white/10 bg-[#0F1117]/80 backdrop-blur-md">
            <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-semibold text-white">Pending Invitations</h2>
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/5 text-gray-400 border border-white/10">
                  {pendingInvites.length}
                </span>
              </div>
            </div>

            {pendingInvites.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-300">No pending invitations</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  All invited teammates have accepted or no pending invites exist.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/5 bg-white/[0.02]">
                      <TableHead className="py-3 px-4 text-xs font-semibold text-gray-400">Invited Email</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold text-gray-400">Role</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold text-gray-400">Expires</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold text-gray-400">Status</TableHead>
                      {isOwner && (
                        <TableHead className="py-3 px-4 text-xs font-semibold text-gray-400 text-right">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvites.map((invite) => {
                      const isResending = Boolean(resendingMap[invite.email]);

                      return (
                        <TableRow
                          key={invite._id || invite.email}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                        >
                          <TableCell className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                                <Mail className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium text-gray-200">{invite.email}</span>
                            </div>
                          </TableCell>

                          <TableCell className="py-3 px-4">
                            <Badge
                              variant={invite.role === 'owner' ? 'violet' : 'cyan'}
                              size="sm"
                              className="capitalize"
                            >
                              {invite.role || 'member'}
                            </Badge>
                          </TableCell>

                          <TableCell className="py-3 px-4 text-xs text-gray-400">
                            {invite.expiresAt
                              ? new Date(invite.expiresAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '7 days'}
                          </TableCell>

                          <TableCell className="py-3 px-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              Pending
                            </span>
                          </TableCell>

                          {isOwner && (
                            <TableCell className="py-3 px-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResendInvite(invite)}
                                disabled={isResending}
                                className="h-7 px-2.5 text-xs gap-1 border-white/10 hover:border-cyan-500/40 hover:text-cyan-400"
                                title="Resend invitation email"
                              >
                                <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin text-cyan-400' : ''}`} />
                                {isResending ? 'Sending...' : 'Resend'}
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={handleInviteSuccess}
      />

      {/* Remove Member Confirmation Dialog (Task 34 Primitive) */}
      <ConfirmDialog
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Team Member"
        description={`Are you sure you want to remove ${
          memberToRemove?.name || memberToRemove?.email
        } from this workspace? They will immediately lose access to all agents and data.`}
        confirmText="Remove Member"
        cancelText="Cancel"
        variant="destructive"
        loading={removing}
      />
    </div>
  );
}
