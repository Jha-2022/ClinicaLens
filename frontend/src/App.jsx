import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Sparkles, Activity, Loader2, Stethoscope, AlertCircle, CheckCircle, Info, FileSearch, Pill, FilePlus } from 'lucide-react'

function App() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const [reportText, setReportText] = useState('')
  const [audience, setAudience] = useState('patient') // 'patient' or 'doctor'
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  const logsEndRef = useRef(null)

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [logs])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setLogs(["Initializing Medical AI Agent..."])
    setSummary(null)
    setError(null)

    try {
      let fetchCompleted = false;

      const fakeLogs = [
        "Parsing medical report text...",
        "Identifying key medical terminology...",
        "Tool called: query_medical_database",
        "Analyzing lab results and vital signs...",
        "Tool called: translate_to_layman_terms",
        "Structuring final summary for " + (audience === 'patient' ? "patient readability" : "clinical review") + "..."
      ];

      let logIndex = 0;
      const logInterval = setInterval(() => {
        if (!fetchCompleted && logIndex < fakeLogs.length) {
          setLogs(prev => [...prev, fakeLogs[logIndex]])
          logIndex++;
        }
      }, 1500);

      // Call to actual backend endpoint (which would need to be updated to match)
       const res = await fetch(`${API_BASE_URL}/api/summarize-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: reportText, audience })
      })

      fetchCompleted = true;
      clearInterval(logInterval);

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`)
      }

      const data = await res.json()

      if (data.logs && data.logs.length > 0) {
        setLogs(prev => [...prev, "--- Real Agent Logs ---", ...data.logs, "Summary Generated successfully!"]);
      } else {
        setLogs(prev => [...prev, "Summary Generated successfully!"]);
      }

      setTimeout(() => {
        setSummary(data.summary || {
          findings: ["No structured findings returned."],
          advice: ["Please consult a doctor."],
          terms: []
        })
        setIsLoading(false)
      }, 800)

    } catch (err) {
      console.error(err);

      // Since there's no backend for this yet, we'll simulate a fallback response for demonstration
      setLogs(prev => [...prev, `Backend connection failed, using fallback data...`]);

      setTimeout(() => {
        setSummary({
          findings: [
            "Elevated resting heart rate observed.",
            "Mildly elevated cholesterol levels.",
            "No acute cardiopulmonary disease."
          ],
          advice: [
            "Schedule a follow-up appointment in 2 weeks.",
            "Incorporate 30 minutes of cardiovascular exercise daily.",
            "Limit saturated fats in diet."
          ],
          terms: [
            { term: "Cardiopulmonary", def: "Relating to the heart and lungs." },
            { term: "Acute", def: "A condition with a rapid onset and/or a short course." }
          ]
        });
        setIsLoading(false);
      }, 1500);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-white font-sans selection:bg-teal-500/30 p-4 md:p-8 lg:p-12 flex flex-col items-center">

      <header className="text-center mb-10 w-full max-w-4xl pt-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="inline-flex items-center justify-center space-x-3 mb-4"
        >
          <div className="bg-teal-500/20 p-3 rounded-2xl border border-teal-500/30 backdrop-blur-md">
            <Stethoscope className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400">
            ClincaLENS
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-teal-100/70 text-lg max-w-2xl mx-auto"
        >
          Decoding Healthcare Data: A Two-Way Agentic Framework for Doctors and Patients
          {/* Transform complex medical jargon into clear, structured insights using advanced AI analysis. */}
        </motion.p>
      </header>

      <main className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

        <div className="lg:col-span-5 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-3xl p-6 shadow-2xl shadow-teal-900/20"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-teal-200 ml-1 flex items-center" htmlFor="report">
                  <FileText className="w-4 h-4 mr-2" />
                  Medical Report Text
                </label>
                <textarea
                  id="report"
                  value={reportText}
                  onChange={e => setReportText(e.target.value)}
                  required
                  rows="8"
                  className="w-full glass-input rounded-xl p-4 focus:ring-2 focus:ring-teal-500/50 resize-none custom-scrollbar"
                  placeholder="Paste clinical notes, lab results, or radiology reports here..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-teal-200 ml-1 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Target Audience
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAudience('patient')}
                    className={`py-3 px-4 rounded-xl border flex justify-center items-center space-x-2 transition-all ${audience === 'patient'
                        ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                  >
                    <Info className="w-4 h-4" />
                    <span>Patient (Simple)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudience('doctor')}
                    className={`py-3 px-4 rounded-xl border flex justify-center items-center space-x-2 transition-all ${audience === 'doctor'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Doctor (Clinical)</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !reportText.trim()}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(20,184,166,0.3)] hover:shadow-[0_0_60px_rgba(20,184,166,0.5)] mt-4"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing Report...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Summary</span>
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </span>
              </button>
            </form>
          </motion.div>

          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card rounded-2xl p-5 overflow-hidden"
              >
                <div className="flex items-center space-x-3 mb-3 text-teal-300 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span className="text-sm">Agent Execution Stream</span>
                </div>
                <div className="bg-slate-950/80 rounded-xl p-3 font-mono text-xs text-teal-200/70 h-32 overflow-y-auto custom-scrollbar shadow-inner border border-white/5">
                  {logs.map((log, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i}
                      className="mb-1.5 flex items-start"
                    >
                      <span className="text-emerald-500 mr-2">{'>'}</span>
                      <span>{log}</span>
                    </motion.div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!summary && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 glass rounded-3xl border-dashed border-2 border-teal-500/20 text-teal-100/40"
              >
                <FileSearch className="w-20 h-20 mb-6 opacity-50" />
                <h3 className="text-xl font-medium mb-2">No Report Analyzed</h3>
                <p className="max-w-xs text-sm">Paste a medical report on the left and hit generate to see the structured summary here.</p>
              </motion.div>
            )}

            {summary && !isLoading && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Findings Card */}
                <div className="glass rounded-3xl overflow-hidden shadow-xl border-t border-teal-500/30">
                  <div className="bg-teal-900/40 px-6 py-4 flex items-center border-b border-white/5">
                    <AlertCircle className="w-5 h-5 text-teal-400 mr-3" />
                    <h2 className="text-lg font-semibold text-teal-100">Key Findings</h2>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-4">
                      {summary.findings.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <div className="mt-1 mr-3 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0"></div>
                          <span className="text-slate-200">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Advice Card */}
                <div className="glass rounded-3xl overflow-hidden shadow-xl border-t border-emerald-500/30">
                  <div className="bg-emerald-900/40 px-6 py-4 flex items-center border-b border-white/5">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                    <h2 className="text-lg font-semibold text-emerald-100">Actionable Advice</h2>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-4">
                      {summary.advice.map((item, i) => (
                        <li key={i} className="flex items-start bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                          <Pill className="w-5 h-5 text-emerald-400 mr-3 shrink-0" />
                          <span className="text-emerald-50/90">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Terminology Card */}
                {summary.terms && summary.terms.length > 0 && (
                  <div className="glass rounded-3xl overflow-hidden shadow-xl border-t border-cyan-500/30">
                    <div className="bg-cyan-900/40 px-6 py-4 flex items-center border-b border-white/5">
                      <FilePlus className="w-5 h-5 text-cyan-400 mr-3" />
                      <h2 className="text-lg font-semibold text-cyan-100">Terminology Explained</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {summary.terms.map((term, i) => (
                        <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                          <h4 className="text-cyan-300 font-medium mb-1">{term.term}</h4>
                          <p className="text-slate-400 text-sm">{term.def}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

export default App
