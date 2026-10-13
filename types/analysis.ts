import { z } from "zod";

export const SeveritySchema = z.enum(["critical", "high", "medium", "low", "info"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const CategorySchema = z.enum(["security", "bug", "performance", "style"]);
export type Category = z.infer<typeof CategorySchema>;

export const IssueSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: CategorySchema,
  severity: SeveritySchema,
  lineStart: z.number().int().min(1),
  lineEnd: z.number().int().min(1),
  cwe: z.string().optional(),
  owasp: z.string().optional(),
  explanation: z.string(),
  whyItMatters: z.string(),
  fix: z.string(),
});

export type Issue = z.infer<typeof IssueSchema>;

export const AnalysisResultSchema = z.object({
  summary: z.string(),
  overallScore: z.number().int().min(0).max(100),
  issues: z.array(IssueSchema),
  refactoredCode: z.string(),
  refactorNotes: z.string(),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export const AnalyzeRequestSchema = z.object({
  code: z
    .string()
    .min(1, "Code snippet cannot be empty")
    .max(10000, "Code snippet exceeds 10,000 character limit"),
  language: z.string().default("auto"),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export interface SavedReview {
  id: string;
  session_id: string;
  language: string;
  code: string;
  result: AnalysisResult;
  score: number;
  created_at: string;
}
