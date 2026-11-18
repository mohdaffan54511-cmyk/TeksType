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
    ],
    intermediate: [
      "async function fetchMetrics(endpoint) {\n  const response = await fetch(endpoint);\n  if (!response.ok) throw new Error('Network error');\n  return await response.json();\n}",
      "const debounce = (fn, delay = 300) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n};",
    ],
    advanced: [
      "class PerformanceMonitor {\n  constructor(sampleSize = 50) {\n    this.samples = [];\n    this.size = sampleSize;\n  }\n  record(latency) {\n    if (this.samples.length >= this.size) this.samples.shift();\n    this.samples.push(latency);\n  }\n}",
    ],
  },
  python: {
    beginner: [
      "numbers = [n ** 2 for n in range(10) if n % 2 == 0]",
      "sorted_data = sorted(records, key=lambda item: item['timestamp'], reverse=True)",
      "total_revenue = sum(inv['amount'] for inv in invoice_list if inv['status'] == 'paid')",
    ],
    intermediate: [
      "def normalize_phone_number(raw_phone: str) -> str:\n    digits = [ch for ch in raw_phone if ch.isdigit()]\n    return ''.join(digits[-10:])",
      "import pandas as pd\ndf = pd.read_excel('sales_data.xlsx')\nsummary = df.groupby('Category')['Revenue'].sum()",
    ],
    advanced: [
      "class DatabaseSession:\n    def __enter__(self):\n        self.conn = engine.connect()\n        return self.conn\n    def __exit__(self, exc_type, exc_val, exc_tb):\n        self.conn.close()",
    ],
  },
  typescript: {
    beginner: [
      "interface UserProfile {\n  id: string;\n  wpm: number;\n  accuracy: number;\n  isPro: boolean;\n}",
      "type ResultCallback = (status: 'success' | 'failure', code: number) => void;",
    ],
    intermediate: [
      "export const calculateConsistency = (intervals: number[]): number => {\n  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;\n  return Math.round(100 - (Math.abs(avg) / 10));\n};",
    ],
    advanced: [
      "type DeepPartial<T> = {\n  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];\n};",
    ],
  },
  cpp: {
    beginner: [
      "#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Ready to code\" << endl;\n    return 0;\n}",
      "vector<int> nums = {1, 2, 3, 4, 5};\nsort(nums.begin(), nums.end(), greater<int>());",
    ],
    intermediate: [
      "template <typename T>\nT getMax(T a, T b) {\n    return (a > b) ? a : b;\n}",
    ],
    advanced: [
      "class Node {\npublic:\n    int value;\n    Node* next;\n    Node(int val) : value(val), next(nullptr) {}\n};",
    ],
  },
  html_css: {
    beginner: [
      "<div className=\"container flex items-center justify-between p-4\">\n  <h1 className=\"text-xl font-bold\">Type Perfectly</h1>\n</div>",
      ".card { display: flex; align-items: center; justify-content: center; border-radius: 12px; }",
    ],
    intermediate: [
      "@media (max-width: 768px) {\n  .practice-layout {\n    flex-direction: column;\n    width: 100%;\n  }\n}",
    ],
    advanced: [
      ":root {\n  --primary: #7c3aed;\n  --surface: rgba(255, 255, 255, 0.95);\n  --shadow: 0 14px 34px rgba(74, 36, 199, 0.1);\n}",
    ],
  },
  sql: {
    beginner: [
      "SELECT user_id, MAX(wpm) AS best_wpm FROM typing_sessions GROUP BY user_id;",
      "UPDATE guest_profiles SET current_streak = current_streak + 1 WHERE id = 'guest_101';",
    ],
    intermediate: [
      "SELECT DATE(created_at) AS session_date, AVG(accuracy) AS avg_acc\nFROM results_log\nGROUP BY DATE(created_at)\nORDER BY session_date DESC;",
    ],
    advanced: [
      "WITH RankedSessions AS (\n  SELECT user_id, wpm, DENSE_RANK() OVER (ORDER BY wpm DESC) as ranking\n  FROM sessions\n)\nSELECT * FROM RankedSessions WHERE ranking <= 10;",
    ],
  },
};
