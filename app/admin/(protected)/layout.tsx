import { AdminNav } from '@/components/admin/AdminNav';
import { countDocsWhere } from '@/lib/content/admin-repository';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const [newApplications, newInquiries] = await Promise.all([
    countDocsWhere('castingApplications', 'status', 'novo'),
    countDocsWhere('talentInquiries', 'status', 'novo'),
  ]);

  return (
    <>
      <AdminNav initialUnreadMensagens={newApplications + newInquiries} />
      <main className="admin-main">{children}</main>
    </>
  );
}
