import { useState, useEffect } from 'react';
import './index.css';
import { api, type User, type Group, type Document, type Folder } from './api';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'groups' | 'documents' | 'folders' | 'playground'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [_loading, setLoading] = useState(true);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, groupsData, docsData, foldersData] = await Promise.all([
        api.getUsers(),
        api.getGroups(),
        api.getDocuments(),
        api.getFolders(),
      ]);
      setUsers(usersData);
      setGroups(groupsData);
      setDocuments(docsData);
      setFolders(foldersData);
      if (!currentUser && usersData.length > 0) {
        setCurrentUser(usersData[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👤' },
    { id: 'groups', label: 'Groups', icon: '👥' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    // { id: 'folders', label: 'Folders', icon: '📁' },  // Hidden for now
    { id: 'playground', label: 'Permission Playground', icon: '🧪' },
  ] as const;

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🔐</div>
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
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </nav>

        {/* Current User Selector */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <label className="form-label">Acting as:</label>
          <select
            className="form-select"
            value={currentUser?.id || ''}
            onChange={(e) => setCurrentUser(users.find(u => u.id === e.target.value) || null)}
          >
            <option value="">Select a user...</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
          {currentUser && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              ID: <code style={{ fontSize: '0.7rem' }}>{currentUser.id.slice(0, 8)}...</code>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && <DashboardView users={users} groups={groups} documents={documents} folders={folders} />}
        {activeTab === 'users' && <UsersView users={users} onRefresh={fetchData} showToast={showToast} />}
        {activeTab === 'groups' && <GroupsView groups={groups} users={users} currentUser={currentUser} onRefresh={fetchData} showToast={showToast} />}
        {activeTab === 'documents' && <DocumentsView documents={documents} users={users} groups={groups} folders={folders} currentUser={currentUser} onRefresh={fetchData} showToast={showToast} />}
        {/* {activeTab === 'folders' && <FoldersView folders={folders} users={users} groups={groups} currentUser={currentUser} onRefresh={fetchData} showToast={showToast} />} */}
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

// Dashboard View
function DashboardView({ users, groups, documents, folders }: { users: User[]; groups: Group[]; documents: Document[]; folders: Folder[] }) {
  return (
    <div>
      <div className="page-header">
        <h2>🎓 Ory Keto Learning Dashboard</h2>
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
        {/* <div className="card">
          <h3 style={{ fontSize: '2rem', color: 'var(--accent-orange)' }}>{folders.length}</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Folders</p>
        </div> */}
      </div>

      <div className="grid grid-2">
        <div className="concept-card">
          <h4>📦 Relation Tuple</h4>
          <p>The core data structure in Keto:</p>
          <div className="relation-tuple" style={{ marginTop: '0.5rem' }}>
            <span className="tuple-namespace">Document</span>:
            <span className="tuple-object">readme.md</span>#
            <span className="tuple-relation">viewer</span>@
            <span className="tuple-subject">User:alice</span>
          </div>
        </div>

        <div className="concept-card">
          <h4>🔍 Permission Check</h4>
          <p>Ask Keto questions like:</p>
          <code style={{ display: 'block', marginTop: '0.5rem' }}>
            "Does User:alice have view permission on Document:readme.md?"
          </code>
        </div>

        <div className="concept-card">
          <h4>👥 Subject Sets</h4>
          <p>Grant permissions to groups:</p>
          <div className="relation-tuple" style={{ marginTop: '0.5rem' }}>
            <span className="tuple-namespace">Document</span>:spec#
            <span className="tuple-relation">viewer</span>@
            <span className="tuple-subject">Group:engineers#member</span>
          </div>
        </div>

        {/* <div className="concept-card">
          <h4>📁 Inheritance</h4>
          <p>Permissions flow through hierarchy:</p>
          <code style={{ display: 'block', marginTop: '0.5rem' }}>
            Folder access → Document access
          </code>
        </div> */}
      </div>
    </div>
  );
}

// Users View
function UsersView({ users, onRefresh, showToast }: { users: User[]; onRefresh: () => void; showToast: (msg: string, type?: 'success' | 'error') => void }) {
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
        <h2>👤 Users</h2>
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
            <div className="empty-state-icon">👤</div>
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
function GroupsView({ groups, users, currentUser, onRefresh, showToast }: { groups: Group[]; users: User[]; currentUser: User | null; onRefresh: () => void; showToast: (msg: string, type?: 'success' | 'error') => void }) {
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
        <h2>👥 Groups</h2>
        <p>Groups enable team-based access using Subject Sets</p>
      </div>

      <div className="concept-card">
        <h4>💡 Concept: Subject Sets</h4>
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
function DocumentsView({ documents, users, groups, folders, currentUser, onRefresh, showToast }: { documents: Document[]; users: User[]; groups: Group[]; folders: Folder[]; currentUser: User | null; onRefresh: () => void; showToast: (msg: string, type?: 'success' | 'error') => void }) {
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
        <h2>📄 Documents</h2>
        <p>Documents are protected resources with permission checks</p>
      </div>

      <div className="concept-card">
        <h4>💡 Concept: Owner & Sharing</h4>
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
            <label className="form-label">Folder (optional, for inheritance)</label>
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
          <button className="btn btn-success" onClick={handleShare} disabled={!currentUser}>🔗 Share</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">All Documents ({documents.length})</span></div>
        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
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

// Folders View
function FoldersView({ folders, users, groups, currentUser, onRefresh, showToast }: { folders: Folder[]; users: User[]; groups: Group[]; currentUser: User | null; onRefresh: () => void; showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [shareFolderId, setShareFolderId] = useState('');
  const [shareUserId, setShareUserId] = useState('');
  const [shareGroupId, setShareGroupId] = useState('');
  const [shareRelation, setShareRelation] = useState<'viewer' | 'editor'>('viewer');

  const handleCreate = async () => {
    if (!name || !currentUser) return;
    await api.createFolder({ name, parentId: parentId || undefined }, currentUser.id);
    setName('');
    setParentId('');
    showToast('Folder created!');
    onRefresh();
  };

  const handleShare = async () => {
    if (!shareFolderId || !currentUser || (!shareUserId && !shareGroupId)) return;
    try {
      await api.shareFolder(
        shareFolderId,
        { userId: shareUserId || undefined, groupId: shareGroupId || undefined, relation: shareRelation },
        currentUser.id
      );
      showToast(`Folder shared as ${shareRelation}! All nested content is now accessible.`);
      setShareFolderId('');
      setShareUserId('');
      setShareGroupId('');
    } catch {
      showToast('Failed to share (are you the owner?)', 'error');
    }
  };

  const handleUnshare = async () => {
    if (!shareFolderId || !currentUser || (!shareUserId && !shareGroupId)) return;
    try {
      await api.unshareFolder(
        shareFolderId,
        { userId: shareUserId || undefined, groupId: shareGroupId || undefined, relation: shareRelation },
        currentUser.id
      );
      showToast('Access revoked!');
      setShareFolderId('');
      setShareUserId('');
      setShareGroupId('');
    } catch {
      showToast('Failed to revoke access', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>📁 Folders</h2>
        <p>Folders enable hierarchical permission inheritance</p>
      </div>

      <div className="concept-card">
        <h4>💡 Concept: Permission Inheritance</h4>
        <p>When you share a folder, all documents inside inherit the permission!</p>
        <div style={{ marginTop: '0.5rem', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
          /projects (shared with Bob) → /projects/spec.md (Bob can access!)
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Create Folder</span></div>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Projects" />
          </div>
          <div className="form-group">
            <label className="form-label">Parent Folder (optional)</label>
            <select className="form-select" value={parentId} onChange={e => setParentId(e.target.value)}>
              <option value="">Root (no parent)</option>
              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleCreate} disabled={!currentUser}>+ Create</button>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Share Folder</span></div>
          <div className="form-group">
            <label className="form-label">Select Folder</label>
            <select className="form-select" value={shareFolderId} onChange={e => setShareFolderId(e.target.value)}>
              <option value="">Choose...</option>
              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
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
            <select className="form-select" value={shareRelation} onChange={e => setShareRelation(e.target.value as 'viewer' | 'editor')}>
              <option value="viewer">Viewer (read only)</option>
              <option value="editor">Editor (read + write)</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-success" onClick={handleShare} disabled={!currentUser}>🔗 Share</button>
            <button className="btn btn-danger" onClick={handleUnshare} disabled={!currentUser}>🚫 Revoke</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">All Folders ({folders.length})</span></div>
        {folders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <p>No folders yet. Create one above!</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Owner</th>
                <th>Parent</th>
              </tr>
            </thead>
            <tbody>
              {folders.map(f => (
                <tr key={f.id}>
                  <td><span style={{ marginRight: '0.5rem' }}>📁</span><strong>{f.name}</strong></td>
                  <td><span className="badge badge-owner">{users.find(u => u.id === f.ownerId)?.name || f.ownerId.slice(0, 8)}</span></td>
                  <td>{folders.find(pf => pf.id === f.parentId)?.name || '-'}</td>
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
function PlaygroundView({ documents, users, currentUser: _currentUser }: { documents: Document[]; users: User[]; currentUser: User | null }) {
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
        <h2>🧪 Permission Playground</h2>
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
            {checking ? 'Checking...' : '🔍 Check Permission'}
          </button>
        </div>

        {result && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Query: <code>{result.check}</code>
            </div>
            <div className={result.allowed ? 'status-allowed' : 'status-denied'} style={{ fontSize: '1.25rem' }}>
              {result.allowed ? '✅ ALLOWED' : '❌ DENIED'}
            </div>
          </div>
        )}
      </div>

      <div className="concept-card">
        <h4>🎯 Try This Exercise</h4>
        <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Create two users (Alice and Bob)</li>
          <li>As Alice, create a document</li>
          <li>Check if Bob can view it → ❌ Denied</li>
          <li>Share the document with Bob as viewer</li>
          <li>Check again → ✅ Allowed!</li>
        </ol>
      </div>
    </div>
  );
}

export default App;
