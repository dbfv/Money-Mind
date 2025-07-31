const { GoogleGenerativeAI } = require('@google/generative-ai');
const Transaction = require('../api/transactions/transaction.model');
const Category = require('../api/categories/category.model');
const Source = require('../api/sources/source.model');

class AIService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is required in environment variables');
        }
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }

    /**
     * Process chat message with tool calling capabilities
     * @param {string} userId - User ID
     * @param {string} message - User's message
     * @param {Array} userCategories - User's available categories
     * @param {Array} userSources - User's available sources
     * @returns {Object} Response object
     */
    async processChatMessage(userId, message, userCategories, userSources) {
        try {
            // Define available tools
            const tools = [{
                functionDeclarations: [
                    {
                        name: "addTransaction",
                        description: "Records a new expense or income transaction for the user",
                        parameters: {
                            type: "object",
                            properties: {
                                amount: {
                                    type: "number",
                                    description: "The transaction amount (positive number)"
                                },
                                description: {
                                    type: "string",
                                    description: "Description of the transaction"
                                },
                                category: {
                                    type: "string",
                                    description: "Category name (will be created if doesn't exist)"
                                },
                                sourceId: {
                                    type: "string",
                                    description: "Source ID from available sources, or 'default' to use first available"
                                },
                                type: {
                                    type: "string",
                                    enum: ["income", "expense"],
                                    description: "Type of transaction"
                                }
                            },
                            required: ["amount", "category", "type"]
                        }
                    },
                    {
                        name: "createCategory",
                        description: "Creates a new expense or income category for the user",
                        parameters: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string",
                                    description: "Category name"
                                },
                                type: {
                                    type: "string",
                                    enum: ["income", "expense"],
                                    description: "Category type"
                                },
                                sixJarsCategory: {
                                    type: "string",
                                    enum: ["necessities", "play", "education", "financial_freedom", "long_term_savings", "give"],
                                    description: "Six Jars category mapping"
                                }
                            },
                            required: ["name", "type"]
                        }
                    },
                    {
                        name: "createSource",
                        description: "Creates a new money source (bank account, wallet, etc.) for the user",
                        parameters: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string",
                                    description: "Source name (e.g., 'Checking Account', 'Cash Wallet')"
                                },
                                type: {
                                    type: "string",
                                    enum: ["bank", "cash", "credit_card", "investment", "other"],
                                    description: "Source type"
                                },
                                balance: {
                                    type: "number",
                                    description: "Initial balance (optional, defaults to 0)"
                                }
                            },
                            required: ["name", "type"]
                        }
                    },
                    {
                        name: "addCalendarEvent",
                        description: "Adds an event to the user's calendar (bills, reminders, etc.)",
                        parameters: {
                            type: "object",
                            properties: {
                                title: {
                                    type: "string",
                                    description: "Event title"
                                },
                                description: {
                                    type: "string",
                                    description: "Event description"
                                },
                                amount: {
                                    type: "number",
                                    description: "Amount associated with the event (for bills)"
                                },
                                startDate: {
                                    type: "string",
                                    description: "Event date in YYYY-MM-DD format"
                                },
                                type: {
                                    type: "string",
                                    enum: ["bill", "reminder", "goal", "other"],
                                    description: "Event type"
                                },
                                isRecurring: {
                                    type: "boolean",
                                    description: "Whether the event repeats"
                                },
                                frequency: {
                                    type: "string",
                                    enum: ["daily", "weekly", "monthly", "yearly"],
                                    description: "Recurrence frequency (if recurring)"
                                }
                            },
                            required: ["title", "startDate", "type"]
                        }
                    }
                ]
            }];

            // Construct the prompt
            const currentDate = new Date().toLocaleDateString();
            const categoriesText = userCategories.map(c => `${c.name} (${c.type})`).join(', ');
            const sourcesText = userSources.map(s => `${s.name} (ID: ${s._id})`).join(', ');

            const prompt = `You are a proactive financial assistant. Your goal is to help users manage their finances efficiently with minimal friction.

CURRENT CONTEXT:
- Available categories: ${categoriesText}
- Available sources: ${sourcesText}
- Today's date: ${currentDate}

BEHAVIOR GUIDELINES:
1. BE PROACTIVE: Take action immediately when the user's intent is clear
2. CREATE WHAT'S MISSING: If a category or source doesn't exist, create it automatically
3. MAKE SMART ASSUMPTIONS: Use the first available source if not specified
4. MINIMIZE CONFIRMATIONS: Only ask for clarification when absolutely necessary
5. BE CONVERSATIONAL: Provide brief, friendly responses after taking actions

SMART DEFAULTS:
- For expenses: Create categories with appropriate Six Jars mapping (Gas → necessities, Coffee → play, etc.)
- For sources: Use the first available source or create "Main Account" if none exist
- For categories: Determine if expense/income from context
- For calendar events: Set reasonable defaults for recurring bills

PATTERN RECOGNITION:
- "Burger 20" = $20 expense for Burger category
- "Coffee 5" = $5 expense for Coffee category  
- "Gas 50" = $50 expense for Gas category
- "Salary 3000" = $3000 income for Salary category
- "[Item] [Amount]" = expense transaction pattern
- "Add [amount] for [item]" = explicit expense
- "Spent [amount] on [item]" = expense transaction

USER MESSAGE: "${message}"

INSTRUCTIONS:
- ALWAYS try to extract transaction info from user input, even if format is informal
- Pattern "[Item] [Number]" should trigger addTransaction with amount and category
- If user mentions spending money, immediately use addTransaction (create category if needed)
- If user mentions earning money, immediately use addTransaction with type="income"
- If user mentions bills or reminders, use addCalendarEvent
- If user asks to create categories/sources, use the appropriate tools
- Take action first, then provide a brief confirmation
- Don't ask "Would you like me to..." - just do it and confirm what you did
- For unclear messages, try to interpret as transactions first before asking for clarification`;

            // Make API call with tools
            const result = await this.model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                tools: tools,
                toolConfig: {
                    functionCallingConfig: {
                        mode: "AUTO"
                    }
                }
            });

            const response = result.response;
            console.log('AI Response candidates:', response.candidates);
            console.log('AI Response function calls:', response.functionCalls);
            
            // Check for function calls in candidates
            const candidate = response.candidates?.[0];
            const functionCalls = candidate?.content?.parts?.filter(part => part.functionCall) || [];
            
            console.log('Function calls detected:', functionCalls);
            if (functionCalls.length > 0) {
                const results = [];
                
                // Execute all function calls
                for (const functionCallPart of functionCalls) {
                    const functionCall = functionCallPart.functionCall;
                    try {
                        let result;
                        
                        switch (functionCall.name) {
                            case "addTransaction":
                                result = await this.executeAddTransaction(userId, functionCall.args);
                                results.push({ type: 'transaction', data: result });
                                break;
                                
                            case "createCategory":
                                result = await this.executeCreateCategory(userId, functionCall.args);
                                results.push({ type: 'category', data: result });
                                break;
                                
                            case "createSource":
                                result = await this.executeCreateSource(userId, functionCall.args);
                                results.push({ type: 'source', data: result });
                                break;
                                
                            case "addCalendarEvent":
                                result = await this.executeAddCalendarEvent(userId, functionCall.args);
                                results.push({ type: 'event', data: result });
                                break;
                                
                            default:
                                console.warn(`Unknown function: ${functionCall.name}`);
                        }
                    } catch (error) {
                        results.push({ type: 'error', message: error.message });
                    }
                }
                
                // Generate confirmation message
                const confirmationPrompt = `I have successfully executed the following actions: ${JSON.stringify(results)}. Provide a brief, friendly confirmation message to the user about what was accomplished.`;
                
                try {
                    const confirmationResult = await this.model.generateContent(confirmationPrompt);
                    const confirmationText = confirmationResult.response.text();
                    
                    return {
                        type: 'function_executed',
                        message: confirmationText || 'Actions completed successfully!',
                        results: results
                    };
                } catch (confirmationError) {
                    console.error('Error generating confirmation:', confirmationError);
                    
                    // Fallback confirmation message
                    let fallbackMessage = 'Done! ';
                    results.forEach(result => {
                        if (result.type === 'transaction') {
                            fallbackMessage += `Added $${result.data.amount} transaction. `;
                        } else if (result.type === 'category') {
                            fallbackMessage += `Created ${result.data.name} category. `;
                        } else if (result.type === 'source') {
                            fallbackMessage += `Created ${result.data.name} source. `;
                        }
                    });
                    
                    return {
                        type: 'function_executed',
                        message: fallbackMessage,
                        results: results
                    };
                }
            }

            // Regular text response
            const textParts = candidate?.content?.parts?.filter(part => part.text) || [];
            const textResponse = textParts.map(part => part.text).join(' ').trim();
            
            console.log('Text response:', textResponse);
            
            if (!textResponse || textResponse === '') {
                // If no text and no function calls, the AI might not understand
                // Let's try a simpler approach without tools
                return await this.handleSimpleMessage(userId, message, userCategories, userSources);
            }
            
            return {
                type: 'text',
                message: textResponse
            };

        } catch (error) {
            console.error('Error in processChatMessage:', error);
            return {
                type: 'error',
                message: 'I apologize, but I encountered an error processing your request. Please try again.'
            };
        }
    }

    /**
     * Handle simple messages without function calling
     * @param {string} userId - User ID
     * @param {string} message - User's message
     * @param {Array} userCategories - User's available categories
     * @param {Array} userSources - User's available sources
     * @returns {Object} Response object
     */
    async handleSimpleMessage(userId, message, userCategories, userSources) {
        try {
            // Try to parse simple patterns manually
            const patterns = [
                /^(\w+)\s+(\d+(?:\.\d{2})?)$/i,  // "Burger 20" or "Coffee 5.50"
                /^(\w+)\s+\$?(\d+(?:\.\d{2})?)$/i,  // "Burger $20"
                /^spent?\s+\$?(\d+(?:\.\d{2})?)\s+on\s+(\w+)$/i,  // "spent $20 on burger"
                /^add\s+\$?(\d+(?:\.\d{2})?)\s+for\s+(\w+)$/i,  // "add $20 for burger"
            ];

            let amount, category;
            
            for (const pattern of patterns) {
                const match = message.match(pattern);
                if (match) {
                    if (pattern.source.includes('spent') || pattern.source.includes('add')) {
                        amount = parseFloat(match[1]);
                        category = match[2];
                    } else {
                        category = match[1];
                        amount = parseFloat(match[2]);
                    }
                    break;
                }
            }

            if (amount && category) {
                // We found a transaction pattern, execute it directly
                try {
                    // Map the item to appropriate category
                    const mappedCategory = this.mapItemToCategory(category);
                    
                    const result = await this.executeAddTransaction(userId, {
                        amount: amount,
                        description: category, // Use the original item as description
                        category: mappedCategory, // Use the mapped category
                        sourceId: 'default',
                        type: 'expense'
                    });

                    return {
                        type: 'function_executed',
                        message: `Got it! Added $${amount} for ${category} under ${mappedCategory} category.`,
                        results: [{ type: 'transaction', data: result }]
                    };
                } catch (error) {
                    return {
                        type: 'error',
                        message: `I tried to add your transaction but encountered an error: ${error.message}`
                    };
                }
            }

            // If no pattern matched, use simple AI response without tools
            const simplePrompt = `You are a helpful financial assistant. The user said: "${message}". 
            
            If this looks like they want to add a transaction (like "Burger 20" meaning $20 for burger), 
            let them know you understand and ask them to be more specific like "Add $20 for burger" or "I spent $20 on burger".
            
            Otherwise, respond helpfully to their message.`;

            const result = await this.model.generateContent(simplePrompt);
            const response = result.response;
            const candidate = response.candidates?.[0];
            const textParts = candidate?.content?.parts?.filter(part => part.text) || [];
            const textResponse = textParts.map(part => part.text).join(' ').trim();

            return {
                type: 'text',
                message: textResponse || "I'm here to help with your finances! Try saying something like 'Add $20 for burger' to record a transaction."
            };

        } catch (error) {
            console.error('Error in handleSimpleMessage:', error);
            return {
                type: 'error',
                message: 'I apologize, but I encountered an error. Please try rephrasing your message.'
            };
        }
    }

    /**
     * Execute add transaction function
     * @param {string} userId - User ID
     * @param {Object} args - Transaction arguments
     * @returns {Object} Created transaction
     */
    async executeAddTransaction(userId, args) {
        const { amount, description, category, sourceId, type } = args;

        // Find or create category
        let categoryDoc = await Category.findOne({ 
            name: { $regex: new RegExp(`^${category}$`, 'i') },
            userId: userId 
        });

        if (!categoryDoc) {
            // Auto-create category with smart Six Jars mapping
            const sixJarsMapping = this.getSixJarsMapping(category, type);
            categoryDoc = await this.executeCreateCategory(userId, {
                name: category,
                type: type,
                sixJarsCategory: sixJarsMapping
            });
        }

        // Handle source
        let finalSourceId = sourceId;
        if (!sourceId || sourceId === 'default') {
            // Use first available source or create default
            const sources = await Source.find({ userId: userId });
            if (sources.length === 0) {
                const defaultSource = await this.executeCreateSource(userId, {
                    name: 'Main Account',
                    type: 'bank',
                    balance: 0
                });
                finalSourceId = defaultSource._id;
            } else {
                finalSourceId = sources[0]._id;
            }
        } else {
            // Verify source exists
            const sourceDoc = await Source.findById(sourceId);
            if (!sourceDoc || sourceDoc.userId.toString() !== userId) {
                throw new Error(`Source not found or doesn't belong to user`);
            }
        }

        // Create transaction
        const transaction = new Transaction({
            userId: userId,
            amount: parseFloat(amount),
            description: description || '',
            category: categoryDoc._id,
            source: finalSourceId,
            date: new Date(),
            type: type
        });

        await transaction.save();

        // Populate the transaction for response
        await transaction.populate(['category', 'source']);

        return transaction;
    }

    /**
     * Execute create category function
     * @param {string} userId - User ID
     * @param {Object} args - Category arguments
     * @returns {Object} Created category
     */
    async executeCreateCategory(userId, args) {
        const { name, type, sixJarsCategory } = args;

        // Check if category already exists
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            userId: userId
        });

        if (existingCategory) {
            return existingCategory;
        }

        // Create new category
        const category = new Category({
            userId: userId,
            name: name,
            type: type,
            sixJarsCategory: sixJarsCategory || this.getSixJarsMapping(name, type)
        });

        await category.save();
        return category;
    }

    /**
     * Execute create source function
     * @param {string} userId - User ID
     * @param {Object} args - Source arguments
     * @returns {Object} Created source
     */
    async executeCreateSource(userId, args) {
        const { name, type, balance } = args;

        // Check if source already exists
        const existingSource = await Source.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            userId: userId
        });

        if (existingSource) {
            return existingSource;
        }

        // Create new source
        const source = new Source({
            userId: userId,
            name: name,
            type: type,
            balance: balance || 0
        });

        await source.save();
        return source;
    }

    /**
     * Execute add calendar event function
     * @param {string} userId - User ID
     * @param {Object} args - Event arguments
     * @returns {Object} Created event
     */
    async executeAddCalendarEvent(userId, args) {
        const CalendarEvent = require('../api/calendarEvents/calendarEvent.model');
        const { title, description, amount, startDate, type, isRecurring, frequency } = args;

        // Create calendar event
        const event = new CalendarEvent({
            userId: userId,
            title: title,
            description: description || '',
            amount: amount || 0,
            startDate: new Date(startDate),
            type: type,
            isRecurring: isRecurring || false,
            frequency: frequency || null
        });

        await event.save();
        return event;
    }

    /**
     * Get smart Six Jars mapping for a category
     * @param {string} categoryName - Category name
     * @param {string} type - Category type (income/expense)
     * @returns {string} Six Jars category
     */
    getSixJarsMapping(categoryName, type) {
        if (type === 'income') {
            return 'necessities'; // Default for income
        }

        const name = categoryName.toLowerCase();
        
        // Necessities (55%)
        if (name.includes('rent') || name.includes('mortgage') || name.includes('utilities') || 
            name.includes('groceries') || name.includes('gas') || name.includes('fuel') ||
            name.includes('insurance') || name.includes('phone') || name.includes('internet') ||
            name.includes('electricity') || name.includes('water') || name.includes('food')) {
            return 'necessities';
        }
        
        // Play (10%)
        if (name.includes('entertainment') || name.includes('movie') || name.includes('game') ||
            name.includes('coffee') || name.includes('restaurant') || name.includes('bar') ||
            name.includes('hobby') || name.includes('fun') || name.includes('vacation')) {
            return 'play';
        }
        
        // Education (10%)
        if (name.includes('education') || name.includes('course') || name.includes('book') ||
            name.includes('training') || name.includes('seminar') || name.includes('learning')) {
            return 'education';
        }
        
        // Financial Freedom (10%)
        if (name.includes('investment') || name.includes('stock') || name.includes('crypto') ||
            name.includes('bond') || name.includes('mutual fund')) {
            return 'financial_freedom';
        }
        
        // Give (5%)
        if (name.includes('charity') || name.includes('donation') || name.includes('gift') ||
            name.includes('tip')) {
            return 'give';
        }
        
        // Default to necessities for unknown categories
        return 'necessities';
    }

    /**
     * Map specific items to appropriate category names
     * @param {string} item - The item/description
     * @returns {string} Appropriate category name
     */
    mapItemToCategory(item) {
        const itemLower = item.toLowerCase();
        
        // Food categories
        if (itemLower.includes('burger') || itemLower.includes('pizza') || itemLower.includes('fries') || 
            itemLower.includes('chips') || itemLower.includes('soda') || itemLower.includes('candy') ||
            itemLower.includes('donut') || itemLower.includes('ice cream') || itemLower.includes('chocolate')) {
            return 'Junk Food';
        }
        
        if (itemLower.includes('coffee') || itemLower.includes('tea') || itemLower.includes('latte') ||
            itemLower.includes('cappuccino') || itemLower.includes('espresso') || itemLower.includes('frappuccino')) {
            return 'Coffee & Drinks';
        }
        
        if (itemLower.includes('lunch') || itemLower.includes('dinner') || itemLower.includes('breakfast') ||
            itemLower.includes('meal') || itemLower.includes('restaurant') || itemLower.includes('takeout')) {
            return 'Dining Out';
        }
        
        if (itemLower.includes('groceries') || itemLower.includes('grocery') || itemLower.includes('supermarket') ||
            itemLower.includes('vegetables') || itemLower.includes('fruits') || itemLower.includes('meat') ||
            itemLower.includes('bread') || itemLower.includes('milk')) {
            return 'Groceries';
        }
        
        // Transportation
        if (itemLower.includes('gas') || itemLower.includes('fuel') || itemLower.includes('gasoline') ||
            itemLower.includes('petrol')) {
            return 'Gas & Fuel';
        }
        
        if (itemLower.includes('uber') || itemLower.includes('taxi') || itemLower.includes('lyft') ||
            itemLower.includes('bus') || itemLower.includes('train') || itemLower.includes('metro')) {
            return 'Transportation';
        }
        
        if (itemLower.includes('parking') || itemLower.includes('toll')) {
            return 'Transportation';
        }
        
        // Entertainment
        if (itemLower.includes('movie') || itemLower.includes('cinema') || itemLower.includes('theater') ||
            itemLower.includes('concert') || itemLower.includes('show')) {
            return 'Entertainment';
        }
        
        if (itemLower.includes('game') || itemLower.includes('gaming') || itemLower.includes('xbox') ||
            itemLower.includes('playstation') || itemLower.includes('nintendo')) {
            return 'Entertainment';
        }
        
        // Shopping
        if (itemLower.includes('clothes') || itemLower.includes('shirt') || itemLower.includes('pants') ||
            itemLower.includes('shoes') || itemLower.includes('dress') || itemLower.includes('jacket')) {
            return 'Clothing';
        }
        
        if (itemLower.includes('amazon') || itemLower.includes('shopping') || itemLower.includes('store')) {
            return 'Shopping';
        }
        
        // Health & Personal Care
        if (itemLower.includes('pharmacy') || itemLower.includes('medicine') || itemLower.includes('doctor') ||
            itemLower.includes('hospital') || itemLower.includes('clinic')) {
            return 'Healthcare';
        }
        
        if (itemLower.includes('haircut') || itemLower.includes('salon') || itemLower.includes('spa') ||
            itemLower.includes('cosmetics') || itemLower.includes('shampoo')) {
            return 'Personal Care';
        }
        
        // Utilities & Bills
        if (itemLower.includes('electricity') || itemLower.includes('electric') || itemLower.includes('power')) {
            return 'Utilities';
        }
        
        if (itemLower.includes('water') || itemLower.includes('internet') || itemLower.includes('wifi') ||
            itemLower.includes('phone') || itemLower.includes('mobile')) {
            return 'Utilities';
        }
        
        if (itemLower.includes('rent') || itemLower.includes('mortgage')) {
            return 'Housing';
        }
        
        // Education
        if (itemLower.includes('book') || itemLower.includes('course') || itemLower.includes('class') ||
            itemLower.includes('tuition') || itemLower.includes('school')) {
            return 'Education';
        }
        
        // Default: use the item name as category (capitalized)
        return item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
    }

    /**
     * Predict recurring bills from transaction history
     * @param {Array} transactionHistory - Historical transactions
     * @param {Array} existingBills - Already scheduled bills
     * @returns {Array} Predicted bills
     */
    async predictRecurringBills(transactionHistory, existingBills) {
        try {
            const prompt = `You are a financial analyst specializing in pattern recognition. Analyze the transaction history and identify recurring payments that are NOT on the already scheduled list.

Pay close attention to expenses that recur at irregular but predictable intervals, such as:
- Car maintenance that might happen every 30-45 days
- Subscriptions paid every 3 months
- Utility bills with varying amounts but consistent timing
- Insurance payments
- Any other recurring expenses

Transaction History (last 6 months):
${JSON.stringify(transactionHistory, null, 2)}

Already Scheduled Bills:
${JSON.stringify(existingBills, null, 2)}

Your task is to find patterns that are not strictly monthly or weekly but show recurring behavior.

Please respond with a JSON array of predicted bills in this exact format:
[
  {
    "title": "Bill name",
    "amount": estimated_amount,
    "frequency": "monthly|weekly|quarterly|irregular",
    "nextDueDate": "YYYY-MM-DD",
    "confidence": 0.8,
    "pattern": "Description of the pattern found"
  }
]

Only include predictions with confidence > 0.6. If no patterns are found, return an empty array.`;

            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Extract JSON from response
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            return [];
        } catch (error) {
            console.error('Error in predictRecurringBills:', error);
            return [];
        }
    }

    /**
     * Generate investment suggestions based on user profile
     * @param {Object} userProfile - User's investment profile
     * @param {Object} transactionSummary - User's financial summary
     * @returns {Object} Investment suggestions
     */
    async generateInvestmentSuggestion(userProfile, transactionSummary) {
        try {
            const knowledgeBase = `
FINANCIAL KNOWLEDGE BASE:

RISK PROFILES:
- Conservative: 70% bonds, 20% stocks, 10% cash equivalents
- Moderate: 50% stocks, 40% bonds, 10% alternatives
- Aggressive: 80% stocks, 15% alternatives, 5% bonds

INVESTMENT PRINCIPLES:
1. Diversification reduces risk
2. Time in market beats timing the market
3. Dollar-cost averaging smooths volatility
4. Emergency fund should be 3-6 months expenses
5. High-yield savings for short-term goals

AGE-BASED ALLOCATION:
- 20s-30s: Can take more risk, focus on growth
- 40s-50s: Balance growth and stability
- 60s+: Focus on income and capital preservation

INVESTMENT VEHICLES:
- Index Funds: Low cost, broad diversification
- ETFs: Liquid, tax efficient
- Target Date Funds: Automatic rebalancing
- Individual Stocks: Higher risk, potential higher reward
- Bonds: Stability, income generation
`;

            const prompt = `${knowledgeBase}

USER PROFILE:
Age: ${userProfile.age}
Risk Tolerance: ${userProfile.riskTolerance}
Investment Goals: ${userProfile.investmentGoals || 'Not specified'}
Time Horizon: ${userProfile.timeHorizon || 'Not specified'}

FINANCIAL SUMMARY:
Monthly Income: $${transactionSummary.monthlyIncome}
Monthly Expenses: $${transactionSummary.monthlyExpenses}
Available for Investment: $${transactionSummary.availableForInvestment}
Current Savings: $${transactionSummary.currentSavings || 0}

Based on this information, provide personalized investment suggestions in this JSON format:
{
  "riskAssessment": "Brief assessment of user's risk profile",
  "recommendedAllocation": {
    "stocks": percentage,
    "bonds": percentage,
    "alternatives": percentage,
    "cash": percentage
  },
  "specificSuggestions": [
    {
      "category": "Investment type",
      "recommendation": "Specific recommendation",
      "reasoning": "Why this is suitable"
    }
  ],
  "monthlyInvestmentAmount": suggested_amount,
  "emergencyFundStatus": "Assessment of emergency fund",
  "nextSteps": ["Action item 1", "Action item 2"],
  "warnings": ["Any important warnings or considerations"]
}`;

            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            throw new Error('Could not parse investment suggestions');
        } catch (error) {
            console.error('Error in generateInvestmentSuggestion:', error);
            throw error;
        }
    }
}

module.exports = new AIService();