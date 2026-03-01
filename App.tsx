import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Trash2, Share2, Bell, Lock, Download, Plus, Loader2, LogOut } from 'lucide-react';
import { supabase } from './src/supabase';

// --- Types ---
interface Task {
  id: string;
  original_task: string;
  translation_mode: string;
  translated_text: string;
  completed: boolean;
}

interface Suggestion {
  id: string;
  suggestion_text: string;
  vote_count: number;
}

// --- Translation Engine ---
const taskTranslations: Record<string, Record<string, string>> = {
  'buy milk': {
    standard: 'Acquire the bovine secretion from a commercial hub.',
    pirate: 'Plunder the white nectar from the merchant\'s dock, matey!',
    shakespeare: 'Pray, fetch the creamy yield of the kine from the market.',
    manager: 'PROCUREMENT OF LACTOSE IS OVERDUE. COMMENCE ACQUISITION IMMEDIATELY.',
    cheerleader: 'OMG YOU ARE GOING TO CRUSH THAT SHOPPING TRIP! GO TEAM YOU!'
  }
};

function getTaskTranslation(task: string, mode: string): string {
  const normalizedTask = task.toLowerCase().trim();
  if (taskTranslations[normalizedTask] && taskTranslations[normalizedTask][mode]) {
    return taskTranslations[normalizedTask][mode];
  }
  const t = task.toUpperCase();
  if (mode === 'pirate') return `ARRR! YE BE NEEDIN' TO ${t} AFORE THE SHARKS GET YE!`;
  if (mode === 'shakespeare') return `Hark! It is thy destiny to undertake the task of ${task}.`;
  if (mode === 'manager') return `PER Q4 GUIDELINES: ${t} IS NOW CRITICAL PATH.`;
  if (mode === 'cheerleader') return `YOU'RE GOING TO ABSOLUTELY KILL IT WITH ${t}! YOU GOT THIS!!`;
  return `Execute the following objective: ${task}.`;
}

