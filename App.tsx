import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Trash2, Share2, Bell, Lock, Download, Plus } from 'lucide-react';
import { supabase } from './src/supabase';

interface Task {
  id: string;
  original_task: string;
  translation_mode: string;
  translated_text: string;
  completed: boolean;
}

const taskTranslations: Record<string, Record<string, string>> = {
  'buy milk': {
    standard: 'Acquire the bovine secretion from a commercial hub.',
    pirate: 'Plunder the white nectar from the merchant\'s dock, matey!',
    shakespeare: 'Pray, fetch the creamy yield of the kine from the market.',
    manager: 'PROCUREMENT OF LACTOSE IS OVERDUE. COMMENCE ACQUISITION IMMEDIATELY.',
    cheerleader: 'OMG YOU ARE GOING TO CRUSH THAT SHOPPING TRIP! GO TEAM YOU!'
  },
  'call mom': {
    standard: 'Initiate telecommunication protocol with maternal parental unit.',
    pirate: 'Ring up the old sea witch who birthed ye, arr!',
    shakespeare: 'Hark! Discourse with thy mother through distant communication.',
    manager: 'MATERNAL CONTACT REQUIRED. INITIATE COMMUNICATION PROTOCOL NOW.',
    cheerleader: 'YES! TIME TO CONNECT WITH THE AMAZING PERSON WHO GAVE YOU LIFE!'
  }
};

function getTaskTranslation(task: string, mode: string): string {
  const normalizedTask = task.toLowerCase().trim();
  if (taskTranslations[normalizedTask]) return taskTranslations[normalizedTask][mode];
  if (mode === 'pirate') return `Complete the task "${task}" with proper pirate swagger, arr!`;
  if (mode === 'shakespeare') return `Accomplisheth the task of "${task}" with utmost diligence.`;
  if (mode === 'manager') return `TASK "${task.toUpperCase()}" IS PENDING. EXECUTE WITHOUT DELAY.`;
  if (mode === 'cheerleader') return `YOU'RE GOING TO ABSOLUTELY CRUSH "${task}"! YOU'VE GOT THIS!`;
  return `Execute the prescribed task: "${task}" with excessive literalism.`;
}

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState('standard');
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('has_upgraded').eq('id', session.user.id).maybeSingle();
        if (profile) setIsPremium(profile.has_upgraded);
      }
      setLoading(false);
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) loadTasks();
  }, [user]);

  const loadTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (data) setTasks(data);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    
    if (signInErr) {
      const { data: signUp, error: signUpErr } = await supabase.auth.signUp({ email, password });
      if (signUpErr) alert(signUpErr.message);
      else if (signUp.session) setUser(signUp.session.user);
      else alert("Account created! Try signing in now.");
    } else {
      setUser(signIn.session.user);
    }
    setIsAuthenticating(false);
  };

  const addTask = async () => {
    if (!taskInput || !user) return;
    const { data, error } = await supabase.from('tasks').insert([{
      user_id: user.id,
      original_task: taskInput,
      translation_mode: mode,
      translated_text: getTaskTranslation(taskInput, mode),
      completed: false
    }]).select().single();
    
    if (!error && data) {
      setTasks([data, ...tasks]);
      setTaskInput('');
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-white text-[10px]">SYSTEM REBOOTING...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-6xl font-bold tracking-tighter mb-10 text-center leading-none uppercase">Overly<br/>Literal</h1>
        <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4">
          <input type="email" placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent border-b border-white/20 p-2 font-mono text-xs uppercase focus:outline-none focus:border-[#4FC3F7]" required />
          <input type="password" placeholder="PASSWORD" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-transparent border-b border-white/20 p-2 font-mono text-xs uppercase focus:outline-none focus:border-[#4FC3F7]" required />
          <button className="w-full border border-white/40 py-3 font-mono text-[10px] tracking-widest hover:bg-white hover:text-black transition-all">
            {isAuthenticating ? 'VERIFYING...' : 'REQUEST ACCESS'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-bold tracking-tighter">OVERLY LITERAL</h1>
          <button onClick={() => supabase.auth.signOut()} className="text-white/40 font-mono text-[10px] hover:text-white">EXIT SYSTEM</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {['standard', 'pirate', 'shakespeare', 'manager', 'cheerleader'].map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`px-3 py-1 font-mono text-[9px] border transition-all ${mode === m ? 'border-[#4FC3F7] text-[#4FC3F7]' : 'border-white/20 text-white/40'}`}>
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-4 mb-8">
          <input value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="Enter task..." className="flex-1 bg-transparent border-b border-white/20 py-2 font-mono text-sm focus:outline-none" />
          <button onClick={addTask} className="border border-white/40 px-6 font-mono text-[10px] hover:bg-white hover:text-black transition-all">ADD</button>
        </div>

        <div className="space-y-4">
          {tasks.map(t => (
            <div key={t.id} className="border border-white/10 p-4 flex justify-between items-start hover:border-white/30 transition-all group">
              <div>
                <div className="text-[10px] text-white/40 font-mono mb-1 uppercase">{t.original_task}</div>
                <div className="text-sm">{t.translated_text}</div>
              </div>
              <button onClick={async () => {
                await supabase.from('tasks').delete().eq('id', t.id);
                loadTasks();
              }} className="text-white/10 hover:text-white">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}