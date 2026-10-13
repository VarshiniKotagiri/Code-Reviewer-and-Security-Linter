import { PRESET_AUDITS } from "../lib/constants/preset-audits.js";
import { SAMPLE_SNIPPETS } from "../lib/constants/sample-snippets.js";
import { AnalysisResultSchema } from "../types/analysis.js";

console.log("=================================================");
console.log("  RUNNING AI CODE REVIEWER TEST SUITE (6 SUITES)");
console.log("=================================================\n");

let passedCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
    passedCount++;
  }
}

// Suite 1: SQL Injection
console.log("--- Suite 1: SQL Injection Snippet ---");
const sqliAudit = PRESET_AUDITS.sqli;
AnalysisResultSchema.parse(sqliAudit);
assert(sqliAudit.overallScore < 50, `Score is appropriately low (${sqliAudit.overallScore}/100)`);
assert(
  sqliAudit.issues.some((i) => i.cwe === "CWE-89" && i.severity === "critical"),
  "Flags CWE-89 with Critical severity"
);
assert(
  sqliAudit.refactoredCode.includes("?") && !sqliAudit.refactoredCode.includes("f\"SELECT"),
  "Refactored code replaces f-string with parameterized placeholder"
);

// Suite 2: Cross-Site Scripting (XSS)
console.log("\n--- Suite 2: Cross-Site Scripting (XSS) Snippet ---");
const xssAudit = PRESET_AUDITS.xss;
AnalysisResultSchema.parse(xssAudit);
assert(xssAudit.overallScore < 50, `Score reflects dangerous DOM sink (${xssAudit.overallScore}/100)`);
assert(
  xssAudit.issues.some((i) => i.cwe === "CWE-79" && i.severity === "critical"),
  "Flags CWE-79 with Critical severity"
);
assert(
  !xssAudit.refactoredCode.includes("innerHTML") && xssAudit.refactoredCode.includes("textContent"),
  "Refactored code replaces innerHTML with textContent"
);

// Suite 3: Command Injection
console.log("\n--- Suite 3: OS Command Injection Snippet ---");
const cmdiAudit = PRESET_AUDITS.cmdi;
AnalysisResultSchema.parse(cmdiAudit);
assert(cmdiAudit.overallScore < 50, `Score reflects remote execution risk (${cmdiAudit.overallScore}/100)`);
assert(
  cmdiAudit.issues.some((i) => i.cwe === "CWE-78" && i.severity === "critical"),
  "Flags CWE-78 (OS Command Injection) with Critical severity"
);
assert(
  cmdiAudit.refactoredCode.includes("execFile") && !cmdiAudit.refactoredCode.includes("exec(\"ping"),
  "Refactored code replaces shell exec with execFile array arguments"
);

// Suite 4: Hardcoded Secrets & Weak Crypto
console.log("\n--- Suite 4: Hardcoded Secret & Weak Crypto Snippet ---");
const secretAudit = PRESET_AUDITS.secret;
AnalysisResultSchema.parse(secretAudit);
assert(
  secretAudit.issues.some((i) => i.cwe === "CWE-798"),
  "Flags CWE-798 (Hardcoded Credentials)"
);
assert(
  secretAudit.issues.some((i) => i.cwe === "CWE-327"),
  "Flags CWE-327 (Broken Cryptography - MD5)"
);
assert(
  !secretAudit.refactoredCode.includes("sk_live_") && secretAudit.refactoredCode.includes("os.environ"),
  "Refactored code eliminates hardcoded keys in favor of os.environ"
);

// Suite 5: Inefficient Loop (Performance Anti-pattern)
console.log("\n--- Suite 5: Inefficient Loop (O(N^2)) Snippet ---");
const loopAudit = PRESET_AUDITS.loop;
AnalysisResultSchema.parse(loopAudit);
assert(
  loopAudit.issues.some((i) => i.category === "performance" && i.cwe === "CWE-400"),
  "Flags CWE-400 performance bottleneck"
);
assert(
  loopAudit.refactoredCode.includes("b_ids = {") || loopAudit.refactoredCode.includes("set"),
  "Refactored code uses set for O(1) lookups"
);

// Suite 6: Clean Snippet (False Alarm Check)
console.log("\n--- Suite 6: Clean Snippet (False Alarm Check) ---");
const cleanAudit = PRESET_AUDITS.clean;
AnalysisResultSchema.parse(cleanAudit);
assert(cleanAudit.overallScore >= 95, `Clean code achieves high score (${cleanAudit.overallScore}/100)`);
const hasCriticalOrHigh = cleanAudit.issues.some(
  (i) => i.severity === "critical" || i.severity === "high"
);
assert(!hasCriticalOrHigh, "No critical or high severity false alarms on clean snippet");

console.log("\n=================================================");
console.log(`  RESULT: ${passedCount}/${totalCount} assertions passed.`);
console.log("=================================================\n");
