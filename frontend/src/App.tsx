import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Users,
  FileText,
  FlaskConical,
  Lock,
  LogOut,
  Package,
  Search,
  Link,
  CheckCircle,
  XCircle,
  GraduationCap,
  Lightbulb,
} from 'lucide-react';
import './index.css';
import { api, type User as UserType, type Group, type Document, type Folder as FolderType } from './api';
import { AuthProvider, useAuth } from './AuthContext';
import { AuthRoute } from './components/AuthRoute';
import { Login } from './pages/Login';
import { Registration } from './pages/Registration';

function MainApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'groups' | 'documents' | 'folders' | 'playground'>('dashboard');
  const [users, setUsers] = useState<UserType[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [_dataLoading, setDataLoading] = useState(true);
  const { session, loading: authLoading, logout } = useAuth();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [usersData, groupsData, docsData, foldersData] = await Promise.all([
        api.getUsers(),
        api.getGroups(),
        api.getDocuments(),
        api.getFolders(),
      ]);

      const validatedUsers = Array.isArray(usersData) ? usersData : [];
      const validatedGroups = Array.isArray(groupsData) ? groupsData : [];
      const validatedDocs = Array.isArray(docsData) ? docsData : [];
      const validatedFolders = Array.isArray(foldersData) ? foldersData : [];

      setUsers(validatedUsers);
      setGroups(validatedGroups);
      setDocuments(validatedDocs);
      setFolders(validatedFolders);

      if (session?.identity) {
        const identityId = session.identity.id;
        const matched = validatedUsers.find(u => u.id === identityId);
        const traits = (session.identity.traits as any) || {};
        const email = traits.email || 'no-email@example.com';
        const name = traits.name || email.split('@')[0] || 'User';

        setCurrentUser(matched || {
          id: identityId,
          email,
          name,
          createdAt: session.identity.created_at || new Date().toISOString(),
          updatedAt: session.identity.updated_at || new Date().toISOString()
        } as any);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setDataLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    fetchData();
  }, [session, authLoading]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: User },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'playground', label: 'Playground', icon: FlaskConical },
  ] as const;

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Lock size={20} />
          </div>
          <h1>Keto Learn</h1>
        </div>

        <nav>
          <ul className="sidebar-nav">
            {navItems.map(item => (
              <li
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="nav-icon">
                  <item.icon size={20} />
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {currentUser?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser?.name || 'Guest'}</span>
              <span className="user-id">ID: {currentUser?.id ? `${currentUser.id.slice(0, 8)}...` : 'N/A'}</span>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '0.5rem' }} onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && <DashboardView users={users} groups={groups} documents={documents} />}
        {activeTab === 'users' && <UsersView users={users} onRefresh={fetchData} showToast={showToast} />}
        {activeTab === 'groups' && <GroupsView groups={groups} users={users} currentUser={currentUser} onRefresh={fetchData} showToast={showToast} />}
        {activeTab === 'documents' && <DocumentsView documents={documents} users={users} groups={groups} folders={folders} currentUser={currentUser} onRefresh={fetchData} showToast={showToast} />}
        {activeTab === 'playground' && <PlaygroundView documents={documents} users={users} currentUser={currentUser} />}
      </main>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route element={<AuthRoute />}>
            <Route path="/*" element={<MainApp />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Dashboard View
function DashboardView({ users, groups, documents }: { users: UserType[]; groups: Group[]; documents: Document[] }) {
  return (
    <div>
      <div className="page-header">
        <h2><GraduationCap size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Ory Keto Learning Dashboard</h2>
        <p>Learn Relationship-Based Access Control (ReBAC) through interactive examples</p>
      </div>

      <div className="grid grid-4">
        <div className="card">
          <h3 style={{ fontSize: '2rem', color: 'var(--accent-blue)' }}>{users.length}</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Users</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '2rem', color: 'var(--accent-purple)' }}>{groups.length}</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Groups</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '2rem', color: 'var(--accent-green)' }}>{documents.length}</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Documents</p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="concept-card">
          <h4><Package size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Relation Tuple</h4>
          <p>The core data structure in Keto:</p>
          <div className="relation-tuple" style={{ marginTop: '0.5rem' }}>
            <span className="tuple-namespace">Document</span>:
            <span className="tuple-object">readme.md</span>#
            <span className="tuple-relation">viewer</span>@
            <span className="tuple-subject">User:alice</span>
          </div>
        </div>

        <div className="concept-card">
          <h4><Search size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Permission Check</h4>
          <p>Ask Keto questions like:</p>
          <code style={{ display: 'block', marginTop: '0.5rem' }}>
            "Does User:alice have view permission on Document:readme.md?"
          </code>
        </div>

        <div className="concept-card">
          <h4><Users size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Subject Sets</h4>
          <p>Grant permissions to groups:</p>
          <div className="relation-tuple" style={{ marginTop: '0.5rem' }}>
            <span className="tuple-namespace">Document</span>:spec#
            <span className="tuple-relation">viewer</span>@
            <span className="tuple-subject">Group:engineers#member</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Users View
