import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { AuthController } from "../controller/auth.controller";
import { body } from "express-validator";

const router: Router = Router();
router.use(authMiddleware);

router
    .get('/all',
        validateRequest,
        AuthController.getAllUsers
    )
    .get('/:id',
        validateRequest,
        AuthController.getById
    )
    .put('/:id',
        [
            body('email')
                .trim()
                .escape()
                .isEmail().withMessage("Please provide a valid email address"),
        ],
        authMiddleware,
        validateRequest,
        AuthController.updateUser
    )
    .delete('/:id',
        validateRequest,
        AuthController.deleteUser
    )

export { router as usersRouter };