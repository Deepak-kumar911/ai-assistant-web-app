import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter, Button, Badge } from '../ui';
import { Check, Mail, Sparkles, Zap, Crown, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

export default function UpgradePlanModal({ isOpen, onClose, currentPlan = 'free' }) {
  const [copied, setCopied] = useState(false);
  const contactEmail = 'support@ai-assistant.io';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    toast.success('Support email copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const plans = [
    {
      id: 'free',
      name: 'Free Tier',
      icon: Sparkles,
      price: '$0',
      period: 'forever',
      description: 'Ideal for trying out single autonomous assistant deployments.',
      agents: 1,
      features: [
        '1 Autonomous AI Agent',
        'Website chat integration',
        'Standard LLM processing',
        'Community support',
      ],
      badgeVariant: 'default',
    },
    {
      id: 'pro',
      name: 'Pro Tier',
      icon: Zap,
      price: '$49',
      period: 'per month',
      description: 'Empower small teams with multi-agent multi-channel automation.',
      agents: 4,
      features: [
        '4 Autonomous AI Agents',
        'Instagram DM & Comment automation',
        'Custom workflow triggers & Canvas',
        'Priority result stream processing',
        'Standard team support',
      ],
      badgeVariant: 'accent',
      highlighted: true,
    },
    {
      id: 'ultra',
      name: 'Ultra Tier',
      icon: Crown,
      price: '$199',
      period: 'per month',
      description: 'Maximum capacity for scale with multi-agent orchestration.',
      agents: 7,
      features: [
        '7 Autonomous AI Agents',
        'Unlimited workflow automation executions',
        'Multi-member role collaboration',
        'Advanced Instagram Insights & Analytics',
        'Dedicated SLA & support manager',
      ],
      badgeVariant: 'warning',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workspace Plan & Limits"
      description="Select the optimal agent capacity for your workspace operations"
      size="xl"
    >
      <ModalBody className="space-y-6">
        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {plans.map((tier) => {
            const isCurrent = currentPlan.toLowerCase() === tier.id;
            const Icon = tier.icon;

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-5 flex flex-col justify-between border transition-all duration-200 ${
                  isCurrent
                    ? 'bg-[#06B6D4]/5 border-[#06B6D4] ring-1 ring-[#06B6D4]/50 shadow-lg shadow-[#06B6D4]/10'
                    : tier.highlighted
                    ? 'bg-[#0F172A] border-[#06B6D4]/40 hover:border-[#06B6D4]/70'
                    : 'bg-[#0F172A]/70 border-white/10 hover:border-white/20'
                }`}
              >
                {/* Current Plan Badge or Recommended */}
                {isCurrent ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="accent" styleType="solid" size="sm">
                      Current Plan
                    </Badge>
                  </div>
                ) : tier.highlighted ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="info" styleType="subtle" size="sm">
                      Most Popular
                    </Badge>
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        tier.id === 'ultra'
                          ? 'bg-amber-500/10 text-amber-400'
                          : tier.id === 'pro'
                          ? 'bg-[#06B6D4]/10 text-[#06B6D4]'
                          : 'bg-white/5 text-[#94A3B8]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                      {tier.agents} {tier.agents === 1 ? 'Agent' : 'Agents'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#F8FAFC]">{tier.name}</h4>
                  <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">{tier.description}</p>

                  <div className="mt-4 mb-5 pb-4 border-b border-white/5">
                    <span className="text-2xl font-bold text-[#F8FAFC]">{tier.price}</span>
                    <span className="text-xs text-[#64748B] ml-1.5">{tier.period}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-[#94A3B8]">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#06B6D4] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  {isCurrent ? (
                    <Button variant="outline" fullWidth size="sm" disabled className="opacity-60 cursor-default">
                      Active Plan
                    </Button>
                  ) : (
                    <a
                      href={`mailto:${contactEmail}?subject=Upgrade%20to%20${encodeURIComponent(
                        tier.name
                      )}&body=Hello,%20I%20would%20like%20to%20upgrade%20my%20workspace%20to%20the%20${encodeURIComponent(
                        tier.name
                      )}.`}
                      className="block w-full"
                    >
                      <Button
                        variant={tier.highlighted ? 'primary' : 'outline'}
                        fullWidth
                        size="sm"
                        icon={Mail}
                      >
                        Contact to Upgrade
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upgrade Notice Box */}
        <div className="rounded-xl p-4 bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#F8FAFC]">Instant Upgrades Available</p>
              <p className="text-[#94A3B8] mt-0.5">
                Automated Stripe billing is launching soon. In the meantime, email{' '}
                <strong className="text-[#F8FAFC]">{contactEmail}</strong> to upgrade your account tier within minutes.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyEmail}
            icon={copied ? Check : Copy}
            className="shrink-0"
          >
            {copied ? 'Copied' : 'Copy Email'}
          </Button>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
