export interface SampleSnippet {
  id: string;
  name: string;
  category: "vulnerable" | "clean";
  language: string;
  description: string;
  code: string;
}

export const SAMPLE_SNIPPETS: SampleSnippet[] = [
  {
    id: "sqli",
    name: "SQL Injection",
    category: "vulnerable",
    language: "python",
    description: "Unsanitized user input directly concatenated into a raw SQL query.",
    code: `import sqlite3

def get_user_profile(user_id):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    # VULNERABLE: Direct string formatting allows SQL Injection
    query = f"SELECT id, username, email, role FROM users WHERE id = '{user_id}'"
    cursor.execute(query)
    user = cursor.fetchone()
    conn.close()
    return user
`,
  },
  {
    id: "xss",
    name: "Stored / Reflected XSS",
    category: "vulnerable",
    language: "javascript",
    description: "Unescaped user input rendered directly into the DOM using innerHTML.",
    code: `function renderUserProfile(userData) {
  const container = document.getElementById("profile");
  // VULNERABLE: Direct innerHTML assignment executes attacker-controlled scripts
  container.innerHTML = "<h1>Welcome, " + userData.name + "</h1>" +
                        "<p>Bio: " + userData.bio + "</p>";
}
`,
  },
  {
    id: "cmdi",
    name: "Command Injection",
    category: "vulnerable",
    language: "javascript",
    description: "Shell command execution with untrusted user parameter without sanitization.",
    code: `const { exec } = require("child_process");

function pingServer(hostname) {
  // VULNERABLE: Passing untrusted parameter directly into a system shell
  exec("ping -c 4 " + hostname, (error, stdout, stderr) => {
    if (error) {
      console.error("Ping error: " + error);
      return;
    }
    console.log("Output: " + stdout);
  });
}
`,
  },
  {
    id: "secret",
    name: "Hardcoded Secret & Weak Crypto",
    category: "vulnerable",
    language: "python",
    description: "Hardcoded production API keys, MD5 hashing, and predictable session tokens.",
    code: `import hashlib
import time

# VULNERABLE: Hardcoded production secrets committed to source
STRIPE_SECRET_KEY = "sk_live_51M0abcdef1234567890abcdef"
JWT_SECRET = "supersecret123"

def hash_password(password):
    # VULNERABLE: MD5 is cryptographically broken and vulnerable to collision attacks
    return hashlib.md5(password.encode()).hexdigest()

def generate_reset_token(user_id):
    # VULNERABLE: Predictable timestamp-based token generation
    return f"{user_id}-{int(time.time())}"
`,
  },
  {
    id: "loop",
    name: "Inefficient Loop (O(N^2))",
    category: "vulnerable",
    language: "python",
    description: "Quadratic nested search and repetitive list lookups causing CPU bottleneck.",
    code: `def find_common_transactions(list_a, list_b):
    common = []
    # VULNERABLE / PERFORMANCE: Nested loop O(N*M) with redundant linear scans
    for item_a in list_a:
        for item_b in list_b:
            if item_a["transaction_id"] == item_b["transaction_id"]:
                if item_a not in common:
                    common.append(item_a)
    return common
`,
  },
  {
    id: "clean",
    name: "Clean & Secure Snippet",
    category: "clean",
    language: "python",
    description: "Parameterized SQL query with proper context manager and error handling.",
    code: `import sqlite3
from typing import Optional, Dict, Any

def get_user_profile(user_id: int) -> Optional[Dict[str, Any]]:
    """Fetches user profile safely using parameterized SQL statements."""
    try:
        with sqlite3.connect("users.db") as conn:
            cursor = conn.cursor()
            # SAFE: Parameterized query prevents SQL injection
            cursor.execute(
                "SELECT id, username, email, role FROM users WHERE id = ?",
                (user_id,)
            )
            row = cursor.fetchone()
            if row:
                return {
                    "id": row[0],
                    "username": row[1],
                    "email": row[2],
                    "role": row[3],
                }
            return None
    except sqlite3.DatabaseError as exc:
        # Proper error logging without exposing stack trace to untrusted client
        return None
`,
  },
];