export default function App() {
  // Auth & Profile State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // App State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [mode, setMode] = useState('standard');
  const [showAdmin, setShowAdmin] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // --- Initialization ---
  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        if (profile) {
          setIsAdmin(profile.is_admin);
          setIsPremium(profile.has_upgraded);
        }
      }
      setLoading(false);
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setIsAdmin(false);
        setIsPremium(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadTasks();
      loadSuggestions();
    }
  }, [user]);

  // --- Database Actions ---
  const loadTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (data) setTasks(data);
  };

  const loadSuggestions = async () => {
    const { data } = await supabase.from('suggestions').select('*').order('vote_count', { ascending: false }).limit(3);
    if (data) setSuggestions(data);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) {
      const { error: signUpErr } = await supabase.auth.signUp({ email, password });
      if (signUpErr) alert(signUpErr.message);
      else alert("Check your email to verify!");
    }
    setIsAuthenticating(false);
  };

  const addTask = async () => {
    if (!taskInput || !user) return;
    const { data } = await supabase.from('tasks').insert([{
      user_id: user.id,
      original_task: taskInput,
      translation_mode: mode,
      translated_text: getTaskTranslation(taskInput, mode),
      completed: false
    }]).select().single();
    if (data) {
      setTasks([data, ...tasks]);
      setTaskInput('');
    }
  };

  const toggleUpgrade = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ has_upgraded: !isPremium }).eq('id', user.id);
    if (!error) setIsPremium(!isPremium);
  };

  // --- Render Logic ---
  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono text-xs">INITIALIZING...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-6xl font-bold tracking-tighter mb-10 text-center uppercase leading-none">Overly<br/>Literal</h1>
        <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4">
          <input type="email" placeholder="EMAIL" className="w-full bg-transparent border-b border-white/20 p-2 font-mono text-xs uppercase focus:outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="PASSWORD" className="w-full bg-transparent border-b border-white/20 p-2 font-mono text-xs uppercase focus:outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
          <button disabled={isAuthenticating} className="w-full border border-white/40 py-4 font-mono text-[10px] tracking-widest hover:bg-white hover:text-black transition-all uppercase">
            {isAuthenticating ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Request Access"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold tracking-tighter">OVERLY LITERAL</h1>
          <div className="flex gap-6 items-center">
            {isAdmin && (
              <button onClick={() => setShowAdmin(!showAdmin)} className="text-[#00FF41] font-mono text-[10px] tracking-widest uppercase">
                {showAdmin ? "[ CLOSE VAULT ]" : "[ ADMIN ]"}
              </button>
            )}
            <button onClick={() => supabase.auth.signOut()} className="text-white/30 hover:text-white transition-colors"><LogOut size={18} /></button>
          </div>
        </div>

        {showAdmin ? (
          <div className="border border-[#00FF41]/30 p-8 font-mono bg-[#00FF41]/5">
            <h2 className="text-[#00FF41] mb-8 text-sm tracking-widest uppercase">System Analytics</h2>
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div>
                <div className="text-[10px] text-[#00FF41]/40 mb-2">SYSTEM BURDENS</div>
                <div className="text-2xl text-[#00FF41]">{tasks.length}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#00FF41]/40 mb-2">ULTRA REVENUE</div>
                <div className="text-2xl text-[#00FF41]">{isPremium ? "$2.99" : "$0.00"}</div>
              </div>
            </div>
            <button onClick={() => setShowAdmin(false)} className="text-[10px] text-[#00FF41] border border-[#00FF41] px-4 py-2 hover:bg-[#00FF41] hover:text-black">EXIT ADMIN VIEW</button>
          </div>
        ) : (
          <>
            {/* Mode Selection */}
            <div className="flex flex-wrap gap-2 mb-10">
              {['standard', 'pirate', 'shakespeare', 'manager', 'cheerleader'].map((m) => {
                const isLocked = m !== 'standard' && !isPremium;
                return (
                  <button 
                    key={m} 
                    onClick={() => isLocked ? alert("Upgrade to Ultra to unlock this mode!") : setMode(m)}
                    className={`px-4 py-1 text-[9px] font-mono border transition-all flex items-center gap-2 ${mode === m ? 'border-white text-white' : 'border-white/10 text-white/30'} ${isLocked ? 'cursor-not-allowed opacity-50' : 'hover:border-white/40'}`}
                  >
                    {m.toUpperCase()}
                    {isLocked && <Lock size={10} />}
                  </button>
                );
              })}
              {!isPremium && <button onClick={toggleUpgrade} className="px-4 py-1 text-[9px] font-mono border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">UPGRADE TO ULTRA</button>}
            </div>

            {/* Input */}
            <div className="flex gap-4 mb-20">
              <input value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="Enter the burden..." className="flex-1 bg-transparent border-b border-white/20 py-2 font-mono text-sm focus:outline-none focus:border-white transition-all" />
              <button onClick={addTask} className="border border-white/40 px-8 py-2 hover:bg-white hover:text-black transition-all"><Plus size={18} /></button>
            </div>

            {/* Task List */}
            <div className="space-y-8">
              {tasks.length === 0 ? (
                <div className="text-center py-20 text-white/10 font-mono text-[10px] tracking-widest">NO BURDENS LOGGED.</div>
              ) : (
                tasks.map(t => (
                  <div key={t.id} className="border border-white/10 p-6 flex justify-between items-start group hover:border-white/40 transition-all relative">
                    {t.translation_mode !== 'standard' && <div className="absolute top-0 right-0 h-full w-1 bg-blue-500/20" />}
                    <div>
                      <div className="text-[9px] text-white/30 font-mono mb-2 uppercase tracking-widest">{t.original_task}</div>
                      <div className="text-base leading-relaxed">{t.translated_text}</div>
                    </div>
                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => supabase.from('tasks').delete().eq('id', t.id).then(loadTasks)} className="text-white/20 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Roadmap/Voting */}
            <div className="mt-24 border-t border-white/10 pt-12 mb-20">
              <h3 className="text-[10px] font-mono tracking-[0.4em] text-white/20 uppercase mb-8">Personality Roadmap</h3>
              <div className="space-y-4">
                {suggestions.map(s => (
                  <div key={s.id} className="flex justify-between items-center bg-white/5 p-4 border border-white/5">
                    <span className="text-xs font-mono uppercase tracking-widest">{s.suggestion_text}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-white/30">{s.vote_count} VOTES</span>
                      <button 
                        onClick={() => isPremium ? alert("Vote logged!") : alert("Upgrade to Ultra to vote!")}
                        className={`px-3 py-1 text-[9px] border ${isPremium ? 'border-white hover:bg-white hover:text-black' : 'border-white/10 text-white/20 cursor-not-allowed'}`}
                      >
                        VOTE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}