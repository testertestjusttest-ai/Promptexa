import ServicesClient from "./ServicesClient";

export const dynamic = "force-dynamic";

export default function AdminServicesPage() {
  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-white">🌐 ওয়েবসাইট ডেভেলপমেন্ট রিকোয়েস্ট</h2>
      <ServicesClient />
    </div>
  );
}
