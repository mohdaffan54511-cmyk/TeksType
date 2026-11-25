export const DEVELOPER_LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "typescript", label: "TypeScript" },
  { id: "cpp", label: "C++" },
  { id: "html_css", label: "HTML/CSS" },
  { id: "sql", label: "SQL" },
];

export const CODE_SNIPPETS = {
  javascript: {
    beginner: [
      "const totalScore = scores.reduce((acc, curr) => acc + curr, 0);",
      "const userList = users.filter((u) => u.isActive && u.age >= 18);",
      "const formattedDate = new Intl.DateTimeFormat('en-IN').format(new Date());",
      "localStorage.setItem('tp_streak', JSON.stringify({ streak: 5 }));",
      "const calculateWPM = (chars, seconds) => Math.round((chars / 5) / (seconds / 60));",
      "const uniqueTags = [...new Set(blogPosts.map(post => post.category))];",
      "const isMobile = window.matchMedia('(max-width: 768px)').matches;",
    ],
    intermediate: [
      "async function fetchMetrics(endpoint) {\n  const response = await fetch(endpoint);\n  if (!response.ok) throw new Error('Network error');\n  return await response.json();\n}",
      "const debounce = (fn, delay = 300) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n};",
      "const copyToClipboard = async (text) => {\n  try {\n    await navigator.clipboard.writeText(text);\n    return true;\n  } catch (err) {\n    return false;\n  }\n};",
      "const playKeySound = (audioContext, freq = 600) => {\n  const osc = audioContext.createOscillator();\n  osc.connect(audioContext.destination);\n  osc.start();\n  osc.stop(audioContext.currentTime + 0.04);\n};",
    ],
    advanced: [
      "class PerformanceMonitor {\n  constructor(sampleSize = 50) {\n    this.samples = [];\n    this.size = sampleSize;\n  }\n  record(latency) {\n    if (this.samples.length >= this.size) this.samples.shift();\n    this.samples.push(latency);\n  }\n}",
      "const memoize = (fn) => {\n  const cache = new Map();\n  return (...args) => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  };\n};",
    ],
  },
  python: {
    beginner: [
      "numbers = [n ** 2 for n in range(10) if n % 2 == 0]",
      "sorted_data = sorted(records, key=lambda item: item['timestamp'], reverse=True)",
      "total_revenue = sum(inv['amount'] for inv in invoice_list if inv['status'] == 'paid')",
      "cleaned_keys = {k.strip().lower(): v for k, v in raw_dict.items()}",
      "file_names = [f for f in os.listdir('.') if f.endswith('.xlsx')]",
    ],
    intermediate: [
      "def normalize_phone_number(raw_phone: str) -> str:\n    digits = [ch for ch in raw_phone if ch.isdigit()]\n    return ''.join(digits[-10:])",
      "import pandas as pd\ndf = pd.read_excel('sales_data.xlsx')\nsummary = df.groupby('Category')['Revenue'].sum()",
      "def generate_slug(title: str) -> str:\n    import re\n    clean = re.sub(r'[^a-zA-Z0-9\\s]', '', title).lower()\n    return '-'.join(clean.split())",
    ],
    advanced: [
      "class DatabaseSession:\n    def __enter__(self):\n        self.conn = engine.connect()\n        return self.conn\n    def __exit__(self, exc_type, exc_val, exc_tb):\n        self.conn.close()",
      "import asyncio\nasync def fetch_all(urls):\n    tasks = [asyncio.create_task(download(url)) for url in urls]\n    return await asyncio.gather(*tasks)",
    ],
  },
  typescript: {
    beginner: [
      "interface UserProfile {\n  id: string;\n  wpm: number;\n  accuracy: number;\n  isPro: boolean;\n}",
      "type ResultCallback = (status: 'success' | 'failure', code: number) => void;",
      "type SwitchSound = 'blue' | 'brown' | 'red' | 'silent';",
      "const formatCurrency = (val: number, cur: string = 'INR'): string => `${cur} ${val.toLocaleString()}`;",
    ],
    intermediate: [
      "export const calculateConsistency = (intervals: number[]): number => {\n  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;\n  return Math.round(100 - (Math.abs(avg) / 10));\n};",
      "type ApiResponse<T> = {\n  status: 200 | 400 | 500;\n  data: T;\n  message?: string;\n};",
    ],
    advanced: [
      "type DeepPartial<T> = {\n  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];\n};",
      "type NonNullableFields<T> = {\n  [K in keyof T]-?: NonNullable<T[K]>;\n};",
    ],
  },
  cpp: {
    beginner: [
      "#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Ready to code\" << endl;\n    return 0;\n}",
      "vector<int> nums = {1, 2, 3, 4, 5};\nsort(nums.begin(), nums.end(), greater<int>());",
      "int charCount = text.length();\ndouble minutes = elapsedSeconds / 60.0;",
    ],
    intermediate: [
      "template <typename T>\nT getMax(T a, T b) {\n    return (a > b) ? a : b;\n}",
      "int binarySearch(const vector<int>& arr, int target) {\n    int l = 0, r = arr.size() - 1;\n    while (l <= r) {\n        int mid = l + (r - l) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) l = mid + 1; else r = mid - 1;\n    }\n    return -1;\n}",
    ],
    advanced: [
      "class Node {\npublic:\n    int value;\n    Node* next;\n    Node(int val) : value(val), next(nullptr) {}\n};",
      "template<typename Container>\nauto printAll(const Container& c) -> decltype(c.begin(), void()) {\n    for (const auto& item : c) std::cout << item << ' ';\n}",
    ],
  },
  html_css: {
    beginner: [
      "<div className=\"container flex items-center justify-between p-4\">\n  <h1 className=\"text-xl font-bold\">Type Perfectly</h1>\n</div>",
      ".card { display: flex; align-items: center; justify-content: center; border-radius: 12px; }",
      "<button className=\"px-4 py-2 bg-primary text-white rounded-lg shadow hover:opacity-90\">\n  Start Test\n</button>",
    ],
    intermediate: [
      "@media (max-width: 768px) {\n  .practice-layout {\n    flex-direction: column;\n    width: 100%;\n  }\n}",
      ".typing-caret {\n  width: 2px;\n  animation: blink 1s ease-in-out infinite;\n  background-color: #7c3aed;\n}",
    ],
    advanced: [
      ":root {\n  --primary: #7c3aed;\n  --surface: rgba(255, 255, 255, 0.95);\n  --shadow: 0 14px 34px rgba(74, 36, 199, 0.1);\n}",
      ".glassmorphism {\n  background: rgba(255, 255, 255, 0.4);\n  backdrop-filter: blur(12px);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n}",
    ],
  },
  sql: {
    beginner: [
      "SELECT user_id, MAX(wpm) AS best_wpm FROM typing_sessions GROUP BY user_id;",
      "UPDATE guest_profiles SET current_streak = current_streak + 1 WHERE id = 'guest_101';",
      "SELECT * FROM tests WHERE accuracy >= 95 ORDER BY wpm DESC LIMIT 10;",
    ],
    intermediate: [
      "SELECT DATE(created_at) AS session_date, AVG(accuracy) AS avg_acc\nFROM results_log\nGROUP BY DATE(created_at)\nORDER BY session_date DESC;",
      "SELECT category, COUNT(*) as total_tests\nFROM session_history\nWHERE status = 'completed'\nGROUP BY category HAVING COUNT(*) > 5;",
    ],
    advanced: [
      "WITH RankedSessions AS (\n  SELECT user_id, wpm, DENSE_RANK() OVER (ORDER BY wpm DESC) as ranking\n  FROM sessions\n)\nSELECT * FROM RankedSessions WHERE ranking <= 10;",
      "CREATE INDEX idx_user_timestamp ON typing_logs(user_id, session_time DESC);",
    ],
  },
};
