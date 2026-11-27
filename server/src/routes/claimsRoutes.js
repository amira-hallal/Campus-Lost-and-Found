import { Router } from "express";
import {
  approveClaim, createClaim, getClaim, listClaims, rejectClaim, updateClaim, withdrawClaim,
} from "../controllers/claimsController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// Reading is public. Every change needs a signed-in user; ownership is checked in the controller.
router.get("/", listClaims);
router.get("/:id", getClaim);
router.post("/", requireAuth, createClaim);
router.patch("/:id", requireAuth, updateClaim); // claimant
router.delete("/:id", requireAuth, withdrawClaim); // claimant
router.post("/:id/approve", requireAuth, approveClaim); // item reporter
router.post("/:id/reject", requireAuth, rejectClaim); // item reporter
router.post("/:id/withdraw", requireAuth, withdrawClaim); // claimant

export default router;
