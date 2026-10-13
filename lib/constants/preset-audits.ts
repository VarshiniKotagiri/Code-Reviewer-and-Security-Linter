import { AnalysisResult } from "@/types/analysis";

export const PRESET_AUDITS: Record<string, AnalysisResult> = {
  sqli: {
    summary:
      "Critical vulnerability identified: direct string concatenation in a raw SQL query exposes the database to severe SQL Injection attacks (CWE-89).",
    overallScore: 25,
    issues: [
      {
        id: "SEC-1",
        title: "SQL Injection via Unsanitized f-string Query",
        category: "security",
        severity: "critical",
        lineStart: 7,
        lineEnd: 7,
        cwe: "CWE-89",
        owasp: "A03:2021-Injection",
        explanation:
          "The user_id parameter is directly formatted into the SQL statement without parameterized placeholders or escaping. An attacker can supply inputs like \"' OR '1'='1\" to bypass authentication or extract all records.",
        whyItMatters:
          "SQL injection allows attackers to bypass login forms, dump customer database tables, tamper with financial records, or even run system commands.",
        fix: "Use parameterized queries with the '?' placeholder: cursor.execute('SELECT ... WHERE id = ?', (user_id,))",
      },
      {
        id: "BUG-1",
        title: "Unclosed Connection on Exception",
        category: "bug",
        severity: "medium",
        lineStart: 4,
        lineEnd: 11,
        explanation:
          "The database connection is opened manually and only closed at line 10. If an exception occurs during query execution, the connection remains open, leaking database handles.",
        whyItMatters:
          "Leaking connection handles can exhaust the database connection pool, crashing the server.",
        fix: "Use a Python context manager: 'with sqlite3.connect(\"users.db\") as conn:' to ensure automatic resource cleanup.",
      },
    ],
    refactoredCode: `import sqlite3
from typing import Optional, Dict, Any

def get_user_profile(user_id: int) -> Optional[Dict[str, Any]]:
    """Safely retrieves user profile using parameterized SQL query."""
    try:
        with sqlite3.connect("users.db") as conn:
            cursor = conn.cursor()
            # Parameterized query blocks SQL injection
            query = "SELECT id, username, email, role FROM users WHERE id = ?"
            cursor.execute(query, (user_id,))
            user = cursor.fetchone()
            if user:
                return {
                    "id": user[0],
                    "username": user[1],
                    "email": user[2],
                    "role": user[3],
                }
            return None
    except sqlite3.DatabaseError as exc:
        # Gracefully handle database errors without crashing
        return None
`,
    refactorNotes:
      "- Replaced raw f-string formatting with parameterized query '(?,)' to eliminate CWE-89 SQL Injection.\n- Added 'with sqlite3.connect(...)' context manager to prevent connection leaks.\n- Added type hints and structured dictionary return type for better maintainability.",
  },

  xss: {
    summary:
      "Critical vulnerability identified: direct assignment of unescaped user input to innerHTML enables Cross-Site Scripting (XSS) (CWE-79).",
    overallScore: 30,
    issues: [
      {
        id: "SEC-1",
        title: "Cross-Site Scripting (XSS) via innerHTML",
        category: "security",
        severity: "critical",
        lineStart: 4,
        lineEnd: 5,
        cwe: "CWE-79",
        owasp: "A03:2021-Injection",
        explanation:
          "User data ('userData.name' and 'userData.bio') is directly concatenated into an HTML string and rendered using innerHTML. If userData contains malicious <script> or <img onerror=...> tags, arbitrary code executes in the victim's browser.",
        whyItMatters:
          "Allows attackers to steal session cookies, hijack account credentials, read confidential DOM content, or perform actions on behalf of the user.",
        fix: "Use textContent or DOM element creation methods instead of innerHTML, or sanitize untrusted HTML with DOMPurify.",
      },
    ],
    refactoredCode: `function renderUserProfile(userData) {
  const container = document.getElementById("profile");
  if (!container) return;

  // Clear previous contents safely
  container.replaceChildren();

  // Create header safely using textContent
  const heading = document.createElement("h1");
  heading.textContent = "Welcome, " + (userData?.name || "Guest");
  container.appendChild(heading);

  // Create bio paragraph safely
  const bio = document.createElement("p");
  bio.textContent = "Bio: " + (userData?.bio || "No bio available");
  container.appendChild(bio);
}
`,
    refactorNotes:
      "- Replaced vulnerable innerHTML assignment with document.createElement and textContent, completely preventing XSS.\n- Added null checks for the container DOM element.\n- Added optional chaining and default fallback values for userData properties.",
  },

  cmdi: {
    summary:
      "Critical vulnerability identified: unsanitized parameter passed directly to child_process.exec allows OS Command Injection (CWE-78).",
    overallScore: 20,
    issues: [
      {
        id: "SEC-1",
        title: "Remote OS Command Injection via child_process.exec",
        category: "security",
        severity: "critical",
        lineStart: 5,
        lineEnd: 5,
        cwe: "CWE-78",
        owasp: "A03:2021-Injection",
        explanation:
          "child_process.exec invokes a system shell (sh/cmd). If an attacker supplies a hostname like '127.0.0.1; rm -rf /' or '127.0.0.1 && cat /etc/passwd', the shell executes arbitrary attacker commands.",
        whyItMatters:
          "Command injection grants attackers complete shell control over the server, compromising the entire host infrastructure.",
        fix: "Validate and sanitize input against a strict IP/domain whitelist, and use child_process.execFile with an array of arguments rather than a raw shell string.",
      },
    ],
    refactoredCode: `const { execFile } = require("child_process");

// Strict validation regex for IPv4 / standard domain name
const HOSTNAME_REGEX = /^[a-zA-Z0-9.-]{1,253}$/;

function pingServer(hostname, callback) {
  if (!hostname || !HOSTNAME_REGEX.test(hostname)) {
    return callback(new Error("Invalid hostname format"));
  }

  // execFile does not spawn an arbitrary shell and passes arguments as safe array
  execFile("ping", ["-c", "4", hostname], { timeout: 10000 }, (error, stdout, stderr) => {
    if (error) {
      return callback(error, null);
    }
    return callback(null, stdout);
  });
}
`,
    refactorNotes:
      "- Switched from 'exec' (spawns shell) to 'execFile' (executes binary directly without shell interpretation).\n- Added strict regex input validation to reject dangerous shell delimiters (; & | ` $).\n- Added process execution timeout to avoid hanging child processes.",
  },

  secret: {
    summary:
      "Severe security risks identified: hardcoded production secrets (CWE-798), broken cryptography with MD5 (CWE-327), and predictable session tokens.",
    overallScore: 35,
    issues: [
      {
        id: "SEC-1",
        title: "Hardcoded API Keys and JWT Secret",
        category: "security",
        severity: "critical",
        lineStart: 5,
        lineEnd: 6,
        cwe: "CWE-798",
        owasp: "A07:2021-Identification and Authentication Failures",
        explanation:
          "Production Stripe API keys and JWT signing secrets are hardcoded in plaintext source code. Anyone with access to the repo can impersonate admins and drain Stripe accounts.",
        whyItMatters:
          "Publicly committed credentials lead to massive data breaches and financial fraud.",
        fix: "Move all secrets to environment variables (e.g. os.environ.get('STRIPE_SECRET_KEY')) and inject them via secure secret managers.",
      },
      {
        id: "SEC-2",
        title: "Broken Cryptographic Hash Algorithm (MD5)",
        category: "security",
        severity: "high",
        lineStart: 10,
        lineEnd: 10,
        cwe: "CWE-327",
        owasp: "A02:2021-Cryptographic Failures",
        explanation:
          "MD5 is not a password hashing algorithm; it is fast and vulnerable to rainbow table attacks and hash collisions. Attackers can reverse MD5 hashes in seconds.",
        whyItMatters:
          "Breached password dumps hashed with MD5 are cracked rapidly, exposing users across other services.",
        fix: "Use a slow, salted, memory-hard algorithm such as bcrypt, Argon2, or PBKDF2.",
      },
      {
        id: "SEC-3",
        title: "Predictable Token Generation",
        category: "security",
        severity: "high",
        lineStart: 14,
        lineEnd: 14,
        cwe: "CWE-330",
        owasp: "A07:2021-Identification and Authentication Failures",
        explanation:
          "Using user ID and integer timestamp for reset tokens allows an attacker who knows when a reset was requested to guess the token and take over accounts.",
        whyItMatters:
          "Enables unauthenticated account takeover.",
        fix: "Use Python's secrets module: secrets.token_urlsafe(32) for cryptographically random tokens.",
      },
    ],
    refactoredCode: `import os
import secrets
import bcrypt

# Load secrets from environment variables
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")
JWT_SECRET = os.environ.get("JWT_SECRET")

def hash_password(password: str) -> str:
    """Securely hash passwords using bcrypt with a random salt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def generate_reset_token() -> str:
    """Generate a cryptographically secure, unguessable reset token."""
    return secrets.token_urlsafe(32)
`,
    refactorNotes:
      "- Extracted all secret keys to environment variables.\n- Replaced insecure MD5 hashing with salted bcrypt password hashing.\n- Replaced timestamp token generation with cryptographically secure 'secrets.token_urlsafe(32)'.",
  },

  loop: {
    summary:
      "Performance issue detected: quadratic nested loop O(N^2) with repetitive linear scans leads to uncontrolled resource consumption (CWE-400).",
    overallScore: 60,
    issues: [
      {
        id: "PERF-1",
        title: "Quadratic Nested Loop Search (O(N*M))",
        category: "performance",
        severity: "medium",
        lineStart: 5,
        lineEnd: 8,
        cwe: "CWE-400",
        explanation:
          "Iterating over list_a and list_b in nested loops yields O(N*M) complexity. Adding 'item_a not in common' adds an extra O(K) linear lookup, resulting in O(N*M*K) total complexity.",
        whyItMatters:
          "With large transaction lists (e.g., 10,000 items), the function will freeze the application and spike server CPU to 100%.",
        fix: "Use a hash set of transaction IDs for O(1) lookups, reducing total complexity to O(N + M).",
      },
      {
        id: "STYLE-1",
        title: "Missing Type Annotations and Docstring",
        category: "style",
        severity: "info",
        lineStart: 1,
        lineEnd: 1,
        explanation:
          "Function lacks PEP 484 type annotations and docstrings explaining input/output shapes.",
        whyItMatters:
          "Makes the codebase harder to maintain and test for other developers.",
        fix: "Add type annotations: list[dict[str, Any]] and a descriptive docstring.",
      },
    ],
    refactoredCode: `from typing import List, Dict, Any

def find_common_transactions(
    list_a: List[Dict[str, Any]], 
    list_b: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Finds common transactions in O(N + M) linear time using hash set lookups.
    """
    # Create an O(1) lookup set of transaction IDs from list_b
    b_ids = {item["transaction_id"] for item in list_b if "transaction_id" in item}

    # Filter list_a transactions that exist in list_b, deduplicated by ID
    seen_ids = set()
    common = []

    for item in list_a:
        t_id = item.get("transaction_id")
        if t_id and t_id in b_ids and t_id not in seen_ids:
            seen_ids.add(t_id)
            common.append(item)

    return common
`,
    refactorNotes:
      "- Reduced algorithmic time complexity from O(N*M*K) to O(N + M) using Python sets.\n- Eliminated redundant linear array searches with a 'seen_ids' hash set.\n- Added PEP 484 type annotations and safe dictionary key access using .get().",
  },

  clean: {
    summary:
      "Excellent code quality: the snippet demonstrates secure coding practices, parameterized SQL queries, proper context managers, and defensive error handling.",
    overallScore: 98,
    issues: [
      {
        id: "STYLE-1",
        title: "Optional Enhancement: Log the Caught Exception",
        category: "style",
        severity: "info",
        lineStart: 21,
        lineEnd: 23,
        explanation:
          "The DatabaseError is captured in 'exc' but not logged to an internal logging handler (like python's logging module).",
        whyItMatters:
          "Logging internal database errors helps operators diagnose connectivity or permission issues without leaking raw errors to clients.",
        fix: "Import logging and call logging.error('Database query failed: %s', exc).",
      },
    ],
    refactoredCode: `import sqlite3
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

def get_user_profile(user_id: int) -> Optional[Dict[str, Any]]:
    """Fetches user profile safely using parameterized SQL statements."""
    try:
        with sqlite3.connect("users.db") as conn:
            cursor = conn.cursor()
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
        logger.error("Failed to fetch user profile for %s: %s", user_id, exc)
        return None
`,
    refactorNotes:
      "- Preserved all security best practices (parameterization and context managers).\n- Added standard logging module integration for internal telemetry.\n- Clean, production-ready code with no vulnerabilities.",
  },
};
