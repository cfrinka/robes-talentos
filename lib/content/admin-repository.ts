import 'server-only';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../firebase/admin';
import type { WithId } from './types';

// Live (uncached) Firestore CRUD for the admin panel, ported from the old
// public/admin-js/firestore-helpers.js. Admin screens must read through
// here, never through lib/content/repository.ts's cached functions --
// otherwise a saved edit wouldn't show up in the admin UI until Publish.
//
// Every document also carries a server-set `createdAt` timestamp, purely so
// public lists have a stable order (see lib/content/repository.ts).

// Every write here adds a `createdAt` Firestore Timestamp (a class
// instance) purely for list ordering. It must never reach a Client
// Component -- RSC serialization only accepts plain objects/built-ins --
// and it isn't part of any entity's public shape, so every read strips it.
function withoutCreatedAt<T extends object>(data: FirebaseFirestore.DocumentData): T {
  const rest: Record<string, unknown> = { ...data };
  delete rest.createdAt;
  return rest as T;
}

export async function listDocs<T extends object>(
  collectionName: string,
  direction: FirebaseFirestore.OrderByDirection = 'asc'
): Promise<WithId<T>[]> {
  const snap = await adminDb.collection(collectionName).orderBy('createdAt', direction).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...withoutCreatedAt<T>(doc.data()) }));
}

export async function getDocById<T extends object>(
  collectionName: string,
  id: string
): Promise<WithId<T> | null> {
  const doc = await adminDb.collection(collectionName).doc(id).get();
  return doc.exists ? { id: doc.id, ...withoutCreatedAt<T>(doc.data()!) } : null;
}

// Pass `id` for collections keyed by a natural id (talent/article slugs);
// omit it to let Firestore generate one (castings, categories).
export async function createDoc<T extends object>(
  collectionName: string,
  data: T,
  id?: string
): Promise<string> {
  const payload = { ...data, createdAt: FieldValue.serverTimestamp() };
  if (id) {
    await adminDb.collection(collectionName).doc(id).set(payload);
    return id;
  }
  const ref = await adminDb.collection(collectionName).add(payload);
  return ref.id;
}

export async function updateDocById<T extends object>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  await adminDb.collection(collectionName).doc(id).update(data as FirebaseFirestore.UpdateData<T>);
}

export async function deleteDocById(collectionName: string, id: string): Promise<void> {
  await adminDb.collection(collectionName).doc(id).delete();
}

export async function countDocsWhere(collectionName: string, field: string, value: unknown): Promise<number> {
  const snap = await adminDb.collection(collectionName).where(field, '==', value).count().get();
  return snap.data().count;
}

export async function getSingletonDoc<T extends object>(id: string): Promise<T | null> {
  const doc = await adminDb.collection('singletons').doc(id).get();
  return doc.exists ? (doc.data() as T) : null;
}

export async function setSingletonDoc<T extends object>(id: string, data: T): Promise<void> {
  await adminDb.collection('singletons').doc(id).set(data);
}
