const { GoogleGenerativeAI } = require('@google/generative-ai');
const Transaction = require('../api/transactions/transaction.model');
const Category = require('../api/categories/category.model');
const Source = require('../api/sources/source.model');
const chatHistoryController = require('../api/chatHistories/chatHistory.controller');

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
            // Save user message to chat history
            await chatHistoryController.addMessage(userId, 'user', message);

            // Get conversation context
            const conversationHistory = await chatHistoryController.getConversationContext(userId, 10);
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
                        name: "addMultipleTransactions",
                        description: "Records multiple transactions for the user, useful for recurring expenses or multiple dates",
                        parameters: {
                            type: "object",
                            properties: {
                                transactions: {
                                    type: "array",
                                    description: "Array of transaction objects",
                                    items: {
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
                                            },
                                            date: {
                                                type: "string",
                                                description: "Transaction date in YYYY-MM-DD format"
                                            }
                                        },
                                        required: ["amount", "category", "type", "date"]
                                    }
                                }
                            },
                            required: ["transactions"]
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
                                    enum: ["Bank Account", "E-Wallet", "Cash", "Other"],
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
                                    enum: ["expense", "income", "reminder", "prediction"],
                                    description: "Event type"
                                },
                                isRecurring: {
                                    type: "boolean",
                                    description: "Whether the event repeats"
                                },
                                frequency: {
                                    type: "string",
                                    enum: ["once", "daily", "weekly", "biweekly", "monthly", "quarterly", "annually"],
                                    description: "Recurrence frequency (if recurring)"
                                },
                                recurrenceCount: {
                                    type: "number",
                                    description: "Number of times to repeat (optional, leave empty for infinite recurrence)"
                                }
                            },
                            required: ["title", "startDate", "type"]
                        }
                    },
                    {
                        name: "deleteCategory",
                        description: "Deletes a category by name or ID",
                        parameters: {
                            type: "object",
                            properties: {
                                categoryId: {
                                    type: "string",
                                    description: "Category ID to delete"
                                },
                                categoryName: {
                                    type: "string",
                                    description: "Category name to delete (alternative to ID)"
                                }
                            }
                        }
                    },
                    {
                        name: "updateCategory",
                        description: "Updates an existing category",
                        parameters: {
                            type: "object",
                            properties: {
                                categoryId: {
                                    type: "string",
                                    description: "Category ID to update"
                                },
                                categoryName: {
                                    type: "string",
                                    description: "Current category name (alternative to ID)"
                                },
                                newName: {
                                    type: "string",
                                    description: "New category name"
                                },
                                newType: {
                                    type: "string",
                                    enum: ["income", "expense"],
                                    description: "New category type"
                                },
                                newSixJarsCategory: {
                                    type: "string",
                                    enum: ["necessities", "play", "education", "financial_freedom", "long_term_savings", "give"],
                                    description: "New Six Jars category mapping"
                                }
                            }
                        }
                    },
                    {
                        name: "deleteSource",
                        description: "Deletes a money source by name or ID",
                        parameters: {
                            type: "object",
                            properties: {
                                sourceId: {
                                    type: "string",
                                    description: "Source ID to delete"
                                },
                                sourceName: {
                                    type: "string",
                                    description: "Source name to delete (alternative to ID)"
                                }
                            }
                        }
                    },
                    {
                        name: "updateSource",
                        description: "Updates an existing money source",
                        parameters: {
                            type: "object",
                            properties: {
                                sourceId: {
                                    type: "string",
                                    description: "Source ID to update"
                                },
                                sourceName: {
                                    type: "string",
                                    description: "Current source name (alternative to ID)"
                                },
                                newName: {
                                    type: "string",
                                    description: "New source name"
                                },
                                newType: {
                                    type: "string",
                                    enum: ["Bank Account", "E-Wallet", "Cash", "Other"],
                                    description: "New source type"
                                },
                                newBalance: {
                                    type: "number",
                                    description: "New balance amount"
                                }
                            }
                        }
                    },
                    {
                        name: "deleteTransaction",
                        description: "Deletes a transaction by ID",
                        parameters: {
                            type: "object",
                            properties: {
                                transactionId: {
                                    type: "string",
                                    description: "Transaction ID to delete"
                                }
                            },
                            required: ["transactionId"]
                        }
                    },
                    {
                        name: "bulkDeleteTransactions",
                        description: "Deletes multiple transactions by type (expense, income, or all)",
                        parameters: {
                            type: "object",
                            properties: {
                                type: {
                                    type: "string",
                                    enum: ["expense", "income", "all"],
                                    description: "Type of transactions to delete - 'expense' for all expenses, 'income' for all income, 'all' for everything"
                                }
                            },
                            required: ["type"]
                        }
                    },
                    {
                        name: "updateTransaction",
                        description: "Updates an existing transaction",
                        parameters: {
                            type: "object",
                            properties: {
                                transactionId: {
                                    type: "string",
                                    description: "Transaction ID to update"
                                },
                                amount: {
                                    type: "number",
                                    description: "New transaction amount"
                                },
                                description: {
                                    type: "string",
                                    description: "New transaction description"
                                },
                                category: {
                                    type: "string",
                                    description: "New category name or ID"
                                },
                                sourceId: {
                                    type: "string",
                                    description: "New source ID"
                                },
                                type: {
                                    type: "string",
                                    enum: ["income", "expense"],
                                    description: "New transaction type"
                                },
                                date: {
                                    type: "string",
                                    description: "New transaction date in YYYY-MM-DD format"
                                }
                            },
                            required: ["transactionId"]
                        }
                    },
                    {
                        name: "deleteCalendarEvent",
                        description: "Deletes a calendar event by ID",
                        parameters: {
                            type: "object",
                            properties: {
                                eventId: {
                                    type: "string",
                                    description: "Event ID to delete"
                                }
                            },
                            required: ["eventId"]
                        }
                    },
                    {
                        name: "updateCalendarEvent",
                        description: "Updates an existing calendar event",
                        parameters: {
                            type: "object",
                            properties: {
                                eventId: {
                                    type: "string",
                                    description: "Event ID to update"
                                },
                                title: {
                                    type: "string",
                                    description: "New event title"
                                },
                                description: {
                                    type: "string",
                                    description: "New event description"
                                },
                                amount: {
                                    type: "number",
                                    description: "New amount"
                                },
                                startDate: {
                                    type: "string",
                                    description: "New event date in YYYY-MM-DD format"
                                },
                                type: {
                                    type: "string",
                                    enum: ["expense", "income", "reminder", "prediction"],
                                    description: "New event type"
                                },
                                isRecurring: {
                                    type: "boolean",
                                    description: "Whether the event repeats"
                                },
                                frequency: {
                                    type: "string",
                                    enum: ["once", "daily", "weekly", "biweekly", "monthly", "quarterly", "annually"],
                                    description: "New recurrence frequency"
                                },
                                recurrenceCount: {
                                    type: "number",
                                    description: "Number of times to repeat (optional, leave empty for infinite recurrence)"
                                }
                            },
                            required: ["eventId"]
                        }
                    },
                    {
                        name: "getDashboardData",
                        description: "Gets comprehensive financial dashboard data including summary, spending by category, cash flow, and six jars analysis",
                        parameters: {
                            type: "object",
                            properties: {}
                        }
                    },
                    {
                        name: "getTransactionHistory",
                        description: "Gets transaction history with optional filters",
                        parameters: {
                            type: "object",
                            properties: {
                                startDate: {
                                    type: "string",
                                    description: "Start date filter in YYYY-MM-DD format"
                                },
                                endDate: {
                                    type: "string",
                                    description: "End date filter in YYYY-MM-DD format"
                                },
                                type: {
                                    type: "string",
                                    enum: ["income", "expense"],
                                    description: "Transaction type filter"
                                },
                                category: {
                                    type: "string",
                                    description: "Category name filter"
                                },
                                limit: {
                                    type: "number",
                                    description: "Maximum number of transactions to return"
                                }
                            }
                        }
                    }
                ]
            }];

            // Construct the prompt
            const currentDate = new Date().toLocaleDateString();
            const categoriesText = userCategories.map(c => `${c.name} (${c.type})`).join(', ');
            const sourcesText = userSources.map(s => `${s.name} (ID: ${s._id})`).join(', ');
            
            // Format conversation history for context
            const conversationContext = conversationHistory.length > 0 
                ? `\nCONVERSATION HISTORY:\n${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}\n`
                : '';

            const prompt = `You are a proactive financial assistant. Your goal is to help users manage their finances efficiently with minimal friction.${conversationContext}

CRITICAL FORMATTING REQUIREMENT - READ THIS FIRST:
- ALWAYS respond in plain text format ONLY
- NEVER use markdown formatting of any kind
- NO asterisks (*), NO underscores (_), NO backticks, NO hashtags
- NO bold (**text**), NO italics (*text*), NO code formatting
- Use simple, clean plain text only - this is MANDATORY

CURRENT CONTEXT:
- Available categories: ${categoriesText}
- Available sources: ${sourcesText}
- Today's date: ${currentDate}

BEHAVIOR GUIDELINES:
1. BE PROACTIVE: Take action immediately when the user's intent is clear
2. SMART CATEGORY MATCHING: Always try to match items to existing categories first before creating new ones
3. MAKE SMART ASSUMPTIONS: Use the first available source if not specified
4. MINIMIZE CONFIRMATIONS: Only ask for clarification when absolutely necessary
5. BE CONVERSATIONAL: Provide brief, friendly responses after taking actions
6. USE PLAIN TEXT ONLY: Never use markdown formatting (**, *, _, etc.) in responses

CATEGORY MATCHING LOGIC:
1. FIRST: Look for existing categories that the item logically belongs to
2. ONLY IF NO MATCH: Create a new category
3. Common mappings:
   - Food items (burger, noodles, pizza, coffee, lunch, dinner) → "Food" category
   - Transportation (gas, fuel, uber, taxi, bus) → "Transportation" category
   - Entertainment (movie, game, concert) → "Entertainment" category
   - Shopping (clothes, shoes, electronics) → "Shopping" category
   - Bills (electricity, water, rent, phone) → "Bills" category

SMART DEFAULTS:
- For expenses: Match to existing categories first, create only if no logical fit
- For sources: Use the first available source or create "Main Account" if none exist
- For categories: Determine if expense/income from context
- For calendar events: Set reasonable defaults for recurring bills
- For source creation: If type is unclear, ask user to specify (Bank Account, E-Wallet, Cash, or Other)

PATTERN RECOGNITION:
- "20 Burger" = $20 expense for existing Food category (not new Burger category)
- "5 Coffee" = $5 expense for existing Food category (not new Coffee category)  
- "50 Gas" = $50 expense for existing Transportation category (not new Gas category)
- "3000 Salary" = $3000 income for Salary category
- "[Amount] [Item]" = expense transaction pattern - match item to existing category first
- "Add [amount] for [item]" = explicit expense - match to existing category
- "Spent [amount] on [item]" = expense transaction - match to existing category
- "Source [Name] [Amount]" = ask user what type of source this is before creating

COMPOSITE/MULTIPLE TRANSACTION PATTERNS - CRITICAL PRIORITY:
- "Car oil change on 3rd of May, 7th of June, 4th of July" = MUST use addMultipleTransactions with 3 separate transactions
- "50 gas on May 3rd, 45 gas on June 7th" = MUST use addMultipleTransactions with 2 separate transactions  
- "Rent 1200 on 1st of each month for 3 months" = MUST use addMultipleTransactions with 3 separate transactions
- "Coffee 5 on Monday, Lunch 15 on Tuesday, Gas 40 on Wednesday" = MUST use addMultipleTransactions with 3 separate transactions

DETECTION RULES - ALWAYS CHECK FIRST:
- If prompt contains multiple dates (May 3rd, June 7th, July 4th) → MUST use addMultipleTransactions
- If prompt contains multiple items with dates → MUST use addMultipleTransactions  
- If prompt contains "and" between dates → MUST use addMultipleTransactions
- If prompt contains commas separating dates → MUST use addMultipleTransactions
- NEVER use addTransaction for prompts with multiple dates - this causes silent failures

DATE PARSING:
- "3rd of May" = 2024-05-03, "7th of June" = 2024-06-07, "4th of July" = 2024-07-04
- "May 3rd" = 2024-05-03, "June 7th" = 2024-06-07, "July 4th" = 2024-07-04

USER MESSAGE: "${message}"

INSTRUCTIONS:
- ALWAYS try to extract transaction info from user input, even if format is informal
- CRITICAL: Check for MULTIPLE transactions first - if user mentions multiple dates, amounts, or items, use addMultipleTransactions
- Pattern "[Amount] [Item]" should trigger addTransaction with amount and EXISTING category that fits the item
- CRITICAL: Before creating any category, check if the item fits into an existing category
- Example: "20 Noodles" → look for Food/Restaurant category first, use that instead of creating "Noodles"
- Example: "50 Gas" → look for Transportation/Car category first, use that instead of creating "Gas"
- ONLY create new categories if the item doesn't logically fit any existing category

MULTIPLE TRANSACTION HANDLING - HIGHEST PRIORITY:
- STEP 1: ALWAYS scan for multiple dates FIRST before doing anything else
- STEP 2: If ANY multiple dates detected → IMMEDIATELY use addMultipleTransactions (NOT addTransaction)
- STEP 3: Count the dates and create that many transactions

EXAMPLES THAT REQUIRE addMultipleTransactions:
- "Car oil change on 3rd of May, 7th of June, 4th of July" → 3 transactions (May 3, June 7, July 4)
- "Coffee 5 on Monday, Lunch 15 on Tuesday" → 2 transactions (different items, different dates)
- "50 gas on May 3rd, 45 gas on June 7th" → 2 transactions (different amounts, different dates)
- "Rent 1200 every month for 3 months" → 3 transactions (recurring pattern)

CRITICAL: Using addTransaction for multiple dates will FAIL SILENTLY - transactions won't be created but AI will claim success

SINGLE TRANSACTION HANDLING:
- If user mentions spending money, immediately use addTransaction (match to existing category first)
- If user mentions earning money, immediately use addTransaction with type="income"
- If user mentions bills or reminders, use addCalendarEvent with type="reminder" for reminders or "expense" for bills
- If user explicitly asks to create categories/sources, use the appropriate tools
- For source creation: If type is not specified, ask "What type of source is [Name]? (Bank Account, E-Wallet, Cash, or Other)"

RESPONSE GUIDELINES:
- Take action first, then provide a brief confirmation
- Don't ask "Would you like me to..." - just do it and confirm what you did
- For unclear messages, try to interpret as transactions first before asking for clarification

CRITICAL FORMATTING RULE - NO MARKDOWN EVER:
- NEVER use ** for bold text
- NEVER use * for emphasis  
- NEVER use _ for italics
- NEVER use ` for code
- NEVER use # for headers
- Use ONLY plain text in all responses
- Example CORRECT: "Great! I added your 10 dollar ice cream expense from your VCB account, categorized as Food."
- Example WRONG: "Great! Your **10 expense for 'Ice cream'** from your **VCB** account, categorized as **'Food'**, has been successfully recorded."
- Example CORRECT: "I created 3 car oil change transactions for May 3rd, June 7th, and July 4th."
- Example WRONG: "I created **3** car oil change transactions for **May 3rd**, **June 7th**, and **July 4th**."`;

            // Prepare conversation for API call
            const contents = [];
            
            // Add conversation history if available
            if (conversationHistory.length > 0) {
                conversationHistory.forEach(msg => {
                    contents.push({
                        role: msg.role === 'ai' ? 'model' : 'user',
                        parts: [{ text: msg.content }]
                    });
                });
            }
            
            // Add current message with full context
            contents.push({ role: "user", parts: [{ text: prompt }] });

            // Make API call with tools
            const result = await this.model.generateContent({
                contents: contents,
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
                                
                            case "addMultipleTransactions":
                                console.log('Executing addMultipleTransactions with args:', functionCall.args);
                                result = await this.executeAddMultipleTransactions(userId, functionCall.args);
                                console.log('addMultipleTransactions result:', result);
                                results.push({ type: 'multiple_transactions', data: result });
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
                                
                            case "deleteCategory":
                                result = await this.executeDeleteCategory(userId, functionCall.args);
                                results.push({ type: 'delete', data: result });
                                break;
                                
                            case "updateCategory":
                                result = await this.executeUpdateCategory(userId, functionCall.args);
                                results.push({ type: 'category', data: result });
                                break;
                                
                            case "deleteSource":
                                result = await this.executeDeleteSource(userId, functionCall.args);
                                results.push({ type: 'delete', data: result });
                                break;
                                
                            case "updateSource":
                                result = await this.executeUpdateSource(userId, functionCall.args);
                                results.push({ type: 'source', data: result });
                                break;
                                
                            case "deleteTransaction":
                                result = await this.executeDeleteTransaction(userId, functionCall.args);
                                results.push({ type: 'delete', data: result });
                                break;
                                
                            case "updateTransaction":
                                result = await this.executeUpdateTransaction(userId, functionCall.args);
                                results.push({ type: 'transaction', data: result });
                                break;
                                
                            case "deleteCalendarEvent":
                                result = await this.executeDeleteCalendarEvent(userId, functionCall.args);
                                results.push({ type: 'delete', data: result });
                                break;
                                
                            case "updateCalendarEvent":
                                result = await this.executeUpdateCalendarEvent(userId, functionCall.args);
                                results.push({ type: 'event', data: result });
                                break;
                                
                            case "getDashboardData":
                                result = await this.executeGetDashboardData(userId, functionCall.args);
                                results.push({ type: 'dashboard', data: result });
                                break;
                                
                            case "getTransactionHistory":
                                result = await this.executeGetTransactionHistory(userId, functionCall.args);
                                results.push({ type: 'transactions', data: result });
                                break;
                                
                            case "bulkDeleteTransactions":
                                result = await this.executeBulkDeleteTransactions(userId, functionCall.args);
                                results.push({ type: 'bulk_delete', data: result });
                                break;
                                
                            default:
                                console.warn(`Unknown function: ${functionCall.name}`);
                        }
                    } catch (error) {
                        results.push({ type: 'error', message: error.message });
                    }
                }
                
                // Generate confirmation message
                const confirmationPrompt = `I have successfully executed the following actions: ${JSON.stringify(results)}. Provide a brief, friendly confirmation message to the user about what was accomplished. CRITICAL: Use ONLY plain text - NO markdown formatting (**, *, _, etc.). Example: "Great! I added your 10 dollar ice cream expense from your VCB account, categorized as Food."`;
                
                try {
                    const confirmationResult = await this.model.generateContent(confirmationPrompt);
                    const confirmationText = confirmationResult.response.text();
                    
                    // Save AI response to chat history
                    await chatHistoryController.addMessage(userId, 'ai', confirmationText || 'Actions completed successfully!');
                    
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
                    
                    // Save fallback response to chat history
                    await chatHistoryController.addMessage(userId, 'ai', fallbackMessage);
                    
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
            
            // Save AI response to chat history
            await chatHistoryController.addMessage(userId, 'ai', textResponse);
            
            return {
                type: 'text',
                message: textResponse
            };

        } catch (error) {
            console.error('Error in processChatMessage:', error);
            const errorMessage = 'I apologize, but I encountered an error processing your request. Please try again.';
            
            // Save error response to chat history
            try {
                await chatHistoryController.addMessage(userId, 'ai', errorMessage);
            } catch (historyError) {
                console.error('Error saving error message to chat history:', historyError);
            }
            
            return {
                type: 'error',
                message: errorMessage
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

                    const responseMessage = `Got it! Added $${amount} for ${category} under ${mappedCategory} category.`;
                    
                    // Save AI response to chat history
                    await chatHistoryController.addMessage(userId, 'ai', responseMessage);
                    
                    return {
                        type: 'function_executed',
                        message: responseMessage,
                        results: [{ type: 'transaction', data: result }]
                    };
                } catch (error) {
                    const errorMessage = `I tried to add your transaction but encountered an error: ${error.message}`;
                    
                    // Save error response to chat history
                    await chatHistoryController.addMessage(userId, 'ai', errorMessage);
                    
                    return {
                        type: 'error',
                        message: errorMessage
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
            const finalMessage = textResponse || "I'm here to help with your finances! Try saying something like 'Add $20 for burger' to record a transaction.";
            
            // Save AI response to chat history
            await chatHistoryController.addMessage(userId, 'ai', finalMessage);

            return {
                type: 'text',
                message: finalMessage
            };

        } catch (error) {
            console.error('Error in handleSimpleMessage:', error);
            const errorMessage = 'I apologize, but I encountered an error. Please try rephrasing your message.';
            
            // Save error response to chat history
            await chatHistoryController.addMessage(userId, 'ai', errorMessage);
            
            return {
                type: 'error',
                message: errorMessage
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

        // Get source document for balance update
        const sourceDoc = await Source.findById(finalSourceId);
        if (!sourceDoc) {
            throw new Error('Source not found');
        }

        // Check if the expense would cause a negative balance
        if (type === 'expense' && sourceDoc.balance < parseFloat(amount)) {
            throw new Error(`Insufficient funds in ${sourceDoc.name}. Current balance: $${sourceDoc.balance.toFixed(2)}`);
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

        // Update source balance
        if (type === 'expense') {
            sourceDoc.balance -= parseFloat(amount);
        } else if (type === 'income') {
            sourceDoc.balance += parseFloat(amount);
        }

        await sourceDoc.save();

        // Populate the transaction for response
        await transaction.populate(['category', 'source']);

        return transaction;
    }

    /**
     * Execute add multiple transactions function
     * @param {string} userId - User ID
     * @param {Object} args - Multiple transactions arguments
     * @returns {Object} Created transactions result
     */
    async executeAddMultipleTransactions(userId, args) {
        console.log('executeAddMultipleTransactions called with userId:', userId, 'args:', args);
        const { transactions } = args;
        
        if (!transactions || !Array.isArray(transactions)) {
            console.error('Invalid transactions array:', transactions);
            throw new Error('Transactions must be an array');
        }
        
        const results = [];
        const errors = [];

        console.log(`Processing ${transactions.length} transactions...`);
        
        for (let i = 0; i < transactions.length; i++) {
            const transactionData = transactions[i];
            console.log(`Processing transaction ${i + 1}:`, transactionData);
            
            try {
                const result = await this.executeAddTransaction(userId, transactionData);
                console.log(`Transaction ${i + 1} created successfully:`, result._id);
                results.push(result);
            } catch (error) {
                console.error(`Transaction ${i + 1} failed:`, error.message);
                errors.push({
                    transaction: transactionData,
                    error: error.message
                });
            }
        }

        const finalResult = {
            successful: results,
            failed: errors,
            totalCreated: results.length,
            totalFailed: errors.length,
            message: `Successfully created ${results.length} transaction(s)${errors.length > 0 ? `, ${errors.length} failed` : ''}`
        };
        
        console.log('executeAddMultipleTransactions final result:', finalResult);
        return finalResult;
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
        const { title, description, amount, startDate, type, isRecurring, frequency, recurrenceCount } = args;

        // Create calendar event
        const event = new CalendarEvent({
            userId: userId,
            title: title,
            description: description || '',
            amount: amount || 0,
            startDate: new Date(startDate),
            type: type,
            isRecurring: isRecurring || false,
            frequency: frequency || null,
            recurrenceCount: recurrenceCount || null
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
     * Generate investment suggestions based on user profile and average monthly income
     * @param {Object} userProfile - User's complete profile from MongoDB
     * @param {number} averageMonthlyIncome - Pre-calculated average monthly income
     * @returns {Object} Investment suggestions with asset allocation
     */
    async generateInvestmentSuggestion(userProfile, averageMonthlyIncome) {
        try {
            // Pre-AI Calculation: Calculate suggested investable income (10-12% of monthly income)
            const suggestedInvestableIncome = Math.round(averageMonthlyIncome * 0.12); // Using 12% as upper end

            const knowledgeBase = `
