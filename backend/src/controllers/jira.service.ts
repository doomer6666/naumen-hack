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

export const transitionJiraTicket = async (
  issueKey: string,
  targetStatusKey: string,
): Promise<boolean> => {
  if (!JIRA_BASE_URL || !JIRA_API_TOKEN) return false;
  try {
    const transitionsRes = await axios.get(
      `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/transitions`,
      { headers: getAuthHeader() },
    );

    const transitions = transitionsRes.data.transitions;

    // Приоритетные статусы для каждого действия
    const priorityMap: Record<string, string[]> = {
      in_review: [
        "на проверке",
        "in review",
        "в работе",
        "in progress",
        "ревью",
        "review",
      ],
      done: ["выполнено", "done", "закрыто", "closed", "готово", "завершено"],
      pending: [
        "к выполнению",
        "to do",
        "открыто",
        "open",
        "backlog",
        "сделать",
        "pending",
      ],
    };

    const possibleNames = priorityMap[targetStatusKey.toLowerCase()] || [
      targetStatusKey.toLowerCase(),
    ];

    // Ищем точное совпадение (без учета регистра и пробелов по краям)
    let targetTransition = transitions.find((t: any) =>
      possibleNames.includes(t.to?.name?.toLowerCase().trim()),
    );

    // Если не нашли точное, ищем частичное совпадение (на случай если статус называется "В работе (In Progress)")
    if (!targetTransition) {
      targetTransition = transitions.find((t: any) =>
        possibleNames.some((name) => t.to?.name?.toLowerCase().includes(name)),
      );
    }

    if (targetTransition) {
      await axios.post(
        `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/transitions`,
        { transition: { id: targetTransition.id } },
        { headers: getAuthHeader() },
      );
      console.log(
        `Jira ticket ${issueKey} moved to ${targetTransition.to.name}`,
      );
      return true;
    }

    // Выводим то, что реально пришло из Jira, чтобы понять, почему не совпало
    console.warn(
      `[JIRA] No transition for '${targetStatusKey}'. Ticket: ${issueKey}. Available statuses: ${transitions.map((t: any) => t.to?.name).join(", ")}`,
    );
    return false;
  } catch (error: any) {
    console.error(
      `[JIRA] Error moving ticket ${issueKey}:`,
      error.response?.data?.errors || error.message,
    );
    return false;
  }
};
