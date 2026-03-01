import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { supabase } from './src/supabase';

interface Task {
  id: string;
  original_task: string;
  translation_mode: string;
  translated_text: string;
  completed: boolean;
}

function getTaskTranslation(task: string, mode: string): string {
  if (mode === 'pirate') return `Plunder the task "${task}" from the horizon, arr!`;
  if (mode === 'shakespeare') return `Accomplisheth the noble deed of "${task}".`;
  return `Execute the prescribed task: "${task}".`;
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

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      else alert("Check your email or try logging in again!");
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

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-white text-[10px]">INITIALIZING...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-6xl font-bold tracking-tighter mb-10 text-center leading-none">OVERLY<br/>LITERAL</h1>
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
          <button onClick={() => supabase.auth.signOut()} className="text-white/40 font-mono text-[10px]">EXIT</button>
        </div>

        <div className="flex gap-4 mb-8">
          <input value={taskInput} onChange={e => setTaskInput(e.target.value)} placeholder="Enter task..." className="flex-1 bg-transparent border-b border-white/20 py-2 font-mono text-sm focus:outline-none" />
          <button onClick={addTask} className="border border-white/40 px-6 font-mono text-[10px] hover:bg-white hover:text-black transition-all">ADD</button>
        </div>

        <div className="space-y-4">
          {tasks.map(t => (
            <div key={t.id} className="border border-white/10 p-4 flex justify-between items-start hover:border-white/30 transition-all">
              <div>
                <div className="text-[10px] text-white/40 font-mono mb-1 uppercase">{t.original_task}</div>
                <div className="text-sm">{t.translated_text}</div>
              </div>
              <button onClick={() => deleteTask(t.id)} className="text-white/20 hover:text-white transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}