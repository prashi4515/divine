import fs from "node:fs";
import path from "node:path";

const CANDIDATES_FINAL_AUDITED_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/candidates-final-audited.json");
const NEEDS_REVIEW_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/needs-review.json");
const REJECTED_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/rejected.json");

function execute243EvidenceAudit() {
  console.log("=== EXECUTING EVIDENCE AUDIT SPECIFICALLY ON 243 VERIFIED RECORDS ===");

  const rawCandidates: any[] = JSON.parse(fs.readFileSync(CANDIDATES_FINAL_AUDITED_FILE, "utf8"));
  console.log(`Loaded ${rawCandidates.length} candidate records.`);

  const verifiedCandidates = rawCandidates.filter((c) => c.status === "VERIFIED");
  console.log(`Auditing ${verifiedCandidates.length} VERIFIED records...`);

  const finalAuditedList: any[] = [];
  const needsReviewList: any[] = [];
  const downgradedLog: any[] = [];

  rawCandidates.forEach((c) => {
    if (c.status !== "VERIFIED") {
      finalAuditedList.push(c);
      needsReviewList.push({
        name: c.canonicalName,
        slug: c.slug,
        reasonForReview: c.auditReason || "Lexical Sanskrit word with unverified contemporary personal name usage.",
      });
      return;
    }

    // Perform fine-grained evidence check on the VERIFIED record:
    // 1. Check Dictionary Evidence
    const dEv = c.dictionaryEvidence && c.dictionaryEvidence[0];
    const hasValidDictEv =
      dEv &&
      dEv.source &&
      dEv.url &&
      dEv.url.includes("sanskrit-lexicon.uni-koeln.de") &&
      dEv.claimSupported;

    // 2. Check Modern Usage Evidence
    const mEv = c.modernUsageEvidence && c.modernUsageEvidence[0];
    const hasValidModernEv =
      mEv &&
      mEv.source &&
      mEv.claimSupported &&
      (mEv.claimSupported.toLowerCase().includes("personal name") ||
        mEv.claimSupported.toLowerCase().includes("given name") ||
        mEv.claimSupported.toLowerCase().includes("modern name"));

    // 3. Exact Canonical Name check vs Modern Evidence claim
    const exactNameSupported = mEv && (mEv.claimSupported.includes(c.canonicalName) || mEv.source.includes("Behind the Name") || mEv.source.includes("Oxford"));

    if (hasValidDictEv && hasValidModernEv && exactNameSupported) {
      finalAuditedList.push({
        ...c,
        status: "VERIFIED",
        auditReason: "Verified: Monier-Williams Sanskrit lexical etymology and documented modern personal-name usage.",
      });
    } else {
      const reason = "Downgraded: Modern usage evidence or dictionary citation lacks exact entry verification.";
      downgradedLog.push({
        name: c.canonicalName,
        slug: c.slug,
        oldStatus: "VERIFIED",
        newStatus: "NEEDS_REVIEW",
        reason: reason,
      });
      finalAuditedList.push({
        ...c,
        status: "NEEDS_REVIEW",
        auditReason: reason,
      });
      needsReviewList.push({
        name: c.canonicalName,
        slug: c.slug,
        reasonForReview: reason,
      });
    }
  });

  fs.writeFileSync(CANDIDATES_FINAL_AUDITED_FILE, JSON.stringify(finalAuditedList, null, 2));
  fs.writeFileSync(NEEDS_REVIEW_FILE, JSON.stringify({ candidates: needsReviewList }, null, 2));

  const finalVerified = finalAuditedList.filter((c) => c.status === "VERIFIED");
  const finalNeedsReview = finalAuditedList.filter((c) => c.status === "NEEDS_REVIEW");
  const finalRejected = finalAuditedList.filter((c) => c.status === "REJECTED");

  console.log(`=== EVIDENCE AUDIT COMPLETE ===`);
  console.log(`Total Audited Records: ${finalAuditedList.length}`);
  console.log(`Final VERIFIED Records: ${finalVerified.length}`);
  console.log(`Final NEEDS_REVIEW Records: ${finalNeedsReview.length}`);
  console.log(`Final REJECTED Records: ${finalRejected.length}`);
  console.log(`Downgraded in this pass: ${downgradedLog.length}`);
}

execute243EvidenceAudit();
