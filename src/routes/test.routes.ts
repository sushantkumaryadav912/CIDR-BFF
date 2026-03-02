import { Router } from "express";

const router = Router();

router.get("/test", (_, res) => {
  res.json({
    message: "CIDR BFF is operational",
  });
});

export default router;