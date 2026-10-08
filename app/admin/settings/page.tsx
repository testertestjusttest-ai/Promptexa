import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-bold text-white">⚙️ সেটিংস</h2>
      <SettingsClient />
    </div>
  );
}
