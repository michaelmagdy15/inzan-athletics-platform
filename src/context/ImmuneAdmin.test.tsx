import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { FitnessProvider, useFitness } from './FitnessContext';
import { supabase } from '../lib/firebase';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';

// Mock Supabase
vi.mock('../lib/firebase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'admin-id' } } }, error: null })),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({
                        data: {
                            id: 'admin-id',
                            full_name: 'Admin User',
                            email: 'michaelmitry13@gmail.com',
                            role: 'member' // DB says member, but logic should force admin
                        },
                        error: null
                    })),
                })),
                order: vi.fn(() => Promise.resolve({ data: [], error: null })),
                limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
            update: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ data: {}, error: null }))
            })),
            delete: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ data: {}, error: null }))
            })),
        })),
    }
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
        <FitnessProvider>
            {children}
        </FitnessProvider>
    </AuthProvider>
);

describe('Immune Admin Logic', () => {
    beforeEach(() => {
        // Mock the sequence of select()... during refreshFitness
        vi.mocked(supabase.from).mockImplementation((table: string) => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({
                        data: {
                            id: 'admin-id',
                            full_name: 'Admin User',
                            email: 'michaelmitry13@gmail.com',
                            role: 'member'
                        },
                        error: null
                    })),
                })),
                order: vi.fn(() => Promise.resolve({ data: table === 'profiles' ? [{ id: 'admin-id', email: 'michaelmitry13@gmail.com', full_name: 'Admin', role: 'admin' }] : [], error: null })),
                limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
                then: (cb: any) => Promise.resolve({ data: table === 'profiles' ? [{ id: 'admin-id', email: 'michaelmitry13@gmail.com', full_name: 'Admin', role: 'admin' }] : [], error: null }).then(cb)
            })),
            insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
            update: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ data: {}, error: null }))
            })),
            delete: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ data: {}, error: null }))
            })),
        }) as any);
    });

    it('forces admin role for michaelmitry13@gmail.com even if DB says otherwise', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.currentUser?.role).toBe('admin');
        expect(result.current.currentUser?.email).toBe('michaelmitry13@gmail.com');
    });

    it('prevents role change for the immune admin', async () => {
        const { result: fitnessResult } = renderHook(() => useFitness(), { wrapper });

        await waitFor(() => expect(fitnessResult.current.loading).toBe(false));

        // The members should now contain our immune admin from the mock
        expect(fitnessResult.current.members.find(m => m.email === 'michaelmitry13@gmail.com')).toBeDefined();

        await expect(fitnessResult.current.updateMemberRole('admin-id', 'member'))
            .rejects.toThrow('This core identity role is immutable.');
    });

    it('prevents deletion of the immune admin', async () => {
        const { result: fitnessResult } = renderHook(() => useFitness(), { wrapper });

        await waitFor(() => expect(fitnessResult.current.loading).toBe(false));

        // The members should now contain our immune admin
        expect(fitnessResult.current.members.find(m => m.email === 'michaelmitry13@gmail.com')).toBeDefined();

        await expect(fitnessResult.current.deleteMember('admin-id'))
            .rejects.toThrow('This core identity is immune to purge operations.');
    });
});
