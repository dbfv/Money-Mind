"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const user_routes_1 = __importDefault(require("./features/users/user.routes"));
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Connect to database
(0, db_1.default)();
// Middleware
app.use(express_1.default.json());
// Routes
app.use('/api/users', user_routes_1.default);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
