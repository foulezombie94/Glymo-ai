const fs = require('fs');

// 1. Dashboard.jsx unused 'progressPercent'
const dPath = 'src/pages/Dashboard.jsx';
let dCode = fs.readFileSync(dPath, 'utf8');
dCode = dCode.replace('const progressPercent = Math.min((consumedCalories / dailyGoal) * 100, 100);', '');
fs.writeFileSync(dPath, dCode);

// 2. LanguageContext.jsx react-refresh & useEffect issue
const lPath = 'src/context/LanguageContext.jsx';
let lCode = fs.readFileSync(lPath, 'utf8');
lCode = '/* eslint-disable react-refresh/only-export-components */\n' + lCode;
lCode = lCode.replace(/const \[lang, setLang\] = useState\('EN'\);\s*useEffect\(\(\) => \{\s*const savedLang = localStorage\.getItem\('app_lang'\);\s*if \(savedLang\) \{\s*setLang\(savedLang\);\s*\}\s*\}, \[\]\);/g, 'const [lang, setLang] = useState(() => localStorage.getItem("app_lang") || "EN");');
fs.writeFileSync(lPath, lCode);

// 3. MealContext.jsx react-refresh
const mPath = 'src/context/MealContext.jsx';
let mCode = fs.readFileSync(mPath, 'utf8');
mCode = '/* eslint-disable react-refresh/only-export-components */\n' + mCode;
fs.writeFileSync(mPath, mCode);

// 4. Auths unused 'data'
const authSignupPath = 'src/pages/onboarding/AuthSignup.jsx';
let aCode = fs.readFileSync(authSignupPath, 'utf8');
aCode = aCode.replace('const { data, error: authError } = await', 'const { error: authError } = await');
fs.writeFileSync(authSignupPath, aCode);

// 5. 'motion' unused vars in many places
const files = [
  'src/pages/Dashboard.jsx',
  'src/pages/PremiumUpgrade.jsx',
  'src/pages/Profile.jsx',
  'src/pages/ScanResults.jsx',
  'src/pages/Scanner.jsx',
  'src/pages/Statistics.jsx',
  'src/pages/Welcome.jsx',
  'src/pages/onboarding/AuthSignin.jsx',
  'src/pages/onboarding/AuthSignup.jsx',
  'src/pages/onboarding/DiscoverySource.jsx',
  'src/pages/onboarding/GoalSelection.jsx',
  'src/pages/onboarding/PersonalDetails.jsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let code = fs.readFileSync(f, 'utf8');
    if (!code.includes('eslint-disable-next-line no-unused-vars')) {
      code = code.replace(/import \{ motion/g, '// eslint-disable-next-line no-unused-vars\nimport { motion');
      fs.writeFileSync(f, code);
    }
  }
});

console.log('Fixed scripts!');