FINANCIAL KNOWLEDGE BASE:

LIFE-CYCLE INVESTMENT PRINCIPLES:
- 20s-30s: Aggressive growth focus, 80-90% stocks, 10-20% bonds. Time horizon allows for risk.
- 30s-40s: Growth with some stability, 70-80% stocks, 20-30% bonds. Building wealth phase.
- 40s-50s: Balanced approach, 60-70% stocks, 30-40% bonds. Pre-retirement planning.
- 50s-60s: Conservative growth, 50-60% stocks, 40-50% bonds. Capital preservation focus.
- 60s+: Income focus, 30-40% stocks, 60-70% bonds. Wealth preservation and income.

RISK TOLERANCE GUIDELINES:
- Conservative (1-33): Focus on capital preservation, higher bond allocation
- Moderate (34-66): Balanced growth and stability
- Aggressive (67-100): Maximum growth potential, higher stock allocation

INVESTMENT VEHICLES:
- ETFs: Low cost, liquid, tax efficient, broad market exposure
- Mutual Funds: Professional management, diversification, various strategies
- Index Funds: Passive investing, lowest costs, market returns
- Target Date Funds: Automatic rebalancing, age-appropriate allocation
- Individual Stocks: Higher risk/reward, requires research and monitoring
- Bonds: Stability, income generation, portfolio balance

