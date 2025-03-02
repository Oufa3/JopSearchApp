import { Router } from "express";
import * as registrationService from "./services/regestrations.service.js";
import * as loginService from "./services/login.service.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./auth.validation.js"

const router = Router()

router.post("/signup", validation(validators.signup), registrationService.signup)
router.post("/confirmOTP", validation(validators.confirmOTP), registrationService.confirmOTP)

router.post("/login", validation(validators.login), loginService.login)
router.get("/refresh-token", loginService.refreshToken)
router.post("/loginWithGmail", loginService.loginWithGmail)
router.post("/signWithGmail", loginService.signWithGmail)
router.patch("/forget-Password", validation(validators.forgetPassword), loginService.forgetPassword)
router.patch("/reset-Password", validation(validators.resetPassword), loginService.resetPassword)

export default router