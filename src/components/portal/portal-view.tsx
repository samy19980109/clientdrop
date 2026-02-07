'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatTime, formatFileSize, formatCurrency } from '@/lib/utils';
import {
  FileText,
  MessageSquare,
  CheckSquare,
  CreditCard,
  Upload,
  Send,
  Check,
  Download,
} from 'lucide-react';

type Tab = 'overview' | 'files' | 'messages' | 'documents' | 'payments';

interface PortalViewProps {
  client: Record<string, string>;
  profile: Record<string, string | null> | null;
  files: Record<string, string | number>[];
  messages: Record<string, string>[];
  documentRequests: Record<string, string | { id: string; label: string; completed: boolean; file_url: string | null; file_name: string | null }[]>[];
  paymentLinks: Record<string, string | number | null>[];
  token: string;
}

export function PortalView({
  client,
  profile,
  files,
  messages,
  documentRequests,
  paymentLinks,
  token,
}: PortalViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const brandColor = profile?.primary_color || '#2563eb';
  const businessName = profile?.business_name || 'Your Portal';

  const pendingPayments = paymentLinks.filter((p) => p.status === 'pending');
  const totalDocItems = documentRequests.reduce((sum, req) => {
    const items = (req.items || []) as { completed: boolean }[];
    return sum + items.length;
  }, 0);
  const completedDocItems = documentRequests.reduce((sum, req) => {
    const items = (req.items || []) as { completed: boolean }[];
    return sum + items.filter((i) => i.completed).length;
  }, 0);

  const portalTabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: CheckSquare },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: brandColor }}
            >
              <span className="text-white font-bold text-sm">
                {businessName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-semibold text-foreground">{businessName}</span>
          </div>
          <span className="text-sm text-muted">Welcome, {client.name.split(' ')[0]}</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-card border-b border-border overflow-x-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex gap-1">
          {portalTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'text-foreground'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
              style={
                activeTab === tab.id
                  ? { borderBottomColor: brandColor, color: brandColor }
                  : {}
              }
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            client={client}
            files={files}
            messages={messages}
            pendingPayments={pendingPayments}
            totalDocItems={totalDocItems}
            completedDocItems={completedDocItems}
            brandColor={brandColor}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'files' && (
          <PortalFilesTab clientId={client.id} files={files} token={token} />
        )}
        {activeTab === 'messages' && (
          <PortalMessagesTab clientId={client.id} messages={messages} />
        )}
        {activeTab === 'documents' && (
          <PortalDocumentsTab
            clientId={client.id}
            documentRequests={documentRequests}
            token={token}
          />
        )}
        {activeTab === 'payments' && (
          <PortalPaymentsTab paymentLinks={paymentLinks} />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted">
          Powered by <span className="font-medium">ClientDrop</span>
        </p>
      </footer>
    </div>
  );
}

// --- Overview ---
function OverviewTab({
  client,
  files,
  messages,
  pendingPayments,
  totalDocItems,
  completedDocItems,
  brandColor,
  onNavigate,
}: {
  client: Record<string, string>;
  files: Record<string, string | number>[];
  messages: Record<string, string>[];
  pendingPayments: Record<string, string | number | null>[];
  totalDocItems: number;
  completedDocItems: number;
  brandColor: string;
  onNavigate: (tab: Tab) => void;
}) {
  const unreadMessages = messages.filter((m) => m.sender === 'provider').length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">
        Welcome back, {client.name.split(' ')[0]}
      </h1>

      {/* Status */}
      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Project Status</span>
          <Badge
            variant={
              client.project_status === 'Completed'
                ? 'success'
                : client.project_status === 'In Progress'
                ? 'info'
                : client.project_status === 'In Review'
                ? 'warning'
                : 'default'
            }
          >
            {client.project_status}
          </Badge>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <button onClick={() => onNavigate('files')} className="cursor-pointer text-left">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-foreground">{files.length}</div>
            <div className="text-xs text-muted">Files shared</div>
          </Card>
        </button>
        <button onClick={() => onNavigate('messages')} className="cursor-pointer text-left">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-foreground">{messages.length}</div>
            <div className="text-xs text-muted">Messages</div>
          </Card>
        </button>
        <button onClick={() => onNavigate('documents')} className="cursor-pointer text-left">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-foreground">
              {completedDocItems}/{totalDocItems}
            </div>
            <div className="text-xs text-muted">Docs uploaded</div>
          </Card>
        </button>
        <button onClick={() => onNavigate('payments')} className="cursor-pointer text-left">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-foreground">{pendingPayments.length}</div>
            <div className="text-xs text-muted">Pending payments</div>
          </Card>
        </button>
      </div>

      {/* Recent Files */}
      {files.length > 0 && (
        <Card className="mb-4">
          <h2 className="font-semibold text-foreground mb-3">Recent Files</h2>
          <div className="space-y-2">
            {files.slice(0, 3).map((file) => (
              <div key={file.id as string} className="flex items-center gap-3 text-sm">
                <FileText className="w-4 h-4 text-muted" />
                <span className="flex-1 truncate">{file.file_name as string}</span>
                <a
                  href={file.file_url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:underline"
                  style={{ color: brandColor }}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// --- Portal Files ---
function PortalFilesTab({
  clientId,
  files,
  token,
}: {
  clientId: string;
  files: Record<string, string | number>[];
  token: string;
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
        uploaded_by: 'client',
        file_name: file.name,
        file_url: publicUrl,
        storage_path: filePath,
        file_size: file.size,
      });

      await supabase.from('activities').insert({
        client_id: clientId,
        actor: 'client',
        action: `Uploaded "${file.name}"`,
      });

      router.refresh();
    }
    setUploading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Files</h2>
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          <span className="inline-flex items-center justify-center rounded-lg font-medium text-sm px-3 py-1.5 bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload file'}
          </span>
        </label>
      </div>

      {files.length === 0 ? (
        <EmptyState icon={FileText} title="No files yet" description="Files shared with you will appear here." />
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.id as string} className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{file.file_name as string}</div>
                  <div className="text-xs text-muted">
                    {formatFileSize(file.file_size as number)} · {formatDate(file.created_at as string)}
                  </div>
                </div>
                <a
                  href={file.file_url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Portal Messages ---
function PortalMessagesTab({
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
      sender: 'client',
      content: content.trim(),
    });

    await supabase.from('activities').insert({
      client_id: clientId,
      actor: 'client',
      action: 'Sent a message',
    });

    setContent('');
    setSending(false);
    router.refresh();
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">No messages yet.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    msg.sender === 'client'
                      ? 'bg-accent text-white rounded-br-md'
                      : 'bg-foreground/10 text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'client' ? 'text-white/60' : 'text-muted'}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={sendMessage} className="border-t border-border p-3 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-input text-foreground text-sm focus:border-accent focus:outline-none"
          />
          <Button type="submit" size="sm" loading={sending} disabled={!content.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// --- Portal Documents ---
function PortalDocumentsTab({
  clientId,
  documentRequests,
  token,
}: {
  clientId: string;
  documentRequests: Record<string, string | { id: string; label: string; completed: boolean; file_url: string | null; file_name: string | null }[]>[];
  token: string;
}) {
  const router = useRouter();
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);

  const handleDocUpload = async (
    requestId: string,
    itemId: string,
    file: File,
    currentItems: { id: string; label: string; completed: boolean; file_url: string | null; file_name: string | null }[]
  ) => {
    setUploadingItem(itemId);
    const supabase = createClient();
    const filePath = `${clientId}/docs/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('client-files')
      .upload(filePath, file);

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('client-files').getPublicUrl(filePath);

      const updatedItems = currentItems.map((item) =>
        item.id === itemId
          ? { ...item, completed: true, file_url: publicUrl, file_name: file.name }
          : item
      );

      await supabase
        .from('document_requests')
        .update({ items: updatedItems })
        .eq('id', requestId);

      await supabase.from('activities').insert({
        client_id: clientId,
        actor: 'client',
        action: `Uploaded document "${file.name}"`,
      });

      router.refresh();
    }
    setUploadingItem(null);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">Document Requests</h2>

      {documentRequests.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No documents requested"
          description="When your service provider requests documents, they'll appear here."
        />
      ) : (
        <div className="space-y-6">
          {documentRequests.map((req) => {
            const items = (req.items || []) as { id: string; label: string; completed: boolean; file_url: string | null; file_name: string | null }[];
            const completed = items.filter((i) => i.completed).length;
            return (
              <Card key={req.id as string}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{req.title as string}</h3>
                  <Badge variant={completed === items.length ? 'success' : 'warning'}>
                    {completed}/{items.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border"
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          item.completed
                            ? 'bg-success border-success'
                            : 'border-border'
                        }`}
                      >
                        {item.completed && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${item.completed ? 'text-muted' : 'text-foreground'}`}>
                          {item.label}
                        </div>
                        {item.file_name && (
                          <div className="text-xs text-success mt-0.5">{item.file_name}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.completed && item.file_url && (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-lg font-medium text-sm px-3 py-1.5 text-accent hover:bg-accent/10 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 mr-1" />
                            Download
                          </a>
                        )}
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDocUpload(req.id as string, item.id, file, items);
                            }}
                            disabled={uploadingItem === item.id}
                          />
                          <span className="inline-flex items-center justify-center rounded-lg font-medium text-sm px-3 py-1.5 bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border transition-colors">
                            <Upload className="w-3.5 h-3.5 mr-1" />
                            {uploadingItem === item.id ? 'Uploading...' : item.completed ? 'Replace' : 'Upload'}
                          </span>
                        </label>
                      </div>
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

// --- Portal Payments ---
function PortalPaymentsTab({
  paymentLinks,
}: {
  paymentLinks: Record<string, string | number | null>[];
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">Payments</h2>

      {paymentLinks.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments"
          description="Payment requests from your service provider will appear here."
        />
      ) : (
        <div className="space-y-3">
          {paymentLinks.map((link) => (
            <Card key={link.id as string} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-lg font-bold text-foreground">
                    {formatCurrency(link.amount as number)}
                  </div>
                  <div className="text-sm text-muted">{link.description as string}</div>
                  <div className="text-xs text-muted mt-1">
                    {formatDate(link.created_at as string)}
                  </div>
                </div>
                {link.status === 'paid' ? (
                  <Badge variant="success">Paid</Badge>
                ) : (
                  <Button size="sm">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay now
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
