import { body, check, validationResult } from "express-validator";
import { RequestHandler, Request, Response, NextFunction } from "express";
import { ResponseHelper } from "./response";
import { HTTP_STATUS } from "../constants";
import { VALIDATION, SKILL_CATEGORIES } from "../constants";
import { messages } from "./message";

/**
 * Express middleware for validating request fields using express-validator.
 *
 * @module validator
 *
 * @description
 * Provides reusable validation rules for common fields (e.g., email, password, etc.)
 * and a handler to return standardized error responses if validation fails.
 *
 * @example
 * // Usage in a route:
 * router.post(
 *   "/login",
 *   validations(["email", "password"]),
 *   controller.login
 * );
 *
 * // If validation fails:
 * // Response: { "success": false, "message": "Validation error", "errors": [ ...error details... ] }
 */

/**
 * Validation rules for common fields.
 */
export const validator = {
    // ID validation
    id: check("id")
        .notEmpty()
        .withMessage("ID is required!")
        .isString()
        .withMessage("ID must be a string!"),

    // Email validation
    email: body("email")
        .notEmpty()
        .withMessage("Email address is required!")
        .isEmail()
        .withMessage("Email address is invalid!")
        .normalizeEmail({ gmail_remove_dots: false }),

    emailOptional: body("email")
        .optional()
        .isEmail()
        .withMessage("Email address is invalid!")
        .normalizeEmail({ gmail_remove_dots: false }),

    // Password validation
    password: body("password")
        .notEmpty()
        .withMessage("Password is required!")
        .isLength({ min: VALIDATION.MIN_PASSWORD_LENGTH })
        .withMessage(`Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters long!`),

    // Project validations
    projectTitle: body("title")
        .notEmpty()
        .withMessage("Title is required!")
        .trim()
        .isLength({ max: VALIDATION.MAX_TITLE_LENGTH })
        .withMessage(`Title must not exceed ${VALIDATION.MAX_TITLE_LENGTH} characters!`),

    projectTitleOptional: body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Title cannot be empty!")
        .isLength({ max: VALIDATION.MAX_TITLE_LENGTH })
        .withMessage(`Title must not exceed ${VALIDATION.MAX_TITLE_LENGTH} characters!`),

    projectDescription: body("description")
        .notEmpty()
        .withMessage("Description is required!")
        .trim()
        .isLength({ max: VALIDATION.MAX_DESCRIPTION_LENGTH })
        .withMessage(`Description must not exceed ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters!`),

    projectDescriptionOptional: body("description")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Description cannot be empty!")
        .isLength({ max: VALIDATION.MAX_DESCRIPTION_LENGTH })
        .withMessage(`Description must not exceed ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters!`),


    projectTechStack: body("techStack")
        .isArray({ min: 1 })
        .withMessage("At least one technology is required!")
        .custom((value) => {
            if (!Array.isArray(value) || value.length === 0) {
                throw new Error("Tech stack must be a non-empty array!");
            }
            return true;
        }),

    projectTechStackOptional: body("techStack")
        .optional()
        .isArray({ min: 1 })
        .withMessage("Tech stack must be a non-empty array!")
        .custom((value) => {
            if (!Array.isArray(value) || value.length === 0) {
                throw new Error("Tech stack must be a non-empty array!");
            }
            return true;
        }),

    projectTechStackItem: body("techStack.*")
        .trim()
        .notEmpty()
        .withMessage("Each technology must be a non-empty string!"),

    projectGithubUrl: body("githubUrl")
        .optional({ checkFalsy: true })
        .trim()
        .custom((value) => {
            if (!value || value === '') {
                return true; // Allow empty or undefined
            }
            try {
                new URL(value);
                return true;
            } catch {
                throw new Error("Invalid GitHub URL format!");
            }
        }),

    projectLiveUrl: body("liveUrl")
        .optional()
        .trim()
        .isURL()
        .withMessage("Invalid live URL format!"),

    projectImageUrl: body("imageUrl")
        .optional()
        .trim()
        .isURL()
        .withMessage("Invalid image URL format!"),

    projectFeatured: body("featured")
        .optional()
        .isBoolean()
        .withMessage("Featured must be a boolean value!"),

    projectOrder: body("order")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Order must be a non-negative integer!"),

    // Skill validations
    skillName: body("name")
        .notEmpty()
        .withMessage("Skill name is required!")
        .trim()
        .isLength({ max: VALIDATION.MAX_SKILL_NAME_LENGTH })
        .withMessage(`Skill name must not exceed ${VALIDATION.MAX_SKILL_NAME_LENGTH} characters!`),

    skillNameOptional: body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Skill name cannot be empty!")
        .isLength({ max: VALIDATION.MAX_SKILL_NAME_LENGTH })
        .withMessage(`Skill name must not exceed ${VALIDATION.MAX_SKILL_NAME_LENGTH} characters!`),

    skillCategory: body("category")
        .notEmpty()
        .withMessage("Category is required!")
        .isIn(SKILL_CATEGORIES)
        .withMessage(`Category must be one of: ${SKILL_CATEGORIES.join(", ")}!`),

    skillCategoryOptional: body("category")
        .optional()
        .isIn(SKILL_CATEGORIES)
        .withMessage(`Category must be one of: ${SKILL_CATEGORIES.join(", ")}!`),

    skillProficiency: body("proficiency")
        .notEmpty()
        .withMessage("Proficiency is required!")
        .isInt({ min: VALIDATION.MIN_PROFICIENCY, max: VALIDATION.MAX_PROFICIENCY })
        .withMessage(`Proficiency must be between ${VALIDATION.MIN_PROFICIENCY} and ${VALIDATION.MAX_PROFICIENCY}!`),

    skillProficiencyOptional: body("proficiency")
        .optional()
        .isInt({ min: VALIDATION.MIN_PROFICIENCY, max: VALIDATION.MAX_PROFICIENCY })
        .withMessage(`Proficiency must be between ${VALIDATION.MIN_PROFICIENCY} and ${VALIDATION.MAX_PROFICIENCY}!`),

    skillIcon: body("icon")
        .optional()
        .trim()
        .isString()
        .withMessage("Icon must be a string!"),

    skillOrder: body("order")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Order must be a non-negative integer!"),

    // Contact validations
    contactName: body("name")
        .notEmpty()
        .withMessage("Name is required!")
        .trim()
        .isLength({ max: VALIDATION.MAX_NAME_LENGTH })
        .withMessage(`Name must not exceed ${VALIDATION.MAX_NAME_LENGTH} characters!`),

    contactSubject: body("subject")
        .notEmpty()
        .withMessage("Subject is required!")
        .trim()
        .isLength({ max: VALIDATION.MAX_SUBJECT_LENGTH })
        .withMessage(`Subject must not exceed ${VALIDATION.MAX_SUBJECT_LENGTH} characters!`),

    contactMessage: body("message")
        .notEmpty()
        .withMessage("Message is required!")
        .trim()
        .isLength({ max: VALIDATION.MAX_MESSAGE_LENGTH })
        .withMessage(`Message must not exceed ${VALIDATION.MAX_MESSAGE_LENGTH} characters!`),
};

