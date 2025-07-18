import { supabase } from "../lib/supabaseClient";

export default function Logout() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // simple page reload to update UI
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
    >
      Log Out
    </button>
  );
}
