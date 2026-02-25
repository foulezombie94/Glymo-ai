// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import { logSecurity } from '../../lib/logger';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: (direction) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  })
};

export default function AuthSignup() {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const content = {
    EN: {
      appName: "Onboarding",
      step1Title: "What's your",
      step1Highlight: "name?",
      step1Desc: "We'll use this to personalize your calorie tracking and nutrition journey.",
      step1Label: "Full Name",
      step1Placeholder: "Enter your full name",
      step1Tip: "Your name helps our AI assistant address you properly during your daily check-ins.",
      
      step2Title: "What's your",
      step2Highlight: "email?",
      step2Desc: "We need this to securely save your progress and send weekly insights.",
      step2Label: "Email Address",
      step2Placeholder: "you@example.com",
      step2Tip: "We respect your privacy and will never spam your inbox.",
      
      step3Title: "Create your",
      step3Highlight: "password",
      step3Desc: "Choose a strong password to keep your nutrition and photo data secure.",
      step3Label: "Password",
      step3Placeholder: "At least 6 characters",
      pwdStrength: "Password Strength",
      pwdGood: "Good",
      pwdRule1: "At least 6 characters",
      pwdEncrypted: "Your password is encrypted and never shared.",
      
      continue: "Continue",
      creating: "Creating account...",
      loginLink: "Login"
    },
    FR: {
      appName: "Intégration",
      step1Title: "Quel est votre",
      step1Highlight: "nom ?",
      step1Desc: "Nous l'utiliserons pour personnaliser votre suivi calorique.",
      step1Label: "Nom Complet",
      step1Placeholder: "Entrez votre nom complet",
      step1Tip: "Votre nom aide notre assistant IA à s'adresser correctement à vous.",
      
      step2Title: "Quel est votre",
      step2Highlight: "email ?",
      step2Desc: "Nécessaire pour sauvegarder vos progrès en toute sécurité.",
      step2Label: "Adresse Email",
      step2Placeholder: "vous@exemple.com",
      step2Tip: "Nous respectons votre vie privée et ne vous enverrons pas de spam.",
      
      step3Title: "Créez votre",
      step3Highlight: "mot de passe",
      step3Desc: "Choisissez un mot de passe fort pour protéger vos données.",
      step3Label: "Mot de passe",
      step3Placeholder: "Au moins 6 caractères",
      pwdStrength: "Force du mot de passe",
      pwdGood: "Bon",
      pwdRule1: "Au moins 6 caractères",
      pwdEncrypted: "Votre mot de passe est crypté et n'est jamais partagé.",
      
      continue: "Continuer",
      creating: "Création en cours...",
      loginLink: "Connexion"
    },
    ES: {
      appName: "Registro",
      step1Title: "¿Cuál es tu",
      step1Highlight: "nombre?",
      step1Desc: "Lo usaremos para personalizar tu seguimiento calórico.",
      step1Label: "Nombre Completo",
      step1Placeholder: "Ingresa tu nombre completo",
      step1Tip: "Tu nombre ayuda a nuestro asistente de IA a dirigirse a ti correctamente.",
      
      step2Title: "¿Cuál es tu",
      step2Highlight: "correo?",
      step2Desc: "Lo necesitamos para guardar tu progreso de forma segura.",
      step2Label: "Correo Electrónico",
      step2Placeholder: "tu@ejemplo.com",
      step2Tip: "Respetamos tu privacidad y nunca enviaremos spam.",
      
      step3Title: "Crea tu",
      step3Highlight: "contraseña",
      step3Desc: "Elige una contraseña segura para proteger tus datos.",
      step3Label: "Contraseña",
      step3Placeholder: "Al menos 6 caracteres",
      pwdStrength: "Fuerza de la contraseña",
      pwdGood: "Buena",
      pwdRule1: "Al menos 6 caracteres",
      pwdEncrypted: "Tu contraseña está encriptada y nunca se comparte.",
      
      continue: "Continuar",
      creating: "Creando cuenta...",
      loginLink: "Iniciar sesión"
    }
  };

  const currentContent = content[lang] || content['EN'];
  const progressPercent = step === 1 ? 25 : step === 2 ? 50 : 75;

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1 && name.trim()) {
      setDirection(1);
      setStep(2);
    } else if (step === 2 && email.trim()) {
      setDirection(1);
      setStep(3);
    } else if (step === 3 && password.length >= 6) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (authError) {
        logSecurity('AUTH_SIGNUP', 'WARN', { email, success: false, reason: authError.message });
        throw authError;
      }
      
      logSecurity('AUTH_SIGNUP', 'INFO', { email, success: true });
      navigate('/onboarding/source');
    } catch (err) {
      console.error('Error during signup:', err);
      setError(err.message || "An error occurred during registration.");
      setLoading(false);
    }
  };

  return (
    <div className="text-slate-900 dark:text-slate-100 antialiased h-full font-display bg-white dark:bg-slate-900 overflow-hidden">
      <div className="relative flex flex-col h-full w-full max-w-[430px] mx-auto bg-white dark:bg-slate-900 shadow-2xl">
        
        {/* Decorative background elements */}
        <div className="fixed -top-24 -right-24 size-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none -z-0"></div>
        <div className="fixed top-1/2 -left-24 size-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

        {/* Top Navigation Bar - Condensed & Safe Area */}
        <nav className="flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-30 shrink-0 border-b border-slate-100 dark:border-slate-800 safe-top pb-3">
          <button 
            type="button"
            onClick={handleBack} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-rounded">chevron_left</span>
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-green-500/80 mb-0.5">{currentContent.appName}</span>
            <span className="text-sm font-semibold">Step {step} of 4</span>
          </div>

          <button 
            type="button"
            onClick={toggleLanguage}
            className="h-10 px-3 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <span className="material-symbols-rounded text-[18px]">language</span>
            <span className="text-xs font-bold tracking-wider">{lang}</span>
          </button>
        </nav>

        {/* Progress Indicator */}
        <div className="px-6 py-2 shrink-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(34,197,94,0.4)]" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Active Step Content - Scrollable to handle keyboard */}
        <div className="flex-1 relative z-10 overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="h-full w-full overflow-y-auto no-scrollbar px-6 pt-6 pb-40"
            >
              <form onSubmit={handleNext} className="min-h-full flex flex-col">
                
                {/* Headers per step - More compact */}
                <header className="mb-8">
                  {step === 3 && (
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-500/10 mb-4 border border-green-500/20 shadow-sm">
                      <span className="material-symbols-rounded text-green-500 text-2xl">lock</span>
                    </div>
                  )}

                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3 leading-tight">
                    {step === 1 && <>{currentContent.step1Title} <span className="text-green-500">{currentContent.step1Highlight}</span></>}
                    {step === 2 && <>{currentContent.step2Title} <span className="text-green-500">{currentContent.step2Highlight}</span></>}
                    {step === 3 && <>{currentContent.step3Title} <span className="text-green-500">{currentContent.step3Highlight}</span></>}
                  </h1>
                  
                  <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step === 1 && currentContent.step1Desc}
                    {step === 2 && currentContent.step2Desc}
                    {step === 3 && currentContent.step3Desc}
                  </p>
                </header>

                {/* Inputs per step */}
                <div className="space-y-6">
                  {step === 1 && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        {currentContent.step1Label}
                      </label>
                      <div className="relative group">
                        <input 
                          autoFocus
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={currentContent.step1Placeholder}
                          required
                          className={`w-full h-14 pl-6 pr-14 rounded-2xl border transition-all duration-300 text-base font-bold shadow-sm outline-none ${
                            name.length > 2 
                              ? 'border-green-500 bg-green-500/5 focus:bg-white dark:focus:bg-slate-800' 
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:border-green-500/50'
                          }`} 
                        />
                        <div className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors ${name.length > 2 ? 'text-green-500' : 'text-slate-300'}`}>
                          <span className="material-symbols-rounded text-2xl">{name.length > 2 ? 'check_circle' : 'person'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-green-500/5 border border-green-500/10 mt-6">
                        <span className="material-symbols-rounded text-green-500 text-xl shrink-0 mt-0.5">info</span>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug font-medium">
                          {currentContent.step1Tip}
                        </p>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        {currentContent.step2Label}
                      </label>
                      <div className="relative group">
                        <input 
                          autoFocus
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={currentContent.step2Placeholder}
                          required
                          className={`w-full h-14 pl-6 pr-14 rounded-2xl border transition-all duration-300 text-base font-bold shadow-sm outline-none ${
                            email.includes('@') && email.includes('.')
                              ? 'border-green-500 bg-green-500/5 focus:bg-white dark:focus:bg-slate-800' 
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:border-green-500/50'
                          }`} 
                        />
                        <div className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors ${email.includes('@') ? 'text-green-500' : 'text-slate-300'}`}>
                          <span className="material-symbols-rounded text-2xl">{email.includes('@') && email.includes('.') ? 'check_circle' : 'mail'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-green-500/5 border border-green-500/10 mt-6">
                        <span className="material-symbols-rounded text-green-500 text-xl shrink-0 mt-0.5">verified_user</span>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug font-medium">
                          {currentContent.step2Tip}
                        </p>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        {currentContent.step3Label}
                      </label>
                      <div className="relative group">
                        <input 
                          autoFocus
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={currentContent.step3Placeholder}
                          required
                          minLength={6}
                          className={`w-full h-14 pl-6 pr-14 rounded-2xl border transition-all duration-300 text-base font-bold shadow-sm outline-none tracking-widest ${
                            password.length >= 6
                              ? 'border-green-500 bg-green-500/5 focus:bg-white dark:focus:bg-slate-800' 
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:border-green-500/50'
                          }`} 
                        />
                        <div className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors ${password.length >= 6 ? 'text-green-500' : 'text-slate-300'}`}>
                          <span className="material-symbols-rounded text-2xl">{password.length >= 6 ? 'check_circle' : 'lock'}</span>
                        </div>
                      </div>

                      <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{currentContent.pwdStrength}</span>
                          <span className={`text-sm font-extrabold ${password.length >= 6 ? 'text-green-500' : 'text-slate-400'}`}>
                            {password.length >= 6 ? currentContent.pwdGood : ''}
                          </span>
                        </div>
                        <div className="flex gap-1.5 h-2">
                          <div className={`flex-1 rounded-full transition-colors duration-500 ${password.length > 0 ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                          <div className={`flex-1 rounded-full transition-colors duration-500 ${password.length >= 3 ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                          <div className={`flex-1 rounded-full transition-colors duration-500 ${password.length >= 6 ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                        </div>
                        
                        <div className="pt-3">
                          <div className={`flex items-center gap-3 transition-opacity ${password.length >= 6 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${password.length >= 6 ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-700 text-transparent'}`}>
                              {password.length >= 6 && <span className="material-symbols-rounded text-sm font-bold">check</span>}
                            </div>
                            <span className={`text-sm font-bold ${password.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
                              {currentContent.pwdRule1}
                            </span>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-3 mt-4 font-medium">
                          <span className="material-symbols-rounded text-lg shrink-0 mt-0.5">error</span>
                          <p>{error}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dummy submit button strictly to allow form submission on "Enter" */}
                <button type="submit" className="hidden"></button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Fixed Bottom Action Area */}
        <div className="absolute bottom-0 w-full px-6 z-40 bg-gradient-to-t from-white dark:from-slate-900 via-white/100 dark:via-slate-900/100 to-transparent safe-bottom pt-10">
          <button 
            onClick={handleNext}
            disabled={loading || (step === 3 && password.length < 6)}
            className={`w-full h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-2xl ${
              loading 
                ? 'bg-green-400 text-white cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30 active:scale-[0.98]'
            } ${step === 3 && password.length < 6 ? 'opacity-50 cursor-not-allowed shadow-none' : ''}`}
          >
            {loading ? (
              <>
                <span className="material-symbols-rounded animate-spin">progress_activity</span>
                <span>{currentContent.creating}</span>
              </>
            ) : (
              <>
                <span>{currentContent.continue}</span>
                <span className="material-symbols-rounded">arrow_forward</span>
              </>
            )}
          </button>
          
          {step === 3 && (
            <p className="text-center mt-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex justify-center items-center gap-1.5">
              <span className="material-symbols-rounded text-xs">lock</span>
              {currentContent.pwdEncrypted}
            </p>
          )}
        </div>
        
        {/* Decorative Indicator (Static Visual Element) */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-50 pointer-events-none opacity-30"></div>
      </div>
    </div>
  );
}