/**
 * Middleware to handle validation errors and send a standardized response.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {void}
 */
const validationError: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Format validation errors
        const formattedErrors = errors.array().map((error) => {
            const field = error.type === "field" ? error.path : error.type;
            return {
                field: field || "unknown",
                message: error.msg || messages.invalidValue(),
                ...(error.type === "field" && error.value !== undefined && { value: error.value }),
            };
        });

        const message =
            formattedErrors.length === 1
                ? formattedErrors[0].message
                : messages.validationError();

        ResponseHelper.error(res, message, HTTP_STATUS.BAD_REQUEST);
        return;
    }
    next();
};

/**
 * Returns an array of validation middlewares for the specified fields,
 * followed by the validation error handler.
 *
 * @param {Array<keyof typeof validator>} fields - The fields to validate.
 * @returns {Array} Array of validation middlewares.
 *
 * @example
 * router.post("/login", validations(["email", "password"]), controller.login);
 */
export const validations = (fields: (keyof typeof validator)[]) => {
    const allValidations = fields.map((field) => validator[field]);
    return [...allValidations, validationError];
};

/**
 * Custom validation for login: require email and password.
 */
export const loginValidation = [
    validator.email,
    validator.password,
    validationError,
];

/**
 * Custom validation for project creation.
 */
export const createProjectValidation = [
    validator.projectTitle,
    validator.projectDescription,
    validator.projectTechStack,
    validator.projectTechStackItem,
    validator.projectGithubUrl,
    validator.projectLiveUrl,
    validator.projectImageUrl,
    validator.projectFeatured,
    validator.projectOrder,
    validationError,
];

/**
 * Custom validation for project update (all fields optional).
 */
export const updateProjectValidation = [
    validator.projectTitleOptional,
    validator.projectDescriptionOptional,
    validator.projectTechStackOptional,
    validator.projectTechStackItem,
    validator.projectGithubUrl,
    validator.projectLiveUrl,
    validator.projectImageUrl,
    validator.projectFeatured,
    validator.projectOrder,
    validationError,
];

/**
 * Custom validation for skill creation.
 */
export const createSkillValidation = [
    validator.skillName,
    validator.skillCategory,
    validator.skillProficiency,
    validator.skillIcon,
    validator.skillOrder,
    validationError,
];

/**
 * Custom validation for skill update (all fields optional).
 */
export const updateSkillValidation = [
    validator.skillNameOptional,
    validator.skillCategoryOptional,
    validator.skillProficiencyOptional,
    validator.skillIcon,
    validator.skillOrder,
    validationError,
];

/**
 * Custom validation for contact form.
 */
export const contactValidation = [
    validator.contactName,
    validator.email,
    validator.contactSubject,
    validator.contactMessage,
    validationError,
];

