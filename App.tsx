import { useState, useEffect } from 'react';
import { Trash2, Plus, LogOut, Loader2, Lock, Shield, Copy, Check, Share2, ExternalLink } from 'lucide-react';
import { supabase } from './src/supabase';
import { motion, AnimatePresence } from 'framer-motion';

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
  streak_count: number;
  last_task_date: string | null;
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
  const keywordMappings: Record<string, Record<string, string>> = {
    pirate: {
      milk: "grog",
      gym: "the battle training grounds",
      work: "yer pillaging duties",
      sleep: "rest in yer bunk",
      email: "messages in bottles",
      buy: "plunder",
      get: "seize",
      go: "set sail for",
      meeting: "crew gathering",
      report: "ship's log",
      call: "hail",
      send: "dispatch across the seven seas",
      clean: "swab",
      finish: "complete yer voyage of",
      do: "prepare for battle with",
      tax: "the tax collectors",
      taxes: "those scurvy tax collectors"
    },
    shakespeare: {
      milk: "the white elixir of life",
      gym: "the arena where mortal flesh is tested",
      work: "thy most grievous labour",
      sleep: "surrender thy mortal coil to slumber",
      email: "most urgent correspondence",
      buy: "procure with thy coin",
      get: "seize upon",
      go: "venture forth unto",
      meeting: "fateful gathering",
      report: "scroll of grave import",
      call: "summon with great urgency",
      send: "dispatch posthaste",
      clean: "purge of all corruption",
      finish: "bring to its inevitable conclusion",
      do: "face thy destiny with",
      tax: "the tax burden",
      taxes: "those most cruel taxes that plague thee"
    },
    manager: {
      milk: "calcium-based liquid assets",
      gym: "mandatory wellness optimization session",
      work: "core deliverables",
      sleep: "scheduled offline period",
      email: "mission-critical stakeholder communications",
      buy: "leverage budget allocation for",
      get: "action",
      go: "align bandwidth with",
      meeting: "high-priority sync",
      report: "quarterly deck",
      call: "circle back with",
      send: "cascade information to",
      clean: "streamline and optimize",
      finish: "sunset the initiative around",
      do: "leverage synergies with",
      tax: "fiscal compliance obligations",
      taxes: "those tax compliance deliverables per executive mandate"
    },
    cheerleader: {
      milk: "divine calcium elixir",
      gym: "the Vitality Shrine",
      work: "your empire",
      sleep: "beauty restoration ritual",
      email: "iconic correspondence",
      buy: "manifest",
      get: "secure",
      go: "grace with your presence",
      meeting: "power circle",
      report: "masterpiece document",
      call: "connect with",
      send: "deliver your fabulousness to",
      clean: "bless",
      finish: "absolutely DEVOUR",
      do: "handle",
      tax: "taxes",
      taxes: "those taxes like the boss you are"
    }
  };

  const sentenceStarters: Record<string, string[]> = {
    pirate: ["ARRR, matey!", "AVAST, ye scallywag!", "SHIVER ME TIMBERS!", "BLOW ME DOWN!", "BY BLACKBEARD'S BEARD!"],
    shakespeare: ["Hark!", "Lo, what torment awaits!", "Verily, the hour is upon thee!", "Prithee,", "Alas!", "Forsooth!"],
    manager: ["RE: URGENT -", "PER MY LAST EMAIL:", "ACTION REQUIRED:", "FYI -", "CIRCLING BACK:", "LOOPING YOU IN:"],
    cheerleader: ["Umm, excuse me?!", "ICONIC!", "Main character energy!", "Listen bestie,"]
  };

  const actionPhrases: Record<string, Record<string, string>> = {
    pirate: {
      "i need to": "ye must set sail to",
      "i have to": "the captain orders ye to",
      "i should": "ye ought to",
      "i want to": "ye be wishin' to",
      "need to": "must",
      "have to": "be commanded to",
      "going to": "settin' sail to"
    },
    shakespeare: {
      "i need to": "thou must forthwith",
      "i have to": "'tis thy solemn duty to",
      "i should": "thou must needs",
      "i want to": "thou desirest most urgently to",
      "need to": "must with haste",
      "have to": "art bound by fate to",
      "going to": "shall venture forth to"
    },
    manager: {
      "i need to": "per our last standup, we need to align bandwidth to",
      "i have to": "the board requires us to leverage synergies with",
      "i should": "best practice dictates we",
      "i want to": "let's touch base offline and",
      "need to": "requires immediate bandwidth allocation to",
      "have to": "per executive mandate must",
      "going to": "will circle back to"
    },
    cheerleader: {
      "i need to": "you are going to",
      "i have to": "you GET to",
      "i should": "you will",
      "i want to": "you're going to",
      "need to": "are going to",
      "have to": "GET to",
      "go to": "grace with your presence",
      "go to the": "grace with your presence at"
    }
  };

  if (mode === 'standard') {
    return `Task: ${task}`;
  }

  const mapping = keywordMappings[mode] || {};
  const starters = sentenceStarters[mode] || [];
  const actions = actionPhrases[mode] || {};

  let transformed = task.toLowerCase();

  // Preserve proper names by finding capitalized words in original
  const properNouns: string[] = [];
  const words = task.split(/\s+/);
  words.forEach(word => {
    if (word.length > 0 && word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
      properNouns.push(word);
    }
  });

  Object.entries(actions).forEach(([phrase, replacement]) => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    transformed = transformed.replace(regex, replacement);
  });

  Object.entries(mapping).forEach(([word, replacement]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    transformed = transformed.replace(regex, replacement);
  });

  // Restore proper nouns with original capitalization
  properNouns.forEach(noun => {
    const regex = new RegExp(`\\b${noun}\\b`, 'gi');
    transformed = transformed.replace(regex, noun);
  });

  const starter = starters[Math.floor(Math.random() * starters.length)] || '';

  if (mode === 'pirate') {
    // Clean up awkward phrasing
    transformed = transformed.replace(/\bwhile you\b/gi, 'whilst ye');
    transformed = transformed.replace(/\band and\b/gi, 'and');

    transformed = transformed.charAt(0).toUpperCase() + transformed.slice(1);
    const endings = [
      "or ye'll be walkin' the plank!",
      "afore Davy Jones claims ye!",
      "lest the Kraken drag ye down!",
      "or surrender yer booty to the sea!"
    ];
    const ending = endings[Math.floor(Math.random() * endings.length)];
    return `${starter} ${transformed}, ${ending}`;
  }

  if (mode === 'shakespeare') {
    // Clean up awkward phrasing
    transformed = transformed.replace(/\bwhile you\b/gi, 'whilst thou');
    transformed = transformed.replace(/\band and\b/gi, 'and');

    transformed = transformed.charAt(0).toUpperCase() + transformed.slice(1);
    const endings = [
      "lest thou meet thy doom!",
      "ere darkness consumes thee!",
      "for time's winged chariot hurries near!",
      "or face thy tragic end!"
    ];
    const ending = endings[Math.floor(Math.random() * endings.length)];
    return `${starter} ${transformed}, ${ending}`;
  }

  if (mode === 'manager') {
    // Clean up awkward phrasing
    transformed = transformed.replace(/\bwhile you\b/gi, 'as we');
    transformed = transformed.replace(/\band and\b/gi, 'and');

    transformed = transformed.toUpperCase();
    const endings = [
      "IS NOW CRITICAL PATH.",
      "REQUIRES IMMEDIATE STAKEHOLDER ALIGNMENT.",
      "- LET'S TAKE THIS OFFLINE.",
      "PER EXECUTIVE DIRECTIVE."
    ];
    const ending = endings[Math.floor(Math.random() * endings.length)];
    return `${starter} ${transformed} ${ending}`;
  }

  if (mode === 'cheerleader') {
    // Clean up awkward phrasing
    transformed = transformed.replace(/\bwhile you\b/gi, 'and');
    transformed = transformed.replace(/\band and\b/gi, 'and');

    transformed = transformed.charAt(0).toUpperCase() + transformed.slice(1);
    const endings = ["Slay, bestie! 💅✨", "That's iconic behavior! ✨", "Main character energy only! 💅", "Absolutely DEVOUR this! ✨💅"];
    const ending = endings[Math.floor(Math.random() * endings.length)];
    return `${starter} ${transformed} and give them absolute MAIN CHARACTER ENERGY! ${ending}`;
  }

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
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
      })();
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
      console.log('Fetching profile for uid:', uid);
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
        console.log('Profile loaded successfully:', data);
        const adminStatus = data.is_admin === true;
        const premiumStatus = data.has_upgraded === true;

        setIsAdmin(adminStatus);
        setIsPremium(premiumStatus);
        setProfile(data);

        console.log('Admin status set to:', adminStatus);
        console.log('Premium status set to:', premiumStatus);
      } else {
        console.log('No profile found, creating new profile');
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
        setProfile(existingProfile);
        return;
      }

      const userEmail = user?.email || email;
      const isRod = userEmail === 'rod.puliceno@gmail.com';

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
        setProfile(data);
        if (isRod) {
          setIsAdmin(true);
          setIsPremium(true);
          console.log('Admin access granted for Rod');
        } else {
          setIsAdmin(data.is_admin === true);
          setIsPremium(data.has_upgraded === true);
        }
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
        if (signInErr.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
            email,
            password
          });

          if (signUpErr) {
            if (signUpErr.message.includes('User already registered')) {
              alert('Account exists but wrong password. Please try again with the correct password.');
            } else {
              alert(signUpErr.message);
            }
            setIsAuthenticating(false);
          } else if (signUpData.user) {
            const userEmail = signUpData.user.email;
            const isRod = userEmail === 'rod.puliceno@gmail.com';
            if (isRod) {
              setIsAdmin(true);
              setIsPremium(true);
              console.log('Admin access granted immediately for Rod');
            }
            await fetchProfile(signUpData.user.id);
          }
        } else {
          alert(signInErr.message);
          setIsAuthenticating(false);
        }
      } else if (data.user) {
        setUser(data.user);
        const isRod = data.user.email === 'rod.puliceno@gmail.com';
        if (isRod) {
          setIsAdmin(true);
          setIsPremium(true);
          console.log('Admin access granted immediately for Rod on sign in');
        }
        await fetchProfile(data.user.id);
        setIsAuthenticating(false);
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

      // Update streak
      await updateStreak();
    }
  }

  async function updateStreak() {
    if (!user) return;

    const { data, error } = await supabase.rpc('update_user_streak', { user_id: user.id });

    if (error) {
      console.error('Streak update error:', error);
    } else if (data !== null) {
      // Fetch updated profile to get the new streak count
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    }
  }

  async function copyToClipboard(text: string, taskId: string) {
    const brandedText = `${text}\n\n— Sent via Overly Literal 💅`;
    await navigator.clipboard.writeText(brandedText);
    setCopiedId(taskId);
    setShowToast(true);
    setTimeout(() => {
      setCopiedId(null);
      setShowToast(false);
    }, 2000);
  }

  function shareToTwitter(text: string) {
    const brandedText = `${text}\n\n— Sent via Overly Literal 💅`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(brandedText)}`;
    window.open(tweetUrl, '_blank', 'width=550,height=420');
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
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 font-mono text-xs tracking-wider shadow-lg z-50"
          >
            Copied to clipboard! ✨
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold tracking-tighter">OVERLY LITERAL</h1>
          <div className="flex gap-4 items-center">
            {profile && (
              <motion.div
                key={profile.streak_count}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex items-center gap-2 px-3 py-1 border border-orange-500/30 bg-orange-500/5"
              >
                <span className="font-mono text-sm font-bold text-orange-400">{profile.streak_count}</span>
                <span className="font-mono text-xs text-orange-400/60">DAY STREAK</span>
                <motion.span
                  key={`fire-${profile.streak_count}`}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="text-base"
                >
                  🔥
                </motion.span>
              </motion.div>
            )}
            {isAdmin && <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="text-[#00FF41] font-mono text-[10px] border border-[#00FF41] px-2 py-1 hover:bg-[#00FF41] hover:text-black transition-all">ADMIN</button>}
            <button onClick={() => supabase.auth.signOut()} className="text-white/30 hover:text-white"><LogOut size={20} /></button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { key: 'standard', emoji: '📋', label: 'STANDARD' },
            { key: 'pirate', emoji: '🏴‍☠️', label: 'PIRATE' },
            { key: 'shakespeare', emoji: '🎭', label: 'SHAKESPEARE' },
            { key: 'manager', emoji: '💼', label: 'MANAGER' },
            { key: 'cheerleader', emoji: '📣', label: 'CHEERLEADER' }
          ].map(({ key, emoji, label }) => {
            const isLocked = key !== 'standard' && !isPremium;
            const isActive = mode === key;
            return (
              <button
                key={key}
                onClick={() => isLocked ? alert("Upgrade required") : setMode(key)}
                className={`px-4 py-2 text-[9px] font-mono border transition-all flex items-center gap-2 ${
                  isActive
                    ? 'border-white bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'border-white/10 text-white/30 hover:border-white/30'
                }`}
              >
                <span className="text-sm">{emoji}</span>
                {label}
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

        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">✨</div>
            <div className="text-xl text-white/50 font-mono">No burdens?</div>
            <div className="text-3xl text-white font-bold mt-2">You're living the dream!</div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {tasks.map(t => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="border border-white/10 p-5 group"
                >
                  <div className="flex flex-row items-center justify-between w-full mb-3">
                    <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                      {t.persona}
                    </div>
                    <div className="flex flex-row gap-3 items-center">
                      <button
                        onClick={() => copyToClipboard(t.translated_text, t.id)}
                        className="text-white/60 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all"
                        title="Copy to clipboard"
                      >
                        {copiedId === t.id ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                      </button>
                      <a
                        href={`https://x.com/intent/post?text=${encodeURIComponent(`${t.translated_text}\n\n— Sent via Overly Literal 💅`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-blue-400 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all inline-flex items-center justify-center"
                        title="Share to X/Twitter"
                      >
                        <ExternalLink size={18} />
                      </a>
                      <button
                        onClick={() => supabase.from('tasks').delete().eq('id', t.id).then(loadTasks)}
                        className="text-white/60 hover:text-red-400 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all"
                        title="Delete task"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="w-full pt-2">
                    <div className="text-sm leading-relaxed break-words">{t.translated_text}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}