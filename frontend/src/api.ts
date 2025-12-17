const API_BASE = 'http://localhost:3000';

export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
}

export interface Group {
    id: string;
    name: string;
    description?: string;
    members?: { user: User; role: string }[];
}

export interface Document {
    id: string;
    title: string;
    content?: string;
    folderId?: string;
    ownerId: string;
    owner?: User;
    folder?: Folder;
}

export interface Folder {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    ownerId: string;
}

export interface AccessList {
    owners: string[];
    editors: string[];
    viewers: string[];
}

// Helper to add user header
const withUser = (userId: string): RequestInit => ({
    headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
    },
});

// Users API
export const api = {
    // Users
    getUsers: async (): Promise<User[]> => {
        const res = await fetch(`${API_BASE}/users`);
        return res.json();
    },

    createUser: async (data: { email: string; name: string }): Promise<User> => {
        const res = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    // Groups
    getGroups: async (): Promise<Group[]> => {
        const res = await fetch(`${API_BASE}/groups`);
        return res.json();
    },

    createGroup: async (data: { name: string; description?: string }): Promise<Group> => {
        const res = await fetch(`${API_BASE}/groups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    addMember: async (groupId: string, userId: string, actorId: string): Promise<void> => {
        await fetch(`${API_BASE}/groups/${groupId}/members`, {
            method: 'POST',
            ...withUser(actorId),
            body: JSON.stringify({ userId, role: 'member' }),
        });
    },

    removeMember: async (groupId: string, userId: string, actorId: string): Promise<void> => {
        await fetch(`${API_BASE}/groups/${groupId}/members/${userId}`, {
            method: 'DELETE',
            ...withUser(actorId),
        });
    },

    // Documents
    getDocuments: async (): Promise<Document[]> => {
        const res = await fetch(`${API_BASE}/documents`);
        return res.json();
    },

    createDocument: async (data: { title: string; content?: string; folderId?: string }, userId: string): Promise<Document> => {
        const res = await fetch(`${API_BASE}/documents`, {
            method: 'POST',
            ...withUser(userId),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    getDocument: async (id: string, userId: string): Promise<Document | { statusCode: number }> => {
        const res = await fetch(`${API_BASE}/documents/${id}`, withUser(userId));
        return res.json();
    },

    shareDocument: async (
        docId: string,
        share: { userId?: string; groupId?: string; relation: 'viewer' | 'editor' },
        actorId: string
    ): Promise<{ success: boolean; relation: string }> => {
        const res = await fetch(`${API_BASE}/documents/${docId}/share`, {
            method: 'POST',
            ...withUser(actorId),
            body: JSON.stringify(share),
        });
        return res.json();
    },

    getDocumentAccess: async (docId: string, userId: string): Promise<AccessList> => {
        const res = await fetch(`${API_BASE}/documents/${docId}/access`, withUser(userId));
        return res.json();
    },

    checkDocumentAccess: async (docId: string, relation: string, userId: string): Promise<{ allowed: boolean }> => {
        const res = await fetch(`${API_BASE}/documents/${docId}/check/${relation}`, withUser(userId));
        return res.json();
    },

    // Folders
    getFolders: async (): Promise<Folder[]> => {
        const res = await fetch(`${API_BASE}/folders`);
        return res.json();
    },

    createFolder: async (data: { name: string; description?: string; parentId?: string }, userId: string): Promise<Folder> => {
        const res = await fetch(`${API_BASE}/folders`, {
            method: 'POST',
            ...withUser(userId),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    shareFolder: async (
        folderId: string,
        share: { userId?: string; groupId?: string; relation: 'viewer' | 'editor' },
        actorId: string
    ): Promise<{ success: boolean }> => {
        const res = await fetch(`${API_BASE}/folders/${folderId}/share`, {
            method: 'POST',
            ...withUser(actorId),
            body: JSON.stringify(share),
        });
        return res.json();
    },

    unshareFolder: async (
        folderId: string,
        share: { userId?: string; groupId?: string; relation: 'viewer' | 'editor' },
        actorId: string
    ): Promise<{ success: boolean }> => {
        const res = await fetch(`${API_BASE}/folders/${folderId}/share`, {
            method: 'DELETE',
            ...withUser(actorId),
            body: JSON.stringify(share),
        });
        return res.json();
    },

    getFolderAccess: async (folderId: string, userId: string): Promise<AccessList> => {
        const res = await fetch(`${API_BASE}/folders/${folderId}/access`, withUser(userId));
        return res.json();
    },

    checkFolderAccess: async (folderId: string, relation: string, userId: string): Promise<{ allowed: boolean }> => {
        const res = await fetch(`${API_BASE}/folders/${folderId}/check/${relation}`, withUser(userId));
        return res.json();
    },
};
