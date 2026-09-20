import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Select, 
  Textarea, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  Modal, 
  ModalBody, 
  ModalFooter,
  Badge, 
  Tooltip,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  Skeleton,
  useToast
} from '../components/ui';
import { 
  Sparkles, 
  Send, 
  Mail, 
  Lock, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Trash2, 
  ArrowRight,
  Plus,
  Bot
} from 'lucide-react';

export default function DesignSystemReference() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [textareaText, setTextareaText] = useState('');
  const [selectVal, setSelectVal] = useState('groq');

  const sampleTableData = [
    { id: '1', name: 'Sales Assistant Bot', channel: 'Website', status: 'active', requests: '1,420', latency: '420ms' },
    { id: '2', name: 'Instagram DM Growth Lead', channel: 'Instagram', status: 'active', requests: '8,950', latency: '680ms' },
    { id: '3', name: 'Dental Booking Agent', channel: 'Website', status: 'paused', requests: '320', latency: '510ms' },
    { id: '4', name: 'VIP Support Escalation', channel: 'Multi', status: 'warning', requests: '95', latency: '1.2s' }
  ];

  return (
    <div className="min-h-screen bg-[#080C14] text-[#F8FAFC] p-6 md:p-10 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-2 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#06B6D4]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F8FAFC]">
              Design System & Token Reference
            </h1>
            <p className="text-sm text-[#94A3B8]">
              Canonical dark theme tokens, typography hierarchy, and reusable UI base components.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Color Palette Tokens */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-[#F8FAFC] flex items-center gap-2">
          <span>1. Color Tokens & Surface Scales</span>
        </h2>

        {/* Surfaces */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Neutral Dark Surfaces
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { name: 'Root Background', token: '--bg-root', hex: '#080C14', bg: 'bg-[#080C14]', border: 'border-white/10' },
              { name: 'Surface', token: '--bg-surface', hex: '#0F172A', bg: 'bg-[#0F172A]', border: 'border-white/10' },
              { name: 'Elevated', token: '--bg-elevated', hex: '#1E293B', bg: 'bg-[#1E293B]', border: 'border-white/10' },
              { name: 'Subtle', token: '--bg-subtle', hex: '#131D31', bg: 'bg-[#131D31]', border: 'border-white/10' },
              { name: 'Glass Card', token: '--bg-glass', hex: 'rgba(15,23,42,0.75)', bg: 'bg-[#0F172A]/75 backdrop-blur-md', border: 'border-white/10' },
              { name: 'Glass Elevated', token: '--bg-glass-elevated', hex: 'rgba(30,41,59,0.85)', bg: 'bg-[#1E293B]/85 backdrop-blur-md', border: 'border-white/15' }
            ].map((c) => (
              <div key={c.token} className={`p-4 rounded-xl border ${c.border} ${c.bg} flex flex-col justify-between h-28`}>
                <span className="text-xs font-medium text-[#F8FAFC]">{c.name}</span>
                <div>
                  <code className="text-[11px] text-[#06B6D4] block">{c.token}</code>
                  <span className="text-[10px] text-[#64748B]">{c.hex}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accent & Status */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Accent & Semantic Status Colors
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { name: 'Electric Cyan (Accent)', token: '--accent-primary', hex: '#06B6D4', bg: 'bg-[#06B6D4]', text: 'text-black' },
              { name: 'Emerald (Success)', token: '--color-success', hex: '#10B981', bg: 'bg-[#10B981]', text: 'text-black' },
              { name: 'Amber (Warning)', token: '--color-warning', hex: '#F59E0B', bg: 'bg-[#F59E0B]', text: 'text-black' },
              { name: 'Rose (Danger)', token: '--color-danger', hex: '#EF4444', bg: 'bg-[#EF4444]', text: 'text-white' },
              { name: 'Blue (Info)', token: '--color-info', hex: '#3B82F6', bg: 'bg-[#3B82F6]', text: 'text-white' }
            ].map((c) => (
              <div key={c.token} className={`p-4 rounded-xl ${c.bg} ${c.text} flex flex-col justify-between h-24 shadow-lg`}>
                <span className="text-xs font-bold">{c.name}</span>
                <div>
                  <code className="text-[11px] opacity-90 block">{c.token}</code>
                  <span className="text-[10px] opacity-75">{c.hex}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Buttons */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-[#F8FAFC]">2. Button Primitives</h2>
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Variants</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" icon={Sparkles}>Primary Action</Button>
                <Button variant="secondary" icon={Bot}>Secondary Action</Button>
                <Button variant="outline" icon={Plus}>Outline Action</Button>
                <Button variant="ghost">Ghost Action</Button>
                <Button variant="destructive" icon={Trash2}>Destructive Action</Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Sizes & States</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" variant="primary">Small (sm)</Button>
                <Button size="md" variant="primary">Medium (md)</Button>
                <Button size="lg" variant="primary">Large (lg)</Button>
                <Button variant="primary" loading>Loading</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Form Inputs */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-[#F8FAFC]">3. Form Input Elements</h2>
        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Email Address" 
              placeholder="operator@company.com" 
              icon={Mail} 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              helperText="We will never share your email address."
            />

            <Input 
              label="Password (Error State)" 
              type="password"
              placeholder="••••••••••••" 
              icon={Lock} 
              error="Password must contain at least 8 characters."
            />

            <Select 
              label="AI Model Provider"
              value={selectVal}
              onChange={(e) => setSelectVal(e.target.value)}
              options={[
                { value: 'groq', label: 'Groq Cloud (LLaMA 3.3 70B - Ultra Fast)' },
                { value: 'openai', label: 'OpenAI (GPT-4o Mini)' },
                { value: 'anthropic', label: 'Anthropic (Claude 3.5 Sonnet)' },
                { value: 'deepseek', label: 'DeepSeek R1 (Reasoning)' }
              ]}
              helperText="Active inference runtime provider"
            />

            <Textarea 
              label="System Prompt Instructions" 
              placeholder="You are a friendly customer concierge..." 
              value={textareaText}
              onChange={(e) => setTextareaText(e.target.value)}
              maxLength={200}
              helperText="Defines tone, role boundaries, and company context."
            />
          </CardContent>
        </Card>
      </section>

      {/* 4. Badges, Pills & Tooltips */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-[#F8FAFC]">4. Badges, Status Pills & Tooltips</h2>
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Status Badges (Subtle & Solid)</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="accent" dot>Electric Cyan</Badge>
                <Badge variant="success" dot>Active / Ready</Badge>
                <Badge variant="warning" dot>Rate Limited</Badge>
                <Badge variant="danger" dot>Revoked Token</Badge>
                <Badge variant="info" dot>Processing RAG</Badge>
                <Badge variant="default">Default Neutral</Badge>
                <Badge variant="accent" styleType="solid">Solid Accent</Badge>
                <Badge variant="success" styleType="solid">Solid Success</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Interactive Tooltips</h4>
              <div className="flex flex-wrap items-center gap-4">
                <Tooltip content="Live WebSocket streaming over Socket.io" position="top">
                  <Button variant="secondary" size="sm">Hover Top</Button>
                </Tooltip>
                <Tooltip content="5-minute Redis cached Graph API thread" position="bottom">
                  <Button variant="secondary" size="sm">Hover Bottom</Button>
                </Tooltip>
                <Tooltip content="AES-256-GCM encrypted Meta access token" position="right">
                  <Button variant="secondary" size="sm">Hover Right</Button>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 5. Cards & Tables */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-[#F8FAFC]">5. Cards & Data Tables</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card hover glow>
            <CardHeader>
              <CardTitle>Interactive Glass Card</CardTitle>
              <CardDescription>With hover translation & glow outline</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#94A3B8]">
                This card uses glassmorphic backdrop filters and subtle high-contrast borders.
              </p>
            </CardContent>
            <CardFooter>
              <Badge variant="accent">--radius-xl</Badge>
              <Button size="sm" variant="ghost" iconRight={ArrowRight}>Inspect</Button>
            </CardFooter>
          </Card>

          <Card hover className="md:col-span-2">
            <CardHeader>
              <CardTitle>Autonomous AI Agents</CardTitle>
              <CardDescription>Live multi-tenant agents active in this account</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>Agent Name</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Interactions</TableHead>
                    <TableHead>Latency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleTableData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-xs text-[#94A3B8]">{row.channel}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={row.status === 'active' ? 'success' : row.status === 'warning' ? 'warning' : 'default'} 
                          dot 
                          size="sm"
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{row.requests}</TableCell>
                      <TableCell className="text-xs font-mono text-[#06B6D4]">{row.latency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 6. Modal Dialog & ConfirmDialog Showcase */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-[#F8FAFC]">6. Dialog & Modal Primitives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Accessible Modal Shell</CardTitle>
              <CardDescription>Backdrop blur, escape key listener, and focus trapping</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" onClick={() => setModalOpen(true)}>
                Open Standard Modal
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Destructive Confirm Dialog</CardTitle>
              <CardDescription>Specialized modal for high-risk or destructive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" icon={Trash2} onClick={() => setConfirmOpen(true)}>
                Open Confirm Dialog
              </Button>
            </CardContent>
          </Card>
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Deploy AI Agent Configuration"
          description="Confirm deploying system prompt and RAG index updates to production."
          size="md"
        >
          <ModalBody className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#080C14] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Target Runtime</span>
                <Badge variant="accent" size="sm">Groq LLaMA 3.3</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Knowledge Chunks</span>
                <span className="font-mono text-[#F8FAFC]">148 Chunks (384-dim)</span>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Applying changes will hot-reload the LangGraph conversation state machine without disconnecting active web visitor sessions.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => { setModalOpen(false); toast.success('Agent deployed successfully'); }}>
              Confirm Deployment
            </Button>
          </ModalFooter>
        </Modal>

        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => { setConfirmOpen(false); toast.error('Agent deleted from account'); }}
          title="Delete Agent Permanently?"
          description="This will immediately remove the agent, all associated knowledge vectors, and disconnect active webhook integrations."
          confirmText="Delete Agent"
          variant="destructive"
        />
      </section>

      {/* 7. Toast Notifications */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-[#F8FAFC]">7. Toast Notification System</h2>
        <Card>
          <CardContent className="space-y-4">
            <p className="text-xs text-[#94A3B8]">
              Triggerable globally via <code className="text-[#06B6D4] font-mono">useToast()</code>. Rendered with dark glassmorphic styling and colored status borders.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="outline" 
                className="border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/10"
                onClick={() => toast.success('Knowledge document embeddings indexed successfully.', 'Ingestion Complete')}
              >
                Success Toast
              </Button>
              <Button 
                variant="outline" 
                className="border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10"
                onClick={() => toast.error('Meta Graph API token expired (code: 190). Please reconnect.', 'OAuth Error')}
              >
                Error Toast
              </Button>
              <Button 
                variant="outline" 
                className="border-[#F59E0B]/40 text-[#F59E0B] hover:bg-[#F59E0B]/10"
                onClick={() => toast.warning('Instagram rate limit approaching 90% threshold.', 'Rate Limit Alert')}
              >
                Warning Toast
              </Button>
              <Button 
                variant="outline" 
                className="border-[#06B6D4]/40 text-[#06B6D4] hover:bg-[#06B6D4]/10"
                onClick={() => toast.info('New visitor session started on website.', 'Realtime Event')}
              >
                Info Toast
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 8. Empty & Error States */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-[#F8FAFC]">8. Empty & Error States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EmptyState
            title="No Submissions Found"
            description="There are no form leads or appointment bookings matching your current filter criteria."
            action={{
              label: 'Create Lead Form',
              icon: Plus,
              onClick: () => toast.info('Opening form builder modal...')
            }}
            secondaryAction={{
              label: 'Reset Filters',
              onClick: () => toast.info('Filters cleared.')
            }}
          />

          <ErrorState
            title="Failed to Load Threads"
            description="The live chat thread service timed out while retrieving messages."
            error="ERR_CONNECTION_REFUSED: Redis stream consumer timeout after 5000ms"
            onRetry={() => toast.info('Retrying connection...')}
            retryText="Retry Connection"
          />
        </div>
      </section>

      {/* 9. Loading States & Shimmer Skeletons */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-[#F8FAFC]">9. Loading States & Shimmer Skeletons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingState
            message="Analyzing Instagram Account Insights..."
            description="Aggregating reach, impressions, and live conversation trends"
          />

          <Card>
            <CardHeader>
              <CardTitle>Shimmer Skeleton Placeholders</CardTitle>
              <CardDescription>Smooth pulse animations matching dark neutral surfaces</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="space-y-1.5 flex-1">
                  <Skeleton width="60%" height={14} />
                  <Skeleton width="40%" height={10} />
                </div>
              </div>
              <Skeleton variant="rectangular" height={60} />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton height={28} />
                <Skeleton height={28} />
                <Skeleton height={28} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
