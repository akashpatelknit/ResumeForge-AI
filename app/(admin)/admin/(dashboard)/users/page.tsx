import { getAdminUsers, ADMIN_USER_PAGE_SIZE } from "@/lib/admin/clerkUsers";
import { UsersTable } from "@/components/admin/UsersTable";

export default async function AdminUsersPage() {
  const { users, total } = await getAdminUsers({ page: 1 });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Users</h1>
        <p className="text-sm text-slate-400">Identity comes from Clerk; plan, resume count, and block status are local.</p>
      </div>
      <UsersTable initialUsers={users} initialTotal={total} pageSize={ADMIN_USER_PAGE_SIZE} />
    </div>
  );
}
