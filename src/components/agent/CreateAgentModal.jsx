import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter, Button, Input, Textarea } from '../ui';
import { Bot, Building, FileText, Sparkles } from 'lucide-react';
import { createAiAgentApi } from '../../api/authApi';
import { toast } from 'react-toastify';

export default function CreateAgentModal({ isOpen, onClose, onSuccess, onPlanLimitExceeded }) {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [behaviour, setBehaviour] = useState('You are a professional, helpful customer service AI assistant.');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error('Agent name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await createAiAgentApi({
        name: name.trim(),
        companyName: companyName.trim(),
        description: description.trim(),
        behaviour: behaviour.trim(),
      });

      if (res?.status === 201 || res?.data?.status === 1) {
        toast.success(res?.data?.message || 'Agent created successfully!');
        setName('');
        setCompanyName('');
        setDescription('');
        setBehaviour('You are a professional, helpful customer service AI assistant.');
        if (onSuccess) {
          onSuccess(res?.data?.data);
        }
        onClose();
      }
    } catch (err) {
      const respData = err?.response?.data;
      if (respData?.code === 'PLAN_LIMIT_EXCEEDED') {
        toast.error(respData.message || 'Agent limit reached for your plan.');
        onClose();
        if (onPlanLimitExceeded) {
          onPlanLimitExceeded(respData);
        }
      } else {
        toast.error(respData?.message || 'Failed to create agent');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New AI Agent"
      description="Configure a new autonomous intelligent agent for your workspace"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          <Input
            label="Agent Name"
            id="agent-name"
            placeholder="e.g. Support Specialist"
            icon={Bot}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Company / Brand Name"
            id="company-name"
            placeholder="e.g. Acme Corp"
            icon={Building}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <Input
            label="Short Description"
            id="description"
            placeholder="e.g. Handles customer questions, bookings, and inquiries"
            icon={FileText}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Textarea
            label="System Behaviour Prompt"
            id="behaviour"
            placeholder="Instructions defining how your AI assistant communicates and responds..."
            rows={4}
            value={behaviour}
            onChange={(e) => setBehaviour(e.target.value)}
          />
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} icon={Sparkles}>
            Create Agent
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