function UsersView({ users, onRefresh, showToast }: { users: UserType[]; onRefresh: () => void; showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name || !email) return;
    setCreating(true);
    try {
      await api.createUser({ name, email });
      setName('');
      setEmail('');
      showToast('User created!');
      onRefresh();
    } catch (e) {
      showToast('Failed to create user', 'error');
    }
    setCreating(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2><User size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Users</h2>
        <p>Users are the subjects in permission checks</p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Create User</span>
        </div>
        <div className="grid grid-3" style={{ alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Alice" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email</label>
            <input className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="alice@example.com" />
          </div>
          <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
            {creating ? 'Creating...' : '+ Create User'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Users ({users.length})</span>
        </div>
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><User size={48} /></div>
            <p>No users yet. Create your first user above!</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td><code style={{ fontSize: '0.75rem' }}>{user.id}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Groups View
function GroupsView({ groups, users, currentUser, onRefresh, showToast }: { groups: Group[]; users: UserType[]; currentUser: UserType | null; onRefresh: () => void; showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [name, setName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [memberUserId, setMemberUserId] = useState('');

  const handleCreateGroup = async () => {
    if (!name) return;
    await api.createGroup({ name });
    setName('');
    showToast('Group created!');
    onRefresh();
  };

  const handleAddMember = async () => {
    if (!selectedGroup || !memberUserId || !currentUser) return;
    try {
      await api.addMember(selectedGroup, memberUserId, currentUser.id);
      setMemberUserId('');
      showToast('Member added! Keto relation created.');
      onRefresh();
    } catch {
      showToast('Failed to add member', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2><Users size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Groups</h2>
        <p>Groups enable team-based access using Subject Sets</p>
      </div>

      <div className="concept-card">
        <h4><Lightbulb size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Concept: Subject Sets</h4>
        <p>When you add a member to a group, a relation is created in Keto:</p>
        <div className="relation-tuple" style={{ marginTop: '0.5rem' }}>
          <span className="tuple-namespace">Group</span>:
          <span className="tuple-object">[groupId]</span>#
          <span className="tuple-relation">member</span>@
          <span className="tuple-subject">User:[userId]</span>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Create Group</span>
          </div>
          <div className="form-group">
            <label className="form-label">Group Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Engineering Team" />
          </div>
          <button className="btn btn-primary" onClick={handleCreateGroup}>+ Create Group</button>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Add Member</span>
          </div>
          <div className="form-group">
            <label className="form-label">Select Group</label>
            <select className="form-select" value={selectedGroup || ''} onChange={e => setSelectedGroup(e.target.value)}>
              <option value="">Choose a group...</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Select User</label>
            <select className="form-select" value={memberUserId} onChange={e => setMemberUserId(e.target.value)}>
              <option value="">Choose a user...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <button className="btn btn-success" onClick={handleAddMember} disabled={!currentUser}>
            + Add to Group
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Groups ({groups.length})</span>
        </div>
        {groups.map(group => (
          <div key={group.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <strong>{group.name}</strong>
            <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>
              {group.members?.length || 0} members
            </span>
            <div style={{ marginTop: '0.5rem' }}>
              {group.members?.map(m => (
                <span key={m.user.id} className="badge badge-member" style={{ marginRight: '0.5rem' }}>
                  {m.user.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Documents View
function DocumentsView({ documents, users, groups, folders, currentUser, onRefresh, showToast }: { documents: Document[]; users: UserType[]; groups: Group[]; folders: FolderType[]; currentUser: UserType | null; onRefresh: () => void; showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [title, setTitle] = useState('');
  const [folderId, setFolderId] = useState('');
  const [shareDocId, setShareDocId] = useState('');
  const [shareUserId, setShareUserId] = useState('');
  const [shareGroupId, setShareGroupId] = useState('');
  const [shareRelation, setShareRelation] = useState<'viewer' | 'editor'>('viewer');

  const handleCreate = async () => {
    if (!title || !currentUser) return;
    await api.createDocument({ title, folderId: folderId || undefined }, currentUser.id);
    setTitle('');
    setFolderId('');
    showToast('Document created! You are now the owner.');
    onRefresh();
  };

  const handleShare = async () => {
    if (!shareDocId || !currentUser || (!shareUserId && !shareGroupId)) return;
    try {
      const result = await api.shareDocument(
        shareDocId,
        { userId: shareUserId || undefined, groupId: shareGroupId || undefined, relation: shareRelation },
        currentUser.id
      );
      showToast(`Shared! Relation: ${result.relation}`);
      setShareDocId('');
      setShareUserId('');
      setShareGroupId('');
    } catch {
      showToast('Failed to share (are you the owner?)', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2><FileText size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Documents</h2>
        <p>Documents are protected resources with permission checks</p>
      </div>

      <div className="concept-card">
        <h4><Lightbulb size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Concept: Owner & Sharing</h4>
        <p>When you create a document, you become the owner. Only owners can share.</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <div className="relation-tuple">
            <span className="tuple-namespace">Document</span>:doc#<span className="tuple-relation">owner</span>@<span className="tuple-subject">User:you</span>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Create Document</span></div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Project Roadmap" />
          </div>
          <div className="form-group">
            <label className="form-label">Folder (optional)</label>
            <select className="form-select" value={folderId} onChange={e => setFolderId(e.target.value)}>
              <option value="">No folder</option>
              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleCreate} disabled={!currentUser}>+ Create</button>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Share Document</span></div>
          <div className="form-group">
            <label className="form-label">Select Document</label>
            <select className="form-select" value={shareDocId} onChange={e => setShareDocId(e.target.value)}>
              <option value="">Choose...</option>
              {documents.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Share with User OR Group</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select className="form-select" value={shareUserId} onChange={e => { setShareUserId(e.target.value); setShareGroupId(''); }}>
                <option value="">User...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <select className="form-select" value={shareGroupId} onChange={e => { setShareGroupId(e.target.value); setShareUserId(''); }}>
                <option value="">Group...</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Permission Level</label>
            <select className="form-select" value={shareRelation} onChange={e => setShareRelation(e.target.value as any)}>
              <option value="viewer">Viewer (read only)</option>
              <option value="editor">Editor (read + write)</option>
            </select>
          </div>
          <button className="btn btn-success" onClick={handleShare} disabled={!currentUser}>
            <Link size={16} /> Share
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">All Documents ({documents.length})</span></div>
        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FileText size={48} /></div>
            <p>No documents yet. Create one above!</p>
          </div>
        ) : (
          <table className="table">
            <thead><tr><th>Title</th><th>Owner</th><th>Folder</th></tr></thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td><strong>{doc.title}</strong></td>
                  <td><span className="badge badge-owner">{doc.owner?.name || doc.ownerId.slice(0, 8)}</span></td>
                  <td>{doc.folder?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Permission Playground
function PlaygroundView({ documents, users, currentUser: _currentUser }: { documents: Document[]; users: UserType[]; currentUser: UserType | null }) {
  const [selectedDoc, setSelectedDoc] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [relation, setRelation] = useState('view');
  const [result, setResult] = useState<{ allowed: boolean; check: string } | null>(null);
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    if (!selectedDoc || !selectedUser) return;
    setChecking(true);
    try {
      const res = await api.checkDocumentAccess(selectedDoc, relation, selectedUser);
      setResult({ allowed: res.allowed, check: `Document:${selectedDoc.slice(0, 8)}...#${relation}@User:${selectedUser.slice(0, 8)}...` });
    } catch {
      setResult({ allowed: false, check: 'Error checking permission' });
    }
    setChecking(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2><FlaskConical size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Permission Playground</h2>
        <p>Test permission checks in real-time against Ory Keto</p>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Test a Permission Check</span></div>
        <div className="grid grid-4" style={{ alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Document</label>
            <select className="form-select" value={selectedDoc} onChange={e => setSelectedDoc(e.target.value)}>
              <option value="">Select...</option>
              {documents.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">User</label>
            <select className="form-select" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
              <option value="">Select...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Permission</label>
            <select className="form-select" value={relation} onChange={e => setRelation(e.target.value)}>
              <option value="view">view</option>
              <option value="edit">edit</option>
              <option value="delete">delete</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleCheck} disabled={checking}>
            <Search size={16} /> {checking ? 'Checking...' : 'Check'}
          </button>
        </div>

        {result && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Query: <code>{result.check}</code>
            </div>
            <div className={result.allowed ? 'status-allowed' : 'status-denied'} style={{ fontSize: '1.25rem' }}>
              {result.allowed ? <><CheckCircle size={24} /> ALLOWED</> : <><XCircle size={24} /> DENIED</>}
            </div>
          </div>
        )}
      </div>

      <div className="concept-card">
        <h4><Lightbulb size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Try This Exercise</h4>
        <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Create two users (Alice and Bob)</li>
          <li>As Alice, create a document</li>
          <li>Check if Bob can view it → Denied</li>
          <li>Share the document with Bob as viewer</li>
          <li>Check again → Allowed!</li>
        </ol>
      </div>
    </div>
  );
}

export default App;