DIVERSIFICATION PRINCIPLES:
1. Never put all money in one asset type
2. Mix domestic and international exposure
3. Include both growth and value investments
4. Consider different market capitalizations (large, mid, small cap)
5. Rebalance periodically to maintain target allocation
`;

            const prompt = `You are a helpful and cautious financial education assistant. You are not a licensed financial advisor. Your goal is to provide educational investment suggestions based on established financial principles and a user's personal data. You must always include a disclaimer.

Here is the core financial knowledge you must use for your analysis: ${knowledgeBase}

Now, here is the profile of the user you are assisting: 
Age: ${userProfile.age}
Risk Tolerance: ${userProfile.investmentProfile?.riskTolerance || 50} (scale 1-100)

Based on their average monthly income of $${averageMonthlyIncome}, we have calculated a suggested monthly amount to invest of $${suggestedInvestableIncome} (12% of income). 

Your task is to take this suggested investment amount and create a diversified asset allocation plan with 4-6 different asset types. The plan should be appropriate for the user's life-cycle stage and risk tolerance. You must diversify across different asset types such as:
- Stock ETFs (domestic and international)
- Bond ETFs (government and corporate)
- Index Funds (broad market exposure)
- Target Date Funds (age-appropriate automatic rebalancing)
- REITs (real estate exposure)
- International Funds (global diversification)
- Gold/Precious Metals (inflation hedge and portfolio insurance)
- High-Yield Savings/Bank Interest (emergency fund and capital preservation)

