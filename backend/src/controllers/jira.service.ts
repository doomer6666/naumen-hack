import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_USER_EMAIL = process.env.JIRA_USER_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

const getAuthHeader = () => {
  const token = Buffer.from(`${JIRA_USER_EMAIL}:${JIRA_API_TOKEN}`).toString(
    "base64",
  );
  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
  };
};

export const createJiraTicket = async (
  summary: string,
  description: string,
): Promise<string | null> => {
  if (!JIRA_BASE_URL || !JIRA_API_TOKEN) return null;
  try {
    const response = await axios.post(
      `${JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          project: { key: process.env.JIRA_PROJECT_KEY || "ONB" },
          summary: summary,
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [{ text: description, type: "text" }],
              },
            ],
          },
          issuetype: { name: "Task" },
        },
      },
      { headers: getAuthHeader() },
    );
    return response.data.key;
  } catch (error: any) {
    console.error(
      "Error creating Jira ticket:",
      error.response?.data || error.message,
    );
    return null;
  }
};

// Универсальная функция перемещения тикета
export const transitionJiraTicket = async (
  issueKey: string,
  targetStatusName: string,
): Promise<boolean> => {
  if (!JIRA_BASE_URL || !JIRA_API_TOKEN) return false;
  try {
    // 1. Получаем доступные переходы
    const transitionsRes = await axios.get(
      `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/transitions`,
      { headers: getAuthHeader() },
    );

    const transitions = transitionsRes.data.transitions;
    // Ищем переход, чей целевой статус совпадает с targetStatusName (игнорируя регистр)
    const targetTransition = transitions.find(
      (t: any) => t.to?.name?.toLowerCase() === targetStatusName.toLowerCase(),
    );

    if (targetTransition) {
      // 2. Выполняем переход
      await axios.post(
        `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/transitions`,
        { transition: { id: targetTransition.id } },
        { headers: getAuthHeader() },
      );
      console.log(`Jira ticket ${issueKey} moved to ${targetStatusName}`);
      return true;
    }
    console.warn(
      `No '${targetStatusName}' transition found for ${issueKey}. Available: ${transitions.map((t: any) => t.to?.name).join(", ")}`,
    );
    return false;
  } catch (error: any) {
    console.error(
      `Error moving Jira ticket ${issueKey} to ${targetStatusName}:`,
      error.response?.data || error.message,
    );
    return false;
  }
};
