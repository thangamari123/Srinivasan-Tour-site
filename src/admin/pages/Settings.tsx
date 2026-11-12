import { useState } from 'react';
import { CheckCircle2, CircleAlert, CloudUpload, DatabaseZap, Loader2, Plus, ShieldCheck, Trash2, UserCog } from 'lucide-react';
import { COLLECTIONS } from '../../lib/firebaseConfig';
import { MEDIA_API_URL, isMediaApiConfigured } from '../../lib/api';
import { backend } from '../data/backend';
import { useCollection } from '../hooks/useCollection';
import { useActor } from '../hooks/useUploader';
import { useAuth } from '../context/auth';
import { useConfirm, useToast } from '../context/feedback';
import { errorMessage, logActivity } from '../services/content';
import { importLegacyContent } from '../services/importLegacy';
import { migrateFirestoreImagesToR2 } from '../services/migrateR2Firestore';
import { Badge, Button, Card, CardHeader, EmptyState, ErrorBanner, IconButton, Modal, PageHeader, SelectInput, Table, TableSkeleton, Td, TextInput, Th } from '../ui';
import type { AdminRole, AdminUser } from '../../types/content';

export default function Settings() {
  const { isFullAdmin, user } = useAuth();

  return (
    <>
      <PageHeader title="Settings" description="System status, admin users and content import." />
      <div className="space-y-6">
        <SystemStatus />
        {isFullAdmin ? (
          <>
            <AdminUsers currentUid={user?.uid ?? ''} />
            <MigrateImagesToR2 />
            <ImportContent />
          </>
        ) : (
          <Card>
            <EmptyState icon={ShieldCheck} title="Admin role required" description="Only users with the Admin role can manage users and import content." />
          </Card>
        )}
      </div>
    </>
  );
}

function SystemStatus() {
  const [health, setHealth] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle');
  const [fbHealth, setFbHealth] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle');
  const [fbError, setFbError] = useState('');

  const check = async () => {
    setHealth('checking');
    setFbHealth('checking');
    setFbError('');
    await Promise.all([
      fetch(`${MEDIA_API_URL}/api/health`)
        .then((res) => setHealth(res.ok ? 'ok' : 'fail'))
        .catch(() => setHealth('fail')),
      backend()
        .list(COLLECTIONS.categories, { limit: 1 })
        .then(() => setFbHealth('ok'))
        .catch((err) => {
          setFbHealth('fail');
          setFbError(errorMessage(err));
        }),
    ]);
  };
  const Row = ({ ok, label, detail }: { ok: boolean; label: string; detail: string }) => (
    <li className="flex items-start gap-3 py-2">
      {ok ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <CircleAlert className="w-5 h-5 text-amber-500 shrink-0" />}
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500 break-all">{detail}</p>
      </div>
    </li>
  );
  return (
    <Card>
      <CardHeader title="System status" />
      <ul className="divide-y divide-slate-100">
        {Row({
          ok: fbHealth !== 'fail',
          label: 'Firebase (Auth + Firestore)',
          detail: `Project: ${import.meta.env.VITE_FIREBASE_PROJECT_ID}${fbHealth === 'ok' ? ' · Firestore connected' : fbHealth === 'fail' ? ` · error: ${fbError}` : ''}`,
        })}
        {Row({
          ok: isMediaApiConfigured && health !== 'fail',
          label: 'Media API (Cloudflare Worker + R2)',
          detail: isMediaApiConfigured
            ? `${MEDIA_API_URL}${health === 'ok' ? ' · reachable' : health === 'fail' ? ' · NOT reachable' : ''}`
            : 'VITE_MEDIA_API_URL is not set — image uploads are disabled',
        })}
      </ul>
      <Button size="sm" variant="secondary" className="mt-3" onClick={check} loading={health === 'checking' || fbHealth === 'checking'}>
        Test connections
      </Button>
    </Card>
  );
}

