import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firebase } from './firebase';

// Mock Firebase SDK
vi.mock('firebase/app', () => ({
    initializeApp: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(),
    collection: vi.fn(),
    getDocs: vi.fn(),
    doc: vi.fn(),
    setDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/analytics', () => ({
    getAnalytics: vi.fn(),
    isSupported: vi.fn(() => Promise.resolve(false)),
}));

import * as firestore from 'firebase/firestore';

describe('QueryBuilder', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('filters with eq() correctly', async () => {
        const mockDocs = [{ id: '1', name: 'Test' }];
        (firestore.getDocs as any).mockResolvedValue({
            docs: mockDocs.map(d => ({ id: d.id, data: () => d }))
        });

        const result = await firebase.from('members').select().eq('role', 'admin');

        expect(firestore.where).toHaveBeenCalledWith('role', '==', 'admin');
        expect(result.data).toHaveLength(1);
        expect(result.data[0].name).toBe('Test');
    });

    it('handles single() correctly', async () => {
        const mockDocs = [{ id: '1', name: 'Test' }];
        (firestore.getDocs as any).mockResolvedValue({
            docs: mockDocs.map(d => ({ id: d.id, data: () => d }))
        });

        const result = await firebase.from('members').select().eq('id', '1').single();

        expect(result.data.name).toBe('Test');
        expect(Array.isArray(result.data)).toBe(false);
    });

    it('handles limit() correctly', async () => {
        (firestore.getDocs as any).mockResolvedValue({ docs: [] });

        await firebase.from('members').select().limit(5);

        expect(firestore.limit).toHaveBeenCalledWith(5);
    });

    it('inserts data correctly', async () => {
        (firestore.addDoc as any).mockResolvedValue({ id: 'new-id' });

        const data = { name: 'New Member' };
        const result = await firebase.from('members').insert(data);

        expect(firestore.addDoc).toHaveBeenCalled();
        expect(result.data.id).toBe('new-id');
    });

    it('updates data with eq(id) correctly', async () => {
        (firestore.updateDoc as any).mockResolvedValue({});

        const data = { name: 'Updated' };
        const result = await firebase.from('members').update(data).eq('id', '1');

        expect(firestore.updateDoc).toHaveBeenCalled();
        expect(result.error).toBeNull();
    });
});