Choose the most appropriate mix based on their age and risk tolerance. Include gold for inflation protection and some bank interest allocation for liquidity and safety. Explain why you are suggesting this allocation based on their age and risk profile.

Provide your answer ONLY as a single JSON object with the following structure. You should suggest 4-6 different asset types for proper diversification, including gold and bank interest:
{
  "assetAllocation": [
    {
      "assetType": "Stock ETFs",
      "percentage": number,
      "amount": number,
      "reasoning": "string"
    },
    {
      "assetType": "Bond ETFs", 
      "percentage": number,
      "amount": number,
      "reasoning": "string"
    },
    {
      "assetType": "Index Funds",
      "percentage": number,
      "amount": number,
      "reasoning": "string"
    },
    {
      "assetType": "Target Date Funds",
      "percentage": number,
      "amount": number,
      "reasoning": "string"
    },
    {
      "assetType": "Gold/Precious Metals",
      "percentage": number,
      "amount": number,
      "reasoning": "string"
    },
    {
      "assetType": "High-Yield Savings",
      "percentage": number,
      "amount": number,
      "reasoning": "string"
    }
  ],
  "summary": "string explaining the overall strategy and why it fits the user",
  "disclaimer": "This is for educational purposes only and is not financial advice. Please consult a professional."
}`;

            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const aiResponse = JSON.parse(jsonMatch[0]);
                
                // Create final response object with our calculated amount
                return {
                    suggestedInvestableIncome,
                    averageMonthlyIncome,
                    assetAllocation: aiResponse.assetAllocation,
                    summary: aiResponse.summary,
                    disclaimer: aiResponse.disclaimer
                };
            }
            
            throw new Error('Could not parse investment suggestions from AI response');
        } catch (error) {
            console.error('Error in generateInvestmentSuggestion:', error);
            throw error;
        }
    }

    /**
     * Execute delete category function
     * @param {string} userId - User ID
     * @param {Object} args - Delete arguments
     * @returns {Object} Delete result
     */
    async executeDeleteCategory(userId, args) {
        const { categoryId, categoryName } = args;
        
        let category;
        if (categoryId) {
            category = await Category.findById(categoryId);
        } else if (categoryName) {
            category = await Category.findOne({
                name: { $regex: new RegExp(`^${categoryName}$`, 'i') },
                userId: userId
            });
        } else {
            throw new Error('Either categoryId or categoryName is required');
        }

        if (!category) {
            throw new Error('Category not found');
        }

        if (category.userId.toString() !== userId) {
            throw new Error('Permission denied');
        }

        await Category.deleteOne({ _id: category._id });
        return { message: 'Category deleted successfully', categoryName: category.name };
    }

    /**
     * Execute update category function
     * @param {string} userId - User ID
     * @param {Object} args - Update arguments
     * @returns {Object} Updated category
     */
    async executeUpdateCategory(userId, args) {
        const { categoryId, categoryName, newName, newType, newSixJarsCategory } = args;
        
        let category;
        if (categoryId) {
            category = await Category.findById(categoryId);
        } else if (categoryName) {
            category = await Category.findOne({
                name: { $regex: new RegExp(`^${categoryName}$`, 'i') },
                userId: userId
            });
        } else {
            throw new Error('Either categoryId or categoryName is required');
        }

        if (!category) {
            throw new Error('Category not found');
        }

        if (category.userId.toString() !== userId) {
            throw new Error('Permission denied');
        }

        // Update fields if provided
        if (newName) category.name = newName;
        if (newType) category.type = newType;
        if (newSixJarsCategory) category.sixJarsCategory = newSixJarsCategory;

        await category.save();
        return category;
    }

    /**
     * Execute delete source function
     * @param {string} userId - User ID
     * @param {Object} args - Delete arguments
     * @returns {Object} Delete result
     */
    async executeDeleteSource(userId, args) {
        const { sourceId, sourceName } = args;
        
        let source;
        if (sourceId) {
            source = await Source.findById(sourceId);
        } else if (sourceName) {
            source = await Source.findOne({
                name: { $regex: new RegExp(`^${sourceName}$`, 'i') },
                userId: userId
            });
        } else {
            throw new Error('Either sourceId or sourceName is required');
        }

        if (!source) {
            throw new Error('Source not found');
        }

        if (source.userId.toString() !== userId) {
            throw new Error('Permission denied');
        }

        await Source.deleteOne({ _id: source._id });
        return { message: 'Source deleted successfully', sourceName: source.name };
    }

    /**
     * Execute update source function
     * @param {string} userId - User ID
     * @param {Object} args - Update arguments
     * @returns {Object} Updated source
     */
    async executeUpdateSource(userId, args) {
        const { sourceId, sourceName, newName, newType, newBalance } = args;
        
        let source;
        if (sourceId) {
            source = await Source.findById(sourceId);
        } else if (sourceName) {
            source = await Source.findOne({
                name: { $regex: new RegExp(`^${sourceName}$`, 'i') },
                userId: userId
            });
        } else {
            throw new Error('Either sourceId or sourceName is required');
        }

        if (!source) {
            throw new Error('Source not found');
        }

        if (source.userId.toString() !== userId) {
            throw new Error('Permission denied');
        }

        // Update fields if provided
        if (newName) source.name = newName;
        if (newType) source.type = newType;
        if (newBalance !== undefined) source.balance = newBalance;

        await source.save();
        return source;
    }

    /**
     * Execute delete transaction function
     * @param {string} userId - User ID
     * @param {Object} args - Delete arguments
     * @returns {Object} Delete result
     */
    async executeDeleteTransaction(userId, args) {
        const { transactionId } = args;
        
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            throw new Error('Transaction not found');
        }

        if (transaction.userId.toString() !== userId) {
            throw new Error('Permission denied');
        }

        // Update source balance before deleting
        const source = await Source.findById(transaction.source);
        if (source) {
            if (transaction.type === 'expense') {
                source.balance += transaction.amount;
            } else {
                source.balance -= transaction.amount;
            }
            await source.save();
        }

        await Transaction.deleteOne({ _id: transactionId });
        return { message: 'Transaction deleted successfully', amount: transaction.amount };
    }

    /**
     * Execute update transaction function
     * @param {string} userId - User ID
     * @param {Object} args - Update arguments
     * @returns {Object} Updated transaction
     */
    async executeUpdateTransaction(userId, args) {
        const { transactionId, amount, description, category, sourceId, type, date } = args;
        
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            throw new Error('Transaction not found');
        }

        if (transaction.userId.toString() !== userId) {
            throw new Error('Permission denied');
        }

        // Handle category update
        let categoryDoc = transaction.category;
        if (category) {
            // Try to find by ID first, then by name
            categoryDoc = await Category.findById(category) || 
                         await Category.findOne({
                             name: { $regex: new RegExp(`^${category}$`, 'i') },
                             userId: userId
                         });
            
            if (!categoryDoc) {
                throw new Error('Category not found');
            }
        }

        // Handle source balance updates if amount, source, or type changed
        if (amount !== undefined || sourceId || type) {
            const oldSource = await Source.findById(transaction.source);
            const newSource = sourceId ? await Source.findById(sourceId) : oldSource;

            if (!newSource) {
                throw new Error('Source not found');
            }

            // Revert old transaction from old source
            if (transaction.type === 'expense') {
                oldSource.balance += transaction.amount;
            } else {
                oldSource.balance -= transaction.amount;
            }

            // Apply new transaction to new source
            const newAmount = amount !== undefined ? amount : transaction.amount;
            const newType = type || transaction.type;
            
            if (newType === 'expense') {
                if (newSource.balance < newAmount) {
                    throw new Error(`Insufficient funds in ${newSource.name}`);
                }
                newSource.balance -= newAmount;
            } else {
                newSource.balance += newAmount;
            }

            await oldSource.save();
            if (newSource._id.toString() !== oldSource._id.toString()) {
                await newSource.save();
            }
        }

        // Update transaction fields
        if (amount !== undefined) transaction.amount = amount;
        if (description !== undefined) transaction.description = description;
        if (categoryDoc) transaction.category = categoryDoc._id;
        if (sourceId) transaction.source = sourceId;
        if (type) transaction.type = type;
        if (date) transaction.date = new Date(date);

        await transaction.save();
        await transaction.populate(['category', 'source']);
        return transaction;
    }

    /**
     * Execute delete calendar event function
     * @param {string} userId - User ID
     * @param {Object} args - Delete arguments
     * @returns {Object} Delete result
     */
    async executeDeleteCalendarEvent(userId, args) {
        const CalendarEvent = require('../api/calendarEvents/calendarEvent.model');
        const { eventId } = args;
        
        const event = await CalendarEvent.findById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }

        if (event.userId.toString() !== userId) {
            throw new Error('Permission denied');
        }

        await CalendarEvent.deleteOne({ _id: eventId });
        return { message: 'Event deleted successfully', title: event.title };
    }

    /**
     * Execute update calendar event function
     * @param {string} userId - User ID
     * @param {Object} args - Update arguments
     * @returns {Object} Updated event
     */
    async executeUpdateCalendarEvent(userId, args) {
        const CalendarEvent = require('../api/calendarEvents/calendarEvent.model');
        const { eventId, title, description, amount, startDate, type, isRecurring, frequency, recurrenceCount } = args;
        
        const event = await CalendarEvent.findById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }

        if (event.userId.toString() !== userId) {
            throw new Error('Permission denied');
        }

        // Update fields if provided
        if (title !== undefined) event.title = title;
        if (description !== undefined) event.description = description;
        if (amount !== undefined) event.amount = amount;
        if (startDate !== undefined) event.startDate = new Date(startDate);
        if (type !== undefined) event.type = type;
        if (isRecurring !== undefined) event.isRecurring = isRecurring;
        if (frequency !== undefined) event.frequency = frequency;
        if (recurrenceCount !== undefined) event.recurrenceCount = recurrenceCount;

        await event.save();
        return event;
    }

    /**
     * Execute get dashboard data function
     * @param {string} userId - User ID
     * @param {Object} args - Arguments (unused)
     * @returns {Object} Dashboard data
     */
    async executeGetDashboardData(userId, args) {
        const mongoose = require('mongoose');
        
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0));
        const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));

        // Get monthly transactions
        const monthlyTransactions = await Transaction.find({
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).populate('category').populate('source');

        // Calculate financial summary
        const income = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const spending = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const netFlow = income - spending;

        // Get spending by category
        const spendingByCategory = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    type: 'expense',
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    categoryName: { $first: '$categoryInfo.name' }
                }
            },
            { $sort: { total: -1 } }
        ]);

        // Get total from sources
        const sources = await Source.find({ userId: userId });
        const totalAmount = sources.reduce((sum, src) => sum + (src.balance || 0), 0);

        return {
            financialSummary: { income, spending, netFlow },
            spendingByCategory: spendingByCategory.map(item => ({
                category: item.categoryName || 'Unknown',
                amount: item.total,
                percentage: spending > 0 ? (item.total / spending) * 100 : 0
            })),
            totalAmount,
            sources: sources.map(s => ({ name: s.name, balance: s.balance, type: s.type }))
        };
    }

    /**
     * Execute get transaction history function
     * @param {string} userId - User ID
     * @param {Object} args - Filter arguments
     * @returns {Object} Transaction history
     */
    async executeGetTransactionHistory(userId, args) {
        const mongoose = require('mongoose');
        const { startDate, endDate, type, category, limit } = args;
        
        const query = { userId: new mongoose.Types.ObjectId(userId) };
        
        // Add date filters
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }
        
        // Add type filter
        if (type) {
            query.type = type;
        }
        
        // Add category filter
        if (category) {
            const categoryDoc = await Category.findOne({
                name: { $regex: new RegExp(`^${category}$`, 'i') },
                userId: userId
            });
            if (categoryDoc) {
                query.category = categoryDoc._id;
            }
        }
        
        let transactionQuery = Transaction.find(query)
            .populate('category')
            .populate('source')
            .sort({ date: -1 });
            
        if (limit) {
            transactionQuery = transactionQuery.limit(limit);
        }
        
        const transactions = await transactionQuery;
        
        return {
            transactions,
            count: transactions.length,
            filters: { startDate, endDate, type, category, limit }
        };
    }

    /**
     * Execute bulk delete transactions function
     * @param {string} userId - User ID
     * @param {Object} args - Delete arguments
     * @returns {Object} Delete result
     */
    async executeBulkDeleteTransactions(userId, args) {
        const mongoose = require('mongoose');
        const { type } = args;
        
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            let query = { userId: new mongoose.Types.ObjectId(userId) };
            
            // Add type filter if specified
            if (type && type !== 'all') {
                query.type = type;
            }

            // Find transactions to delete
            const transactionsToDelete = await Transaction.find(query).session(session);
            
            if (transactionsToDelete.length === 0) {
                await session.abortTransaction();
                session.endSession();
                throw new Error('No transactions found to delete');
            }

            // Update source balances for each transaction
            const sourceUpdates = new Map();
            
            for (const transaction of transactionsToDelete) {
                const sourceId = transaction.source.toString();
                
                if (!sourceUpdates.has(sourceId)) {
                    sourceUpdates.set(sourceId, 0);
                }
                
                // Reverse the transaction effect on source balance
                if (transaction.type === 'expense') {
                    sourceUpdates.set(sourceId, sourceUpdates.get(sourceId) + transaction.amount);
                } else if (transaction.type === 'income') {
                    sourceUpdates.set(sourceId, sourceUpdates.get(sourceId) - transaction.amount);
                }
            }

            // Apply source balance updates
            for (const [sourceId, balanceChange] of sourceUpdates) {
                const source = await Source.findById(sourceId).session(session);
                if (source) {
                    source.balance += balanceChange;
                    await source.save({ session });
                }
            }

            // Delete the transactions
            const deleteResult = await Transaction.deleteMany(query).session(session);
            
            await session.commitTransaction();
            session.endSession();

            return {
                message: `Successfully deleted ${deleteResult.deletedCount} ${type === 'all' ? '' : type} transaction(s)`,
                deletedCount: deleteResult.deletedCount,
                type: type
            };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

module.exports = new AIService();