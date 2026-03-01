import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Trash2, Share2, Bell, Lock, Download } from 'lucide-react';
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
  },
  'exercise': {
    standard: 'Engage in systematic physical exertion to elevate cardiovascular function.',
    pirate: 'Swab the deck and work yer muscles, ye lazy barnacle!',
    shakespeare: 'Moveth thy body with vigorous and healthful exertion.',
    manager: 'PHYSICAL CONDITIONING OVERDUE. EXECUTE WORKOUT REGIMEN WITHOUT DELAY.',
    cheerleader: 'YOU\'RE ABOUT TO ABSOLUTELY DOMINATE THIS WORKOUT! LET\'S GOOOO!'
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

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
      if (signUpErr) {
        alert(signUpErr.message);
      } else if (signUp.session) {
        setUser(signUp.session.user);
      } else {
        alert("Check your email or try logging in again!");
      }
    } else {
      setUser(signIn.session.user);
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-white text-[10px]">INITIALIZING...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-6xl font-bold tracking-tighter mb-10">OVERLY LITERAL</h1>
        <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4">
          <input type="email" placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent border-b border-white/20 p-2 font-mono text-xs" />
          <input type="password" placeholder="PASSWORD" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-transparent border-b border-white/20 p-2 font-mono text-xs" />
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
          <div className="flex gap-4">
            {isAdmin && <button onClick={() => setShowAdminDashboard(!showAdminDashboard)} className="text-[#00FF41] font-mono text-[10px]">ADMIN</button>}
            <button onClick={() => supabase.auth.signOut()} className="text-white/40 font-mono text-[10px]">EXIT</button>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <input value={taskInput} onChange={e => setTaskInput(e.target.value)} placeholder="Enter task..." className="flex-1 bg-transparent border-b border-white/20 py-2 font-mono text-sm" />
          <button onClick={addTask} className="border border-white/40 px-6 font-mono text-[10px]">ADD</button>
        </div>

        <div className="space-y-4">
          {tasks.map(t => (
            <div key={t.id} className="border border-white/10 p-4 flex justify-between items-start">
              <div>
                <div className="text-[10px] text-white/40 font-mono mb-1">{t.original_task}</div>
                <div className="text-sm">{t.translated_text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}