const { executeHttpRequest } = require("@sap-cloud-sdk/http-client");

const WIKI_DESTINATION_NAME =
  process.env.WIKI_DESTINATION_NAME || "ENTERPRISE_WIKI_API";

function normalizeTicketForSearch(ticketText) {
  return ticketText
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function searchEnterpriseWiki(ticketText) {
  const query = normalizeTicketForSearch(ticketText);

  try {
    const response = await executeHttpRequest(
      { destinationName: WIKI_DESTINATION_NAME },
      {
        method: "GET",
        url: "/search",
        params: {
          q: query
        }
      }
    );

    const articles = response.data?.results || response.data || [];

    if (!Array.isArray(articles)) {
      return [];
    }

    return articles.slice(0, 3).map((article) => ({
      title: article.title || article.name || "Untitled Wiki Article",
      source: article.url || article.link || WIKI_DESTINATION_NAME,
      excerpt:
        article.excerpt ||
        article.summary ||
        article.content ||
        "",
      score: article.score || null
    }));
  } catch (error) {
    console.error("Failed to retrieve wiki articles from destination:", {
      destination: WIKI_DESTINATION_NAME,
      message: error.message
    });

    return [];
  }
}

module.exports = {
  searchEnterpriseWiki
};
