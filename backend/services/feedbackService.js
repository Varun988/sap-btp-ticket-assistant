const feedbackStore = [];

function addFeedback(feedback) {
  const record = {
    feedbackId: `FB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ticketId: feedback.ticketId || null,
    feedbackType: feedback.feedbackType || "unknown",
    comment: feedback.comment || "",
    createdAt: new Date().toISOString()
  };

  feedbackStore.unshift(record);

  return record;
}

function getFeedback() {
  return feedbackStore;
}

module.exports = {
  addFeedback,
  getFeedback
};
