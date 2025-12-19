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

// Helper for JSON responses with error handling
const handleResponse = async (res: Response, fallback: any = {}) => {
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        console.error('API Error:', { status: res.status, error });
        return fallback;
    }
    return res.json();
};

const fetchOptions = (method: string = 'GET', body?: any): RequestInit => ({
    method,
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...(body ? { body: JSON.stringify(body) } : {}),
});

// Users API
export const api = {
    // Users
    getUsers: async (): Promise<User[]> => {
        const res = await fetch(`${API_BASE}/users`, fetchOptions());
        return handleResponse(res, []);
    },

    createUser: async (data: { email: string; name: string }): Promise<User> => {
        const res = await fetch(`${API_BASE}/users`, fetchOptions('POST', data));
        return handleResponse(res);
    },

    // Groups
    getGroups: async (): Promise<Group[]> => {
        const res = await fetch(`${API_BASE}/groups`, fetchOptions());
        return handleResponse(res, []);
    },

    createGroup: async (data: { name: string; description?: string }): Promise<Group> => {
        const res = await fetch(`${API_BASE}/groups`, fetchOptions('POST', data));
        return handleResponse(res);
    },

    addMember: async (groupId: string, userId: string, _actorId: string): Promise<void> => {
        // actorId is now taken from session cookie in backend
        await fetch(`${API_BASE}/groups/${groupId}/members`, fetchOptions('POST', { userId, role: 'member' }));
    },

    removeMember: async (groupId: string, userId: string, _actorId: string): Promise<void> => {
        await fetch(`${API_BASE}/groups/${groupId}/members/${userId}`, fetchOptions('DELETE'));
    },

    // Documents
    getDocuments: async (): Promise<Document[]> => {
        const res = await fetch(`${API_BASE}/documents`, fetchOptions());
        return handleResponse(res, []);
    },

    createDocument: async (data: { title: string; content?: string; folderId?: string }, _userId: string): Promise<Document> => {
        const res = await fetch(`${API_BASE}/documents`, fetchOptions('POST', data));
        return handleResponse(res);
    },

    getDocument: async (id: string, _userId: string): Promise<Document | { statusCode: number }> => {
        const res = await fetch(`${API_BASE}/documents/${id}`, fetchOptions());
        return handleResponse(res);
    },

    shareDocument: async (
        docId: string,
        share: { userId?: string; groupId?: string; relation: 'viewer' | 'editor' },
        _actorId: string
    ): Promise<{ success: boolean; relation: string }> => {
        const res = await fetch(`${API_BASE}/documents/${docId}/share`, fetchOptions('POST', share));
        return handleResponse(res);
    },

    getDocumentAccess: async (docId: string, _userId: string): Promise<AccessList> => {
        const res = await fetch(`${API_BASE}/documents/${docId}/access`, fetchOptions());
        return handleResponse(res, { owners: [], editors: [], viewers: [] });
    },

    checkDocumentAccess: async (docId: string, relation: string, userId: string): Promise<{ allowed: boolean }> => {
        const res = await fetch(`${API_BASE}/documents/${docId}/check/${relation}?userId=${userId}`, fetchOptions());
        return handleResponse(res, { allowed: false });
    },

    // Folders
    getFolders: async (): Promise<Folder[]> => {
        const res = await fetch(`${API_BASE}/folders`, fetchOptions());
        return handleResponse(res, []);
    },

    createFolder: async (data: { name: string; description?: string; parentId?: string }, _userId: string): Promise<Folder> => {
        const res = await fetch(`${API_BASE}/folders`, fetchOptions('POST', data));
        return handleResponse(res);
    },

    shareFolder: async (
        folderId: string,
        share: { userId?: string; groupId?: string; relation: 'viewer' | 'editor' },
        _actorId: string
    ): Promise<{ success: boolean }> => {
        const res = await fetch(`${API_BASE}/folders/${folderId}/share`, fetchOptions('POST', share));
        return handleResponse(res);
    },

    unshareFolder: async (
        folderId: string,
        share: { userId?: string; groupId?: string; relation: 'viewer' | 'editor' },
        _actorId: string
    ): Promise<{ success: boolean }> => {
        const res = await fetch(`${API_BASE}/folders/${folderId}/share`, {
            ...fetchOptions('DELETE', share),
        });
        return handleResponse(res);
    },

    getFolderAccess: async (folderId: string, _userId: string): Promise<AccessList> => {
        const res = await fetch(`${API_BASE}/folders/${folderId}/access`, fetchOptions());
        return handleResponse(res, { owners: [], editors: [], viewers: [] });
    },

    checkFolderAccess: async (folderId: string, relation: string, _userId: string): Promise<{ allowed: boolean }> => {
        const res = await fetch(`${API_BASE}/folders/${folderId}/check/${relation}`, fetchOptions());
        return handleResponse(res, { allowed: false });
    },
};
