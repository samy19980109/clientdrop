'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatTime, formatFileSize, formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  CheckSquare,
  CreditCard,
  Clock,
  Upload,
  Send,
  Plus,
  Link2,
  Copy,
  Check,
  Trash2,
  X,
} from 'lucide-react';
import Link from 'next/link';

type Tab = 'files' | 'messages' | 'documents' | 'payments' | 'activity';

interface ClientDetailProps {
  client: Record<string, string>;
  files: Record<string, string | number>[];
  messages: Record<string, string>[];
  documentRequests: Record<string, string | { id: string; label: string; completed: boolean; file_name: string | null }[]>[];
  paymentLinks: Record<string, string | number | null>[];
  activities: Record<string, string | null>[];
  portalUrl: string;
}

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'In Review', 'Completed', 'On Hold'];

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'files', label: 'Files', icon: FileText },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'documents', label: 'Doc Requests', icon: CheckSquare },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'activity', label: 'Activity', icon: Clock },
];

export function ClientDetail({
  client,
  files,
  messages,
  documentRequests,
  paymentLinks,
  activities,
  portalUrl,
}: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('files');
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const copyPortalLink = async () => {
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to clients
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar name={client.name} size="lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
            <p className="text-muted">
              {client.company ? `${client.company} · ` : ''}
              {client.email}
            </p>
          </div>
          <StatusSelector clientId={client.id} currentStatus={client.project_status} />
        </div>

        {/* Portal Link */}
        <div className="mt-4 flex items-center gap-2 bg-accent/5 rounded-lg px-4 py-2.5">
          <Link2 className="w-4 h-4 text-accent shrink-0" />
          <span className="text-sm text-foreground truncate flex-1">{portalUrl}</span>
          <button
            onClick={copyPortalLink}
            className="inline-flex items-center gap-1 text-sm text-accent hover:underline shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy portal link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6 overflow-x-auto">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'files' && (
        <FilesTab clientId={client.id} files={files} />
      )}
      {activeTab === 'messages' && (
        <MessagesTab clientId={client.id} messages={messages} />
      )}
      {activeTab === 'documents' && (
        <DocumentsTab clientId={client.id} documentRequests={documentRequests} />
      )}
      {activeTab === 'payments' && (
        <PaymentsTab clientId={client.id} paymentLinks={paymentLinks} />
      )}
      {activeTab === 'activity' && (
        <ActivityTab activities={activities} />
      )}
    </div>
  );
}

