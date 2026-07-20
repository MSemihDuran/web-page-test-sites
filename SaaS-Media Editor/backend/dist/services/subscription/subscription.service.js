"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
class SubscriptionService {
    /**
     * Check if user has an active paid subscription or is within their 1-day free trial.
     * The trial is calculated dynamically based on the account's creation date (createdAt).
     */
    static async hasActiveSubscription(user) {
        if (user.isSubscribed)
            return true;
        const oneDayInMs = 24 * 60 * 60 * 1000;
        const timeElapsed = Date.now() - new Date(user.createdAt).getTime();
        // Active if account is less than 24 hours old
        return timeElapsed < oneDayInMs;
    }
}
exports.SubscriptionService = SubscriptionService;
