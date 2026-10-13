export interface GlossaryEntry {
  title: string;
  category: "cwe" | "owasp" | "jargon";
  definition: string;
  impact: string;
}

export const CWE_GLOSSARY: Record<string, GlossaryEntry> = {
  "CWE-89": {
    title: "SQL Injection",
    category: "cwe",
    definition:
      "When untrusted input is improperly concatenated into a SQL statement without parameterization or escaping.",
    impact:
      "Attackers can read, modify, or delete database tables, bypass authentication, and occasionally gain remote code execution on the database server.",
  },
  "CWE-79": {
    title: "Cross-site Scripting (XSS)",
    category: "cwe",
    definition:
      "When untrusted user input is rendered into the webpage DOM without proper escaping or sanitization.",
    impact:
      "Allows attackers to run malicious JavaScript in victims' browsers, steal session cookies, deface sites, and redirect users to phishing pages.",
  },
  "CWE-78": {
    title: "OS Command Injection",
    category: "cwe",
    definition:
      "When an application constructs system shell commands using unsanitized user-provided input.",
    impact:
      "Gives attackers full remote control over the underlying operating system and server environment.",
  },
  "CWE-798": {
    title: "Use of Hard-coded Credentials",
    category: "cwe",
    definition:
      "Hardcoding secret keys, API tokens, passwords, or cryptographic certificates directly in the codebase.",
    impact:
      "Once code is pushed to public repositories or decompiled, adversaries extract the keys and hijack critical third-party services and private data.",
  },
  "CWE-327": {
    title: "Use of a Broken or Risky Cryptographic Algorithm",
    category: "cwe",
    definition:
      "Utilizing deprecated hashing algorithms like MD5 or SHA1 for password security or sensitive integrity checks.",
    impact:
      "Susceptible to collision and rainbow table dictionary attacks, making stored passwords trivial to reverse.",
  },
  "CWE-20": {
    title: "Improper Input Validation",
    category: "cwe",
    definition:
      "Accepting input without verifying that it conforms to expected length, format, schema, or range constraints.",
    impact:
      "Can trigger crashes, logic errors, denial of service, and secondary security vulnerabilities.",
  },
  "CWE-95": {
    title: "Improper Neutralization of Directives in Dynamically Evaluated Code (Eval Injection)",
    category: "cwe",
    definition:
      "Passing external strings directly to dynamic interpretation functions like eval(), exec(), or Function constructor.",
    impact:
      "Enables arbitrary code execution directly in the interpreter context.",
  },
  "CWE-400": {
    title: "Uncontrolled Resource Consumption",
    category: "cwe",
    definition:
      "Inefficient loops, unindexed database queries, or unbounded recursive calls that consume CPU and memory.",
    impact:
      "Leads to application latency degradation, server unresponsiveness, and Denial of Service (DoS).",
  },
  "CWE-502": {
    title: "Deserialization of Untrusted Data",
    category: "cwe",
    definition:
      "Deserializing binary or object streams from untrusted sources without strict class whitelisting.",
    impact:
      "Can result in arbitrary object instantiation and remote code execution.",
  },
  "CWE-362": {
    title: "Concurrent Execution using Shared Resource with Improper Synchronization (Race Condition)",
    category: "cwe",
    definition:
      "Multiple execution threads or async callbacks accessing shared state simultaneously without proper locking.",
    impact:
      "Inconsistent application state, double-spending vulnerabilities, and memory corruption.",
  },
};

export const JARGON_GLOSSARY: Record<string, string> = {
  owasp: "Open Worldwide Application Security Project - an international non-profit standardizing web application security guidance.",
  cwe: "Common Weakness Enumeration - an industry-standard dictionary of software security vulnerabilities and flaws.",
  critical: "Vulnerabilities that provide immediate remote access, authentication bypass, or full database exposure.",
  high: "Severe vulnerabilities like privilege escalation, stored XSS, or sensitive credential exposure.",
  medium: "Issues that increase attack surface or degrade data integrity under specific conditions.",
  low: "Minor flaws, defensive omissions, or configuration weaknesses.",
  info: "Stylistic improvements, maintainability tips, and non-exploitable code smells.",
  sanitization: "Stripping or escaping dangerous characters from untrusted input before rendering or processing.",
  parameterization: "Passing query data separately from query instructions so data can never be interpreted as executable commands.",
};
