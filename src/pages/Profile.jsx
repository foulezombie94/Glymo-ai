import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { logSecurity } from '../lib/logger';
import { useMeals } from '../context/MealContext';

/* ─── Inline styles that mirror the HTML's <style> blocks ─────────────────── */
const glassCard = {
  background: 'rgba(20, 34, 16, 0.6)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(88, 238, 43, 0.15)',
};

const glassPanel = {
  background: 'rgba(44, 72, 35, 0.4)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(88, 238, 43, 0.1)',
};

export default function Profile() {
  const navigate = useNavigate();
  const { bmi } = useMeals();

  const [profile, setProfile] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    weight: '',
    height: '',
    age: '',
    calorie_goal: '',
    goal: 'maintain',
    bio: ''
  });

  /* ── fetch profile on mount ─────────────────────────────────────────────── */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserEmail(session.user.email || '');
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (data) setProfile(data);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  /* ── derived display values ─────────────────────────────────────────────── */
  const displayName   = profile?.full_name || userEmail.split('@')[0] || 'User';
  const currentWeight = profile?.weight       ? `${profile.weight}`  : '--';
  const bmiDisplay    = bmi
    ? bmi.toFixed(1)
    : (profile?.height && profile?.weight
        ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1)
        : '--');
  const isPremium     = profile?.is_premium === true;
  const joinedYear    = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    : '';

  const formatGoal = (g) => {
    switch (g) {
      case 'lose_weight':   return 'Weight Loss';
      case 'build_muscle':  return 'Muscle Gain';
      case 'maintain':
      case 'maintain_weight': return 'Maintenance';
      default:              return 'Maintenance';
    }
  };

  /* ── edit handlers ──────────────────────────────────────────────────────── */
  const handleEditClick = () => {
    setEditForm({
      full_name:    profile?.full_name    || '',
      weight:       profile?.weight       || '',
      height:       profile?.height       || '',
      age:          profile?.age          || '',
      calorie_goal: profile?.calorie_goal || '',
      goal:         profile?.goal         || 'maintain',
      bio:          profile?.bio          || '',
    });
    setIsEditing(true);
  };

  const handleChange = (e) =>
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const upsertPayload = {
        id:           session.user.id,          // required for upsert conflict resolution
        email:        session.user.email,
        full_name:    editForm.full_name    || null,
        weight:       editForm.weight       ? parseFloat(editForm.weight)     : null,
        height:       editForm.height       ? parseFloat(editForm.height)     : null,
        age:          editForm.age          ? parseInt(editForm.age)          : null,
        calorie_goal: editForm.calorie_goal ? parseInt(editForm.calorie_goal) : null,
        goal:         editForm.goal         || null,
        bio:          editForm.bio          || null,
        updated_at:   new Date().toISOString(),
      };

      // upsert: creates the row if it doesn't exist, updates it if it does
      const { error } = await supabase
        .from('profiles')
        .upsert(upsertPayload, { onConflict: 'id' });

      if (error) throw error;

      // Log the profile update
      logSecurity('PROFILE_UPDATE', 'INFO', { 
        changed_fields: Object.keys(editForm).filter(key => editForm[key] !== profile[key])
      });

      // Log weight change if applicable
      const newWeight = upsertPayload.weight;
      const oldWeight = profile?.weight;
      if (newWeight && newWeight !== oldWeight) {
        await supabase.from('weight_logs').insert([{
           user_id: session.user.id,
           weight: newWeight,
           logged_date: new Date().toISOString().split('T')[0]
        }]);
        logSecurity('WEIGHT_LOGGED', 'INFO', { weight: newWeight, source: 'profile_edit' });
      }

      // Reflect changes immediately in local state
      setProfile(prev => ({ ...(prev || {}), ...upsertPayload }));

      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      logSecurity('PROFILE_UPDATE_ERROR', 'ERROR', { error: err.message });
      alert('Erreur lors de la sauvegarde. Vérifiez votre connexion et réessayez.');
    } finally {
      setSaving(false);
    }
  };

  /* ── sign out ───────────────────────────────────────────────────────────── */
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/welcome');
  };

  /* ════════════════════════════════ RENDER ════════════════════════════════ */
  return (
    <div
      className="relative flex h-screen w-full flex-col overflow-x-hidden"
      style={{
        backgroundColor: '#142210',
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(88, 238, 43, 0.05) 0%, transparent 40%),
          radial-gradient(circle at 80% 80%, rgba(88, 238, 43, 0.08) 0%, transparent 50%)`,
      }}
    >
      {/* ── Header ── */}
      <header className="flex items-center justify-between p-6 pt-12 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center size-10 rounded-full"
          style={glassCard}
          title="Retour"
        >
          <span className="material-symbols-rounded text-slate-100 text-[20px]">arrow_back</span>
        </button>

        <h1 className="text-xl font-bold tracking-tight text-slate-100">Profile</h1>

        <button
          onClick={handleEditClick}
          className="flex items-center justify-center size-10 rounded-full"
          style={glassCard}
          title="Edit Profile"
        >
          <span className="material-symbols-rounded text-[#58ee2b] text-[20px]">edit</span>
        </button>
      </header>

      {/* ── Scrollable Main ── */}
      <main className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">

        {/* Avatar & Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div
              className="size-32 rounded-full border-4 border-[#58ee2b] p-1"
              style={{ boxShadow: '0 0 20px rgba(88, 238, 43, 0.4)' }}
            >
              <div
                className="size-full rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('${profile?.avatar_url ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDbw1vssAqtMGRmI8CaJURyowYPVPnzgIjNKLiFI-UTlbjvJTWuUJoyzQSYH5ojSHIWHhCvIeH8yRYSCYlNOofGK5oYqgJjDk5oytlXnjwQwO2-2ZYlULbxeWpzQ4Hy2umWrJ8NUxAsSSju7xKKnIpk3gRzLd3IQGGVP7IuqI0fMgD--m9S3SZ9eFniozkP8BmoV2EIiYX6vXFiWlriOKTw4NFxh0tvPylwUl753RMfjAPJkfmeMmEfjUCixi8P0rmS4jCEMOmIRwxM'
                  }')`,
                }}
              />
            </div>
            <div
              className="absolute bottom-1 right-1 size-8 bg-[#58ee2b] rounded-full flex items-center justify-center border-4 border-[#142210]"
            >
              <span className="material-symbols-rounded text-[#142210] text-sm font-bold"
                style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <h2 className="text-2xl font-extrabold text-slate-100">
              {loading ? 'Loading…' : displayName}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span
                className="text-[#58ee2b] text-sm font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(88,238,43,0.1)' }}
              >
                {isPremium ? 'Premium Elite' : 'Free Plan'}
              </span>
              {joinedYear && (
                <span className="text-slate-400 text-sm">Joined {joinedYear}</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Current', value: currentWeight, unit: 'kg' },
            { label: 'TAILLE',  value: profile?.height || '--',  unit: 'cm' },
            { label: 'BMI',     value: bmiDisplay,    unit: ''   },
          ].map(({ label, value, unit }) => (
            <div
              key={label}
              className="rounded-2xl p-4 flex flex-col items-center text-center"
              style={glassCard}
            >
              <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">{label}</span>
              <span className="text-lg font-bold text-slate-100">
                {value}
                {unit && <span className="text-xs text-[#58ee2b] ml-0.5">{unit}</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="space-y-3 mb-8">
          {[
            { icon: 'restaurant_menu', title: 'Nutrition Plan',  sub: formatGoal(profile?.goal), onClick: () => navigate('/') },
            { icon: 'monitoring',      title: 'Body Goals',      sub: 'Weight & Fitness',        onClick: () => navigate('/stats') },
            { icon: 'bar_chart',       title: 'Statistics',      sub: 'Weekly analytics',        onClick: () => navigate('/stats') },
            { icon: 'star',            title: isPremium ? 'Premium Active' : 'Upgrade to Premium',
              sub: isPremium ? 'Glymo Elite' : 'Unlock all AI features',
              onClick: () => navigate('/', { state: { showPremium: true } }) },
          ].map(({ icon, title, sub, onClick }) => (
            <button
              key={title}
              onClick={onClick}
              className="w-full rounded-2xl p-4 flex items-center justify-between group cursor-pointer transition-colors text-left"
              style={glassCard}
            >
              <div className="flex items-center gap-4">
                <div
                  className="size-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(88,238,43,0.1)' }}
                >
                  <span className="material-symbols-rounded text-[#58ee2b]">{icon}</span>
                </div>
                <div>
                  <p className="text-slate-100 font-bold text-sm">{title}</p>
                  <p className="text-slate-400 text-xs">{sub}</p>
                </div>
              </div>
              <span className="material-symbols-rounded text-slate-500 group-hover:text-[#58ee2b] transition-colors">chevron_right</span>
            </button>
          ))}
        </div>

        {/* Sign-out row */}
        <button
          onClick={handleSignOut}
          className="w-full rounded-2xl p-4 flex items-center gap-4 transition-colors"
          style={glassCard}
        >
          <div className="size-10 rounded-xl flex items-center justify-center bg-red-500/10">
            <span className="material-symbols-rounded text-red-400">logout</span>
          </div>
          <span className="text-red-400 font-bold text-sm">Sign Out</span>
        </button>
      </main>

      {/* ── Bottom Nav Removed per User Request ── */}

      {/* ══════════════════════ EDIT PROFILE OVERLAY ══════════════════════ */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            key="edit-overlay"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-50 flex flex-col overflow-hidden"
            style={{
              backgroundColor: '#142210',
              backgroundImage: `
                radial-gradient(at 0% 0%, hsla(106, 84%, 15%, 0.5) 0px, transparent 50%),
                radial-gradient(at 100% 100%, hsla(106, 84%, 12%, 0.5) 0px, transparent 50%)`,
            }}
          >
            {/* Edit Header */}
            <div className="flex items-center justify-between px-4 py-4 flex-shrink-0 z-10">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="text-slate-100 hover:text-[#58ee2b] transition-colors flex size-12 items-center justify-center rounded-full hover:bg-white/5"
              >
                <span className="material-symbols-rounded text-[24px]">arrow_back</span>
              </button>
              <h2 className="text-slate-100 text-lg font-bold">Edit Profile</h2>
              <div className="w-12" />
            </div>

            {/* Avatar section */}
            <div className="flex flex-col items-center pb-4 px-6 flex-shrink-0">
              <div className="relative group cursor-pointer">
                <div
                  className="size-32 rounded-full border-4 bg-cover bg-center transition-all duration-300"
                  style={{
                    backgroundImage: `url('${profile?.avatar_url ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuAWFXDV3NG9pr7tpcpJ2T_sQ0jz3n5gR4RgSmVghP6O9_0wR4nUKkRuEzmsXm_lgqMTh7vxE0cBZk4r48_F1sgEzkUGEwASwSY-BKI1Cw_dn3MqXAGCbf1EjFLcG7RUCRegg9XNgtQd2RgUG5OsXuYVk33nNfu6zqIqzNHTlKKw_G02JgF5Nn7eTsuQXzB6BE4F36JmItzaVDIUqQVU13SUfiQ1EkLUZhRH0RLnaj8J4FM15w4qHETRZivh2wBVQHwHSPft6QVzAQyv'
                    }')`,
                    borderColor: 'rgba(88,238,43,0.2)',
                    boxShadow: '0 0 30px rgba(88,238,43,0.15)',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="material-symbols-rounded text-white text-3xl">photo_camera</span>
                </div>
                <div
                  className="absolute bottom-1 right-1 bg-[#58ee2b] text-[#142210] p-2 rounded-full border-4 border-[#142210] flex items-center justify-center"
                >
                  <span className="material-symbols-rounded text-sm font-bold">edit</span>
                </div>
              </div>
              <p className="text-[#58ee2b] text-sm font-semibold tracking-wide uppercase mt-2">Change Photo</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32 flex flex-col gap-5">

              {/* Full Name */}
              <label className="flex flex-col gap-2">
                <span className="text-slate-300 text-sm font-medium ml-1">Full Name</span>
                <div className="flex items-center rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#58ee2b]/50" style={glassPanel}>
                  <div className="pl-4 py-4 text-[#58ee2b] flex items-center justify-center">
                    <span className="material-symbols-rounded">person</span>
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    value={editForm.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full bg-transparent border-none text-white placeholder:text-slate-500 focus:ring-0 focus:outline-none h-14 px-4 text-base font-medium"
                  />
                </div>
              </label>

              {/* Bio */}
              <label className="flex flex-col gap-2">
                <span className="text-slate-300 text-sm font-medium ml-1">Bio</span>
                <div className="flex items-start rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#58ee2b]/50" style={glassPanel}>
                  <div className="pl-4 py-4 text-[#58ee2b] flex items-center justify-center">
                    <span className="material-symbols-rounded">edit_note</span>
                  </div>
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleChange}
                    placeholder="Tell us about your goals…"
                    className="w-full bg-transparent border-none text-white placeholder:text-slate-500 focus:ring-0 focus:outline-none py-4 px-4 text-base font-medium resize-none h-24"
                  />
                </div>
              </label>

              {/* Height & Weight */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-slate-300 text-sm font-medium ml-1">Height (cm)</span>
                  <div className="flex items-center rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#58ee2b]/50" style={glassPanel}>
                    <div className="pl-4 py-4 text-[#58ee2b] flex items-center justify-center">
                      <span className="material-symbols-rounded">height</span>
                    </div>
                    <input
                      type="number"
                      name="height"
                      value={editForm.height}
                      onChange={handleChange}
                      placeholder="cm"
                      className="w-full bg-transparent border-none text-white placeholder:text-slate-500 focus:ring-0 focus:outline-none h-14 px-4 text-base font-medium"
                    />
                  </div>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-slate-300 text-sm font-medium ml-1">Weight (kg)</span>
                  <div className="flex items-center rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#58ee2b]/50" style={glassPanel}>
                    <div className="pl-4 py-4 text-[#58ee2b] flex items-center justify-center">
                      <span className="material-symbols-rounded">monitor_weight</span>
                    </div>
                    <input
                      type="number"
                      name="weight"
                      step="0.1"
                      value={editForm.weight}
                      onChange={handleChange}
                      placeholder="kg"
                      className="w-full bg-transparent border-none text-white placeholder:text-slate-500 focus:ring-0 focus:outline-none h-14 px-4 text-base font-medium"
                    />
                  </div>
                </label>
              </div>

              {/* Age & Calorie Goal */}
              <div className="grid grid-cols-3 gap-4">
                <label className="flex flex-col gap-2 col-span-1">
                  <span className="text-slate-300 text-sm font-medium ml-1">Age</span>
                  <div className="flex items-center rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#58ee2b]/50" style={glassPanel}>
                    <div className="pl-3 py-4 text-[#58ee2b] flex items-center justify-center">
                      <span className="material-symbols-rounded text-[20px]">cake</span>
                    </div>
                    <input
                      type="number"
                      name="age"
                      value={editForm.age}
                      onChange={handleChange}
                      placeholder="Age"
                      className="w-full bg-transparent border-none text-white placeholder:text-slate-500 focus:ring-0 focus:outline-none h-14 px-3 text-base font-medium"
                    />
                  </div>
                </label>
                <label className="flex flex-col gap-2 col-span-2">
                  <span className="text-slate-300 text-sm font-medium ml-1">Daily Calorie Goal</span>
                  <div className="flex items-center rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#58ee2b]/50" style={glassPanel}>
                    <div className="pl-4 py-4 text-[#58ee2b] flex items-center justify-center">
                      <span className="material-symbols-rounded">local_fire_department</span>
                    </div>
                    <input
                      type="number"
                      name="calorie_goal"
                      value={editForm.calorie_goal}
                      onChange={handleChange}
                      placeholder="kcal"
                      className="w-full bg-transparent border-none text-white placeholder:text-slate-500 focus:ring-0 focus:outline-none h-14 px-4 text-base font-medium"
                    />
                  </div>
                </label>
              </div>

              {/* Primary Goal */}
              <label className="flex flex-col gap-2">
                <span className="text-slate-300 text-sm font-medium ml-1">Primary Goal</span>
                <div className="flex items-center rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#58ee2b]/50 relative" style={glassPanel}>
                  <div className="pl-4 py-4 text-[#58ee2b] flex items-center justify-center">
                    <span className="material-symbols-rounded">flag</span>
                  </div>
                  <select
                    name="goal"
                    value={editForm.goal}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none text-white focus:ring-0 focus:outline-none h-14 px-4 text-base font-medium appearance-none cursor-pointer [&>option]:text-slate-900"
                  >
                    <option value="build_muscle">Muscle Gain</option>
                    <option value="lose_weight">Weight Loss</option>
                    <option value="maintain">Maintenance</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#58ee2b]">
                    <span className="material-symbols-rounded">expand_more</span>
                  </div>
                </div>
              </label>

            </form>

            {/* Fixed Save Button */}
            <div
              className="fixed bottom-0 left-0 right-0 p-6 z-20"
              style={{ background: 'linear-gradient(to top, #142210, rgba(20,34,16,0.95), transparent)' }}
            >
              <button
                type="submit"
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#58ee2b] hover:bg-[#58ee2b]/90 text-[#142210] font-bold text-lg h-14 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ boxShadow: '0 0 20px rgba(88,238,43,0.3)' }}
              >
                {saving ? (
                  <>
                    <span className="material-symbols-rounded animate-spin">progress_activity</span>
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <span>Save Changes</span>
                    <span className="material-symbols-rounded text-xl">check_circle</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
