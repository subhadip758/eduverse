import React, { useState, useEffect } from "react";
import { User, Bell, Shield, Key, Smartphone, Globe, Save, CheckCircle2 } from "lucide-react";
import { useAuth } from "../App";

export function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const { profile, user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
    bio: ""
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || ""
      });
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: formData.displayName,
        phone: formData.phone,
        bio: formData.bio
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch(err) {
      console.error(err);
      alert("Failed to update profile locally.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    alert(`A simulated password reset email has been logged locally for ${user.email}.`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Settings Navigation */}
      <div className="w-full md:w-64 flex-shrink-0">
        <h2 className="text-xl font-bold text-zinc-100 mb-6">Settings</h2>
        <nav className="space-y-1">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "profile" ? "bg-emerald-500/10 text-emerald-500 font-medium" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"}`}
          >
            <User className="w-5 h-5" />
            Profile Preferences
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "security" ? "bg-emerald-500/10 text-emerald-500 font-medium" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"}`}
          >
            <Shield className="w-5 h-5" />
            Security & Privacy
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "notifications" ? "bg-emerald-500/10 text-emerald-500 font-medium" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"}`}
          >
            <Bell className="w-5 h-5" />
            Notifications
          </button>
          <button 
            onClick={() => setActiveTab("appearance")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "appearance" ? "bg-emerald-500/10 text-emerald-500 font-medium" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"}`}
          >
            <Smartphone className="w-5 h-5" />
            Appearance
          </button>
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8">
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
              <div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-1">Profile Details</h3>
                <p className="text-zinc-500 text-sm">Update your personal information internally on this device.</p>
              </div>
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />} 
                {saved ? "Saved!" : isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <div className="flex items-center gap-6 py-4">
              <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-zinc-700 overflow-hidden">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-zinc-500" />
                )}
              </div>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <label className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer">
                    Upload Photo
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/gif" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert("File size exceeds 5MB limit.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateProfile({ photoURL: reader.result as string });
                            setSaved(true);
                            setTimeout(() => setSaved(false), 3000);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <button 
                    type="button" 
                    onClick={() => {
                        updateProfile({ photoURL: "" });
                        setSaved(true);
                        setTimeout(() => setSaved(false), 3000);
                    }}
                    className="bg-transparent border border-zinc-800 hover:border-red-500/50 text-zinc-400 hover:text-red-400 font-medium px-4 py-2 rounded-xl transition-colors text-sm"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-xs text-zinc-500">Must be JPEG, PNG, or GIF and cannot exceed 5MB.</p>
              </div>
            </div>

            <div className="space-y-6 border-t border-zinc-800 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Display Name</label>
                <input 
                  type="text" 
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Email Address (Read-Only)</label>
                <input 
                  type="email" 
                  value={formData.email}
                  readOnly
                  className="w-full bg-zinc-950/50 border border-zinc-800/50 text-zinc-500 cursor-not-allowed rounded-xl px-4 py-3" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Bio</label>
                <textarea 
                  rows={4} 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us a little about yourself..."
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                ></textarea>
              </div>
            </div>
          </form>
        )}
        
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-6">
              <h3 className="text-xl font-semibold text-zinc-100 mb-1">Security & Privacy</h3>
              <p className="text-zinc-500 text-sm">Manage your local profile security protocols.</p>
            </div>
            
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Key className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-zinc-100 font-bold text-lg">Password Reset</h4>
                  <p className="text-zinc-500 text-sm mt-1 mb-4">Because this system is running fully localized, passwords are permanently retained and cannot be securely reset remotely.</p>
                  <button onClick={handlePasswordReset} className="bg-zinc-100 hover:bg-white text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                    Simulate Reset Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeTab === "notifications" || activeTab === "appearance" || activeTab === "language") && (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <SettingsIcon tab={activeTab} />
            <h3 className="text-xl font-semibold text-zinc-200 mt-4 mb-2 capitalize">{activeTab} Settings</h3>
            <p className="text-zinc-500 max-w-sm">
              Configure your {activeTab} preferences to customize your EduVerse experience. (Mock view)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsIcon({ tab }: { tab: string }) {
  switch (tab) {
    case 'notifications': return <Bell className="w-12 h-12 text-zinc-700" />;
    case 'security': return <Shield className="w-12 h-12 text-zinc-700" />;
    case 'appearance': return <Smartphone className="w-12 h-12 text-zinc-700" />;
    case 'language': return <Globe className="w-12 h-12 text-zinc-700" />;
    default: return <User className="w-12 h-12 text-zinc-700" />;
  }
}
