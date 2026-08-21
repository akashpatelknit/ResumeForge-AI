import { getAdminUsers, ADMIN_USER_PAGE_SIZE } from "@/lib/admin/clerkUsers";
import { UsersTable } from "@/components/admin/UsersTable";

export default async function AdminUsersPage() {
  const { users, total } = await getAdminUsers({ page: 1 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-[28px]">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Identity comes from Clerk; plan, resume count, and block status are local.
        </p>
      </div>
      <UsersTable initialUsers={users} initialTotal={total} pageSize={ADMIN_USER_PAGE_SIZE} />
    </div>
  );
}
