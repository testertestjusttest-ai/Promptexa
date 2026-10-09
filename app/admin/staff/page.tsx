import StaffClient from "./StaffClient";

export const dynamic = "force-dynamic";

export default function AdminStaffPage() {
  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-white">👥 স্টাফ ম্যানেজমেন্ট</h2>
      <StaffClient />
    </div>
  );
}
