import { useState, useEffect } from 'react';
import { Trash2, Plus, LogOut, Loader2, Lock, Shield } from 'lucide-react';
import { supabase } from './src/supabase';

interface Task {
  id: string;
  original_task: string;
  translation_mode: string;
  translated_text: string;
  completed: boolean;
}

interface Profile {
  id: string;
  email: string;
  is_admin: boolean;
  has_upgraded: boolean;
  created_at: string;
}

function AdminPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProfiles(data);
    setLoading(false);
  }

  async function togglePremium(profileId: string, currentValue: boolean) {
    await supabase
      .from('profiles')
      .update({ has_upgraded: !currentValue })
      .eq('id', profileId);
    loadProfiles();
  }

  async function toggleAdmin(profileId: string, currentValue: boolean) {
    await supabase
      .from('profiles')
      .update({ is_admin: !currentValue })
      .eq('id', profileId);
    loadProfiles();
  }

  if (loading) return <div className="border border-[#00FF41] p-6 mb-8 font-mono text-xs text-white/50">Loading users...</div>;

  return (
    <div className="border border-[#00FF41] p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Shield size={16} className="text-[#00FF41]" />
        <h2 className="font-mono text-xs text-[#00FF41] tracking-widest">ADMIN CONTROL PANEL</h2>
      </div>
      <div className="space-y-3">
        {profiles.map(profile => (
          <div key={profile.id} className="flex items-center justify-between border border-white/10 p-3">
            <div className="flex-1">
              <div className="font-mono text-xs text-white">{profile.email}</div>
              <div className="font-mono text-[9px] text-white/30 mt-1">{profile.id}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => togglePremium(profile.id, profile.has_upgraded)}
                className={`px-3 py-1 text-[9px] font-mono border transition-all ${profile.has_upgraded ? 'border-yellow-500 text-yellow-500' : 'border-white/20 text-white/30'}`}
              >
                PREMIUM
              </button>
              <button
                onClick={() => toggleAdmin(profile.id, profile.is_admin)}
                className={`px-3 py-1 text-[9px] font-mono border transition-all ${profile.is_admin ? 'border-[#00FF41] text-[#00FF41]' : 'border-white/20 text-white/30'}`}
              >
                ADMIN
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTaskTranslation(task: string, mode: string): string {
  const t = task.toUpperCase();
  if (mode === 'pirate') return `ARRR! YE BE NEEDIN' TO ${t} AFORE THE SHARKS GET YE!`;
  if (mode === 'shakespeare') return `Hark! It is thy destiny to undertake the task of ${task}.`;
  if (mode === 'manager') return `PER Q4 GUIDELINES: ${t} IS NOW CRITICAL PATH.`;
  if (mode === 'cheerleader') return `OMG! YOU ARE GOING TO ABSOLUTELY CRUSH ${t}! GO TEAM!`;
  return `Execute the following objective: ${task}.`;
}

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [mode, setMode] = useState('standard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
        setIsAuthenticating(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        setIsPremium(false);
        setTasks([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkSession() {
    setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile(uid: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        await createProfile(uid);
        return;
      }

      if (data) {
        console.log('Profile loaded:', data);
        setIsAdmin(data.is_admin === true);
        setIsPremium(data.has_upgraded === true);
      } else {
        await createProfile(uid);
      }
    } catch (error) {
      console.error('Profile fetch failed:', error);
      await createProfile(uid);
    }
  }

  async function createProfile(uid: string) {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (existingProfile) {
        console.log('Profile already exists:', existingProfile);
        setIsAdmin(existingProfile.is_admin === true);
        setIsPremium(existingProfile.has_upgraded === true);
        return;
      }

      const userEmail = user?.email || email;
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: uid,
          email: userEmail,
          is_admin: false,
          has_upgraded: false
        }])
        .select()
        .maybeSingle();

      if (!error && data) {
        console.log('Profile created:', data);
        setIsAdmin(data.is_admin === true);
        setIsPremium(data.has_upgraded === true);
      } else if (error) {
        console.error('Profile creation error:', error);
      }
    } catch (error) {
      console.error('Profile creation failed:', error);
    }
  }

  useEffect(() => {
    if (user) loadTasks();
  }, [user]);

  async function loadTasks() {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (data) setTasks(data);
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setIsAuthenticating(true);

    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInErr) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password
        });

        if (signUpErr) {
          alert(signUpErr.message);
          setIsAuthenticating(false);
        } else {
          alert("Account created! You can now sign in.");
          setIsAuthenticating(false);
        }
      } else if (data.user) {
        await fetchProfile(data.user.id);
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Authentication failed. Please try again.');
      setIsAuthenticating(false);
    }
  }

  async function addTask() {
    if (!taskInput || !user) return;
    const newTask = {
      user_id: user.id,
      original_task: taskInput,
      translation_mode: mode,
      translated_text: getTaskTranslation(taskInput, mode),
      completed: false
    };
    const { data, error } = await supabase.from('tasks').insert([newTask]).select().single();
    if (error) {
      console.error('Task insert error:', error);
      alert("Error adding task: " + error.message);
    } else if (data) {
      console.log('Task added:', data);
      setTasks([data, ...tasks]);
      setTaskInput('');
    }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono text-xs uppercase tracking-widest">Initialising...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-6xl font-bold tracking-tighter mb-10 text-center uppercase leading-none">Overly<br/>Literal</h1>
        <form onSubmit={handleAuth} className="w-full max-w-sm space-y-5">
          <input type="email" placeholder="EMAIL" className="w-full bg-transparent border-b border-white/20 p-2 font-mono text-xs focus:outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="PASSWORD" className="w-full bg-transparent border-b border-white/20 p-2 font-mono text-xs focus:outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
          <button disabled={isAuthenticating} className="w-full border border-white/40 py-4 font-mono text-[10px] tracking-widest hover:bg-white hover:text-black transition-all">
            {isAuthenticating ? <Loader2 className="animate-spin mx-auto" size={16} /> : "REQUEST ACCESS"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold tracking-tighter">OVERLY LITERAL</h1>
          <div className="flex gap-4">
            {isAdmin && <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="text-[#00FF41] font-mono text-[10px] border border-[#00FF41] px-2 py-1 hover:bg-[#00FF41] hover:text-black transition-all">ADMIN</button>}
            <button onClick={() => supabase.auth.signOut()} className="text-white/30 hover:text-white"><LogOut size={20} /></button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {['standard', 'pirate', 'shakespeare', 'manager', 'cheerleader'].map(m => {
            const isLocked = m !== 'standard' && !isPremium;
            return (
              <button key={m} onClick={() => isLocked ? alert("Upgrade required") : setMode(m)} className={`px-4 py-1 text-[9px] font-mono border transition-all flex items-center gap-2 ${mode === m ? 'border-white text-white' : 'border-white/10 text-white/30'}`}>
                {m.toUpperCase()}
                {isLocked && <Lock size={10} />}
              </button>
            );
          })}
        </div>

        {showAdminPanel && <AdminPanel />}

        <div className="flex gap-4 mb-16">
          <input value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="Describe the burden..." className="flex-1 bg-transparent border-b border-white/20 py-2 font-mono text-sm focus:outline-none" />
          <button onClick={addTask} className="border border-white/40 px-8 py-2 hover:bg-white hover:text-black transition-all"><Plus size={18} /></button>
        </div>

        <div className="space-y-6">
          {tasks.map(t => (
            <div key={t.id} className="border border-white/10 p-5 flex justify-between items-start group">
              <div>
                <div className="text-[9px] text-white/30 font-mono mb-2 uppercase">{t.original_task}</div>
                <div className="text-sm leading-relaxed">{t.translated_text}</div>
              </div>
              <button onClick={() => supabase.from('tasks').delete().eq('id', t.id).then(loadTasks)} className="text-white/5 group-hover:text-white/40 hover:text-white p-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}