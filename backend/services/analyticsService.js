function countBy(items, fieldName) {
  return items.reduce((accumulator, item) => {
    const value = item[fieldName] || "Unknown";

    accumulator[value] = (accumulator[value] || 0) + 1;

    return accumulator;
  }, {});
}

function buildAnalyticsSummary(ticketHistory, feedback) {
  const duplicateCount = ticketHistory.filter((ticket) => {
    return ticket.duplicateDetected === true;
  }).length;

  return {
    ticketsAnalyzed: ticketHistory.length,
    duplicatesDetected: duplicateCount,
    feedbackCount: feedback.length,
    categoryDistribution: countBy(ticketHistory, "category"),
    priorityDistribution: countBy(ticketHistory, "priority"),
    severityDistribution: countBy(ticketHistory, "severity"),
    recommendedTeamDistribution: countBy(ticketHistory, "recommendedTeam"),
    feedbackDistribution: countBy(feedback, "feedbackType")
  };
}

module.exports = {
  buildAnalyticsSummary
};