function AdminUsers({ currentUid }: { currentUid: string }) {
  const actor = useActor();
  const toast = useToast();
  const confirm = useConfirm();
  const { data, loading, error, reload } = useCollection<AdminUser>(COLLECTIONS.admins);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ uid: '', email: '', name: '', role: 'editor' as AdminRole });
  const [saving, setSaving] = useState(false);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  const add = async () => {
    if (saving) return;
    const uid = form.uid.trim();
    const email = form.email.trim();
    if (!uid || !email) {
      toast('UID and email are required', 'error');
      return;
    }
    if (/[/?#\s]/.test(uid)) {
      toast('Firebase User UID cannot contain spaces or / ? # characters', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast('Enter a valid email address', 'error');
      return;
    }
    if (data.some((existing) => existing.id === uid)) {
      toast('An admin record for this Firebase UID already exists', 'error');
      return;
    }
    setSaving(true);
    try {
      await backend().set(COLLECTIONS.admins, uid, {
        email,
        name: form.name.trim(),
        role: form.role,
        active: true,
        createdAt: backend().timestamp(),
      });
      await logActivity(actor, 'create', COLLECTIONS.admins, uid, email);
      toast('Admin user added');
      setAdding(false);
      setForm({ uid: '', email: '', name: '', role: 'editor' });
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const update = async (a: AdminUser, patch: Partial<AdminUser>) => {
    if (busyUid) return;
    setBusyUid(a.id);
    try {
      await backend().update(COLLECTIONS.admins, a.id, patch);
      await logActivity(actor, 'update', COLLECTIONS.admins, a.id, a.email);
      toast('Admin user updated');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyUid(null);
    }
  };

  const remove = async (a: AdminUser) => {
    if (busyUid) return;
    if (!(await confirm({ title: 'Remove admin access?', message: `${a.email} will no longer be able to sign in to the admin panel. Their Firebase login itself is not deleted.`, confirmLabel: 'Remove access', danger: true }))) return;
    setBusyUid(a.id);
    try {
      await backend().remove(COLLECTIONS.admins, a.id);
      await logActivity(actor, 'delete', COLLECTIONS.admins, a.id, a.email);
      toast('Admin access removed');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyUid(null);
    }
  };

  return (
    <Card padded={false}>
      <div className="px-5 sm:px-6 pt-5">
        <CardHeader
          title="Admin users"
          description="Admins have full access. Editors can create and edit content and upload images, but cannot delete or change settings."
          action={<Button size="sm" icon={Plus} onClick={() => setAdding(true)}>Add user</Button>}
        />
      </div>
      {error && <div className="px-5 pb-4"><ErrorBanner message={error} onRetry={reload} /></div>}
      {loading ? (
        <TableSkeleton rows={2} cols={3} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Access</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((a) => {
              const self = a.id === currentUid;
              const busy = busyUid === a.id;
              return (
                <tr key={a.id}>
                  <Td>
                    <p className="font-medium text-slate-900">{a.name || a.email}</p>
                    <p className="text-xs text-slate-500">{a.email}{self && ' · you'}</p>
                  </Td>
                  <Td>
                    <select
                      value={a.role}
                      disabled={self || busy}
                      onChange={(e) => update(a, { role: e.target.value as AdminRole })}
                      aria-label="Role"
                      className="rounded-lg border border-slate-200 px-2 py-1 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                    </select>
                  </Td>
                  <Td>
                    <button type="button" disabled={self || busy} onClick={() => update(a, { active: !a.active })} className="disabled:cursor-not-allowed">
                      {a.active ? <Badge tone="green">Active</Badge> : <Badge tone="red">Disabled</Badge>}
                    </button>
                  </Td>
                  <Td className="text-right">{!self && <IconButton icon={Trash2} label="Remove access" tone="danger" onClick={() => remove(a)} disabled={busy} />}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <Modal
        open={adding}
        onClose={() => !saving && setAdding(false)}
        title="Add admin user"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdding(false)} disabled={saving}>Cancel</Button>
            <Button onClick={add} loading={saving} icon={UserCog}>Grant access</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 leading-relaxed">
            Public sign-up is disabled. First create the login in <strong>Firebase Console → Authentication → Users → Add user</strong>, then copy its
            <strong> User UID</strong> here.
          </div>
          <TextInput label="Firebase User UID" required value={form.uid} onChange={(e) => setForm({ ...form, uid: e.target.value })} />
          <TextInput label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextInput label="Display name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <SelectInput label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </SelectInput>
        </div>
      </Modal>
    </Card>
  );
}

function MigrateImagesToR2() {
  const actor = useActor();
  const toast = useToast();
  const confirm = useConfirm();
  const [running, setRunning] = useState(false);

  const run = async () => {
    if (running) return;
    const ok = await confirm({
      title: 'Migrate Firestore image URLs to Cloudflare R2?',
      message:
        'This updates any remaining local /images/... paths in tourPackages, categories, destinations and homepage documents to their verified Cloudflare R2 Worker URLs, updates mediaRefs, and registers migrated assets in the Media Library. Safe to run multiple times.',
      confirmLabel: 'Migrate URLs',
    });
    if (!ok) return;
    setRunning(true);
    try {
      const s = await migrateFirestoreImagesToR2(actor);
      const total = s.updatedDocs + s.mediaCreated;
      toast(
        total
          ? `Updated ${s.updatedDocs} Firestore documents and registered ${s.mediaCreated} media items in R2`
          : 'All Firestore documents and Media Library records are already using R2 URLs',
        total ? 'success' : 'info',
      );
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Sync Firestore image references to Cloudflare R2" description="Upgrades legacy /images/... fields in Firestore to verified Worker R2 URLs and registers them in the Media Library." />
      <Button icon={running ? Loader2 : CloudUpload} onClick={run} loading={running} variant="secondary">
        Sync R2 image URLs
      </Button>
    </Card>
  );
}

function ImportContent() {
  const actor = useActor();
  const toast = useToast();
  const confirm = useConfirm();
  const [running, setRunning] = useState(false);

  const run = async () => {
    if (running) return;
    const ok = await confirm({
      title: 'Import existing website content?',
      message:
        'This copies the packages, categories, testimonials and homepage text that are currently built into the website code into Firestore, so you can edit them here. Anything that already exists (same slug / section) is skipped — nothing is overwritten.',
      confirmLabel: 'Import',
    });
    if (!ok) return;
    setRunning(true);
    try {
      const s = await importLegacyContent(actor);
      const total = s.packages + s.categories + s.testimonials + s.homepageSections;
      toast(
        total
          ? `Imported ${s.packages} packages, ${s.categories} categories, ${s.testimonials} testimonials and ${s.homepageSections} homepage sections`
          : 'Everything is already imported — nothing to do',
        total ? 'success' : 'info',
      );
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Import existing website content" description="Run once after setting up Firebase, before deploying the Firebase-enabled website." />
      <p className="text-sm text-slate-600 mb-4">
        Existing package images stay where they are (served from the website’s <code className="px-1 rounded bg-slate-100">/images</code> folder). New uploads go to Cloudflare R2.
      </p>
      <Button icon={running ? Loader2 : DatabaseZap} onClick={run} loading={running} variant="secondary">
        Import content
      </Button>
    </Card>
  );
}
