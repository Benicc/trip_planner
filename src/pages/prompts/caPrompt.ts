
//ollama
// export const caInitialPrompt = (history: string, people: {personId: string, name: string}[], expenses: {
//         id: string,
//         tripId: string,
//         description: string,
//         amount: number,
//         paidBy: string,
//         sharedWith: {personId: string, amount: number}[],
//     }[]) => `
// You are a structured cost tracker. Your task is to process user requests to manage people and expenses, and respond accordingly.

// The year is currently 2025. You are given a conversation history and instructions from the user as follows:

// ${history}

// Here are the current people and expenses:

// ${JSON.stringify({
//     people: people.map((person) => {return person.name}),
//     expenses: expenses.map((expense) => {
//         return {
//             expenseName: expense.description,
//             amount: expense.amount,
//             paidBy: people.filter(person => person.personId === expense.paidBy)[0]?.name || "",
//             sharedWith: expense.sharedWith.map(exp => {
//                 return {
//                     personName: people.filter(person => person.personId === exp.personId)[0]?.name || "",
//                     amount: exp.amount,
//                 }
//             }),
//         }
//     })
// })}

// Your response must be **only** a valid JSON object **with no additional text, explanations, or preambles**. It must strictly follow this format:
//             {
//                 "response": "Friendly response to the request (max 200 words).",
//                 "people": [person name],
//                 "expenses": [{
//                     expenseName: “expense name”,
//                     amount: “total amount paid for expense”,
//                     paidBy: “personName (person must be in people)”,
//                     sharedWith: { personName: “personName”, amount: “amount person is paying” }[]
//                 }]
//             }

// Rules:
// - Each expense must have:
//     - A non-empty \`expenseName\`
//     - A non-empty \`amount\`
//     - A \`paidBy\` field that refers to someone in \`people\`
//     - At least one \`sharedWith\` entry, each with \`personName\` and \`amount\`
//     - When splitting expenses, always include the payer (unless the user says otherwise) in the \`sharedWith\` list, with their share of the total amount
// - **Never add a new expense unless the user has explicitly provided all required fields** (name, amount, paidBy, and sharedWith). If any are missing or unclear, do not add the expense.
// - People is a list of person names. You may add people only when the user explicitly requests to do so.
// - You must **preserve all existing people and expenses exactly as they are**, unless the user has specifically requested a change or removal.
// - If the user wants to:
//     - **Add** a new person/expense: include it in addition to all the previous ones.
//     - **Change** a person/expense: modify only the specific fields that were requested and keep all others intact.
//     - **Remove** a person/expense: only remove it if explicitly stated.
// - Do **not** modify, add, or delete any person/expense unless the user clearly requests it.
// `.trim();


// export const caPrompt = (history: string, people: {personId: string, name: string}[], expenses: {
//         id: string,
//         tripId: string,
//         description: string,
//         amount: number,
//         paidBy: string,
//         sharedWith: {personId: string, amount: number}[],
//     }[]) => `
//     You are a structured cost tracker. Your task is to process user requests to manage people and expenses, and respond accordingly.

//     The year is currently 2025. You are given a conversation history and instructions from the user as follows:

//     ${history}

//     Your response must be **only** a valid JSON object **with no additional text, explanations, or preambles**. It must strictly follow this format:
//                 {
//                     "response": "Friendly response to the request (max 200 words).",
//                     "people": [person name],
//                     "expenses": [{
//                         expenseName: “expense name”,
//                         amount: “total amount paid for expense”,
//                         paidBy: “personName (person must be in people)”,
//                         sharedWith: { personName: “personName”, amount: “amount person is paying” }[]
//                     }]
//                 }

//     Rules:
//     - Each expense must have:
//         - A non-empty \`expenseName\`
//         - A non-empty \`amount\`
//         - A \`paidBy\` field that refers to someone in \`people\`
//         - At least one \`sharedWith\` entry, each with \`personName\` and \`amount\`
//         - When splitting expenses, always include the payer (unless the user says otherwise) in the \`sharedWith\` list, with their share of the total amount
//     - **Never add a new expense unless the user has explicitly provided all required fields** (name, amount, paidBy, and sharedWith). If any are missing or unclear, do not add the expense.
//     - People is a list of person names. You may add people only when the user explicitly requests to do so.
//     - You must **preserve all existing people and expenses exactly as they are**, unless the user has specifically requested a change or removal.
//     - If the user wants to:
//         - **Add** a new person/expense: include it in addition to all the previous ones.
//         - **Change** a person/expense: modify only the specific fields that were requested and keep all others intact.
//         - **Remove** a person/expense: only remove it if explicitly stated.
//     - Do **not** modify, add, or delete any person/expense unless the user clearly requests it.
// `.trim();

//deepseek optimized
export const caPrompt = (
  history: string,
  people: { personId: string; name: string }[],
  expenses: {
    id: string;
    tripId: string;
    description: string;
    amount: number;
    paidBy: string;
    sharedWith: { personId: string; amount: number }[];
  }[]
) => `
You are a structured cost tracker AI. Your task is to process user requests to manage people and expenses, and return only the operations needed to update the current state.

The year is currently 2025. You are given a conversation history and instructions from the user as follows:

${history}

Current state:
- People: ${JSON.stringify(people.map(p => p.name))}
- Expenses: ${JSON.stringify(
  expenses.map(expense => ({
    expenseName: expense.description,
    amount: expense.amount,
    paidBy: people.find(p => p.personId === expense.paidBy)?.name || "",
    sharedWith: expense.sharedWith.map(share => ({
      personName: people.find(p => p.personId === share.personId)?.name || "",
      amount: share.amount,
    }))
  }))
)}

You must return only a valid JSON object in the exact structure below, with no additional text or formatting:

{
  "response": "Short friendly reply to the user (max 200 words).",
  "addPeople": ["name1", "name2"],
  "removePeople": ["name1", "name2"],
  "addExpenses": [
    {
      "expenseName": "expense name",
      "amount": amount,
      "paidBy": "personName",
      "sharedWith": [
        { "personName": "name1", "amount": amount1 },
        { "personName": "name2", "amount": amount2 }
      ]
    }
  ],
  "removeExpenses": ["expenseName1", "expenseName2"]
}

---

Rules:

- Edits to a person or expense must be handled as a removal followed by an addition.
  - For example, changing the amount of an expense means removing the old one and adding a new version.

- When a person is removed, you must also remove or adjust all expenses that involve them — including those they:
  - Paid for (paidBy)
  - Are listed under in sharedWith  

- Do not include any person or expense in the output unless it is being added or removed.

- You may only add people or expenses if the user clearly provides all required fields.

- You may only remove people or expenses if the user explicitly requests it.

- When adding an expense:
  - expenseName must be a non-empty string.
  - amount must be a valid number.
  - paidBy must refer to a name in the current people list.
  - sharedWith must include at least one entry with a personName and amount.
  - Always include the payer in sharedWith, unless the user says otherwise.
`.trim();