// --- Status Selector ---
function StatusSelector({
  clientId,
  currentStatus,
}: {
  clientId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    setStatus(newStatus);
    const supabase = createClient();
    await supabase.from('clients').update({ project_status: newStatus }).eq('id', clientId);
    await supabase.from('activities').insert({
      client_id: clientId,
      actor: 'provider',
      action: `Status changed to "${newStatus}"`,
    });
    router.refresh();
  };

  return (
    <select
      value={status}
      onChange={(e) => updateStatus(e.target.value)}
      className="rounded-lg border border-border px-3 py-2 text-sm bg-white focus:border-accent focus:outline-none cursor-pointer"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

// --- Files Tab ---
function FilesTab({
  clientId,
  files,
}: {
  clientId: string;
  files: Record<string, string | number>[];
}) {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const supabase = createClient();
    const filePath = `${clientId}/${Date.now()}-${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('client-files')
      .upload(filePath, file);

    if (!uploadError && uploadData) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('client-files').getPublicUrl(filePath);

      await supabase.from('shared_files').insert({
        client_id: clientId,
        uploaded_by: 'provider',
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
      });

      await supabase.from('activities').insert({
        client_id: clientId,
        actor: 'provider',
        action: `Uploaded "${file.name}"`,
      });

      router.refresh();
    }
    setUploading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Shared Files</h2>
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          <span className="inline-flex items-center justify-center rounded-lg font-medium text-sm px-3 py-1.5 bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload file'}
          </span>
        </label>
      </div>

      {files.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No files yet"
          description="Upload a file to share with your client."
        />
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id as string}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-white"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">
                  {file.file_name as string}
                </div>
                <div className="text-xs text-muted">
                  {formatFileSize(file.file_size as number)} ·{' '}
                  {file.uploaded_by === 'client' ? 'From client' : 'From you'} ·{' '}
                  {formatDate(file.created_at as string)}
                </div>
              </div>
              <a
                href={file.file_url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline shrink-0"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Messages Tab ---
function MessagesTab({
  clientId,
  messages,
}: {
  clientId: string;
  messages: Record<string, string>[];
}) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);

    const supabase = createClient();
    await supabase.from('messages').insert({
      client_id: clientId,
      sender: 'provider',
      content: content.trim(),
    });

    await supabase.from('activities').insert({
      client_id: clientId,
      actor: 'provider',
      action: 'Sent a message',
    });

    setContent('');
    setSending(false);
    router.refresh();
  };

  return (
    <div>
      <h2 className="font-semibold text-foreground mb-4">Messages</h2>

      <div className="border border-border rounded-xl bg-white overflow-hidden">
        {/* Message list */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">
              No messages yet. Start the conversation.
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'provider' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    msg.sender === 'provider'
                      ? 'bg-accent text-white rounded-br-md'
                      : 'bg-gray-100 text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === 'provider' ? 'text-white/60' : 'text-muted'
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="border-t border-border p-3 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg border border-border text-sm focus:border-accent focus:outline-none"
          />
          <Button type="submit" size="sm" loading={sending} disabled={!content.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// --- Documents Tab ---
function DocumentsTab({
  clientId,
  documentRequests,
}: {
  clientId: string;
  documentRequests: Record<string, string | { id: string; label: string; completed: boolean; file_name: string | null }[]>[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addItem = () => setItems([...items, '']);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    setItems(updated);
  };

  const createRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((i) => i.trim());
    if (!title.trim() || validItems.length === 0) return;
    setLoading(true);

    const supabase = createClient();
    await supabase.from('document_requests').insert({
      client_id: clientId,
      title: title.trim(),
      items: validItems.map((label) => ({
        id: crypto.randomUUID(),
        label,
        completed: false,
        file_url: null,
        file_name: null,
      })),
    });

    await supabase.from('activities').insert({
      client_id: clientId,
      actor: 'provider',
      action: `Created document request "${title.trim()}"`,
    });

    setTitle('');
    setItems(['']);
    setShowForm(false);
    setLoading(false);
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Document Requests</h2>
        <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New request
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={createRequest} className="space-y-4">
            <Input
              id="doc-title"
              label="Request title"
              placeholder="e.g., Tax Documents 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Documents needed
              </label>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateItem(i, e.target.value)}
                      placeholder={`Document ${i + 1}`}
                      className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:border-accent focus:outline-none"
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="p-2 text-muted hover:text-danger cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-accent hover:underline mt-2 cursor-pointer"
              >
                + Add another document
              </button>
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={loading}>
                Create request
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {documentRequests.length === 0 && !showForm ? (
        <EmptyState
          icon={CheckSquare}
          title="No document requests"
          description="Create a checklist of documents you need from this client."
        />
      ) : (
        <div className="space-y-4">
          {documentRequests.map((req) => {
            const reqItems = (req.items || []) as { id: string; label: string; completed: boolean; file_name: string | null }[];
            const completed = reqItems.filter((i) => i.completed).length;
            return (
              <Card key={req.id as string} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">{req.title as string}</h3>
                  <Badge variant={completed === reqItems.length ? 'success' : 'warning'}>
                    {completed}/{reqItems.length} completed
                  </Badge>
                </div>
                <div className="space-y-2">
                  {reqItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                          item.completed
                            ? 'bg-success border-success'
                            : 'border-border'
                        }`}
                      >
                        {item.completed && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span
                        className={
                          item.completed ? 'text-muted line-through' : 'text-foreground'
                        }
                      >
                        {item.label}
                      </span>
                      {item.file_name && (
                        <span className="text-xs text-accent">({item.file_name})</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Payments Tab ---
function PaymentsTab({
  clientId,
  paymentLinks,
}: {
  clientId: string;
  paymentLinks: Record<string, string | number | null>[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createPaymentLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    setLoading(true);

    const supabase = createClient();
    const amountCents = Math.round(parseFloat(amount) * 100);

    await supabase.from('payment_links').insert({
      client_id: clientId,
      amount: amountCents,
      description,
    });

    await supabase.from('activities').insert({
      client_id: clientId,
      actor: 'provider',
      action: `Requested payment of $${amount} for "${description}"`,
    });

    setAmount('');
    setDescription('');
    setShowForm(false);
    setLoading(false);
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Payment Links</h2>
        <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Request payment
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={createPaymentLink} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="amount"
                label="Amount ($)"
                type="number"
                step="0.01"
                min="0.50"
                placeholder="500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <Input
                id="pay-description"
                label="Description"
                placeholder="e.g., Monthly retainer — January"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={loading}>
                Create payment link
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {paymentLinks.length === 0 && !showForm ? (
        <EmptyState
          icon={CreditCard}
          title="No payment links"
          description="Request a payment from this client. They'll see a Pay Now button in their portal."
        />
      ) : (
        <div className="space-y-2">
          {paymentLinks.map((link) => (
            <Card key={link.id as string} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {formatCurrency(link.amount as number)}
                  </div>
                  <div className="text-sm text-muted">{link.description as string}</div>
                </div>
                <Badge
                  variant={link.status === 'paid' ? 'success' : 'warning'}
                >
                  {link.status === 'paid' ? 'Paid' : 'Pending'}
                </Badge>
                <span className="text-xs text-muted">
                  {formatDate(link.created_at as string)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Activity Tab ---
function ActivityTab({
  activities,
}: {
  activities: Record<string, string | null>[];
}) {
  return (
    <div>
      <h2 className="font-semibold text-foreground mb-4">Activity Timeline</h2>

      {activities.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No activity yet"
          description="Activity will appear here as you and your client interact."
        />
      ) : (
        <div className="space-y-0">
          {activities.map((activity, i) => (
            <div key={activity.id as string} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 bg-accent rounded-full mt-1.5" />
                {i < activities.length - 1 && (
                  <div className="w-px flex-1 bg-border" />
                )}
              </div>
              <div className="pb-6">
                <p className="text-sm text-foreground">{activity.action}</p>
                {activity.details && (
                  <p className="text-sm text-muted">{activity.details}</p>
                )}
                <p className="text-xs text-muted mt-1">
                  {formatDate(activity.created_at as string)} at{' '}
                  {formatTime(activity.created_at as string)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
