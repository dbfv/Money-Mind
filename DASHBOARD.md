# Dashboard Logic for "6 Jars" Analysis

This document outlines the backend logic required to support the "6 Jars" analysis dashboard component.

## 1. Data Requirements

To perform the "6 Jars" analysis, the frontend will need the following data from the backend:

1.  **User's "6 Jars" Profile:** The user's personalized allocation percentages for each of the six jars. This is stored in the `sixJarsProfile` field of the `User` model.
2.  **User's Transactions:** A list of the user's transactions for a given period (e.g., monthly, quarterly). Each transaction should be categorized.
3.  **User's Income:** The total income for the selected period. This can be calculated by summing up all transactions with the type "income".

## 2. API Endpoint

A new API endpoint will be required to provide this data to the dashboard.

### `GET /api/dashboard/6jars-analysis`

This endpoint will return the data required for the "6 Jars" analysis.

**Query Parameters:**

*   `startDate` (optional): The start date for the analysis period.
*   `endDate` (optional): The end date for the analysis period.

**Response Body:**

```json
{
  "sixJarsProfile": {
    "necessities": 55,
    "play": 10,
    "education": 10,
    "financialFreedom": 10,
    "longTermSavings": 10,
    "give": 5
  },
  "spendingByCategory": {
    "Necessities": 1200,
    "Play": 250,
    "Education": 150,
    "Financial Freedom": 200,
    "Long-Term Savings": 200,
    "Give": 100
  },
  "totalIncome": 2000,
  "analysis": {
    "necessities": {
      "allocated": 1100,
      "spent": 1200,
      "difference": -100
    },
    "play": {
      "allocated": 200,
      "spent": 250,
      "difference": -50
    },
    // ... and so on for the other jars
  }
}
```

## 3. Backend Logic

Here's the backend logic to implement the `GET /api/dashboard/6jars-analysis` endpoint:

1.  **Get User:** Get the authenticated user from the request (`req.user`).
2.  **Get Transactions:** Fetch all transactions for the user within the specified date range.
3.  **Calculate Total Income:** Sum the `amount` of all transactions with `type: 'income'`.
4.  **Categorize Spending:**
    *   Create a mapping between your transaction categories and the "6 Jars" categories. For example, "Groceries" and "Rent" might map to "Necessities". This mapping could be stored in a separate collection or hardcoded for simplicity.
    *   Iterate through the user's expense transactions and sum the amounts for each "6 Jars" category.
5.  **Perform Analysis:**
    *   For each jar, calculate the allocated amount by multiplying the total income by the user's allocation percentage for that jar.
    *   Compare the allocated amount with the actual spending in that category to find the difference.
6.  **Construct Response:** Build the JSON response with all the calculated data.

This logic would be implemented in a new `dashboard.controller.js` and exposed through `dashboard.routes.js`.
