const Notification = require('../models/Notification');

class NotificationController {
    async getNotificationsAPI(req, res) {
        try {
            const notifications = await Notification.find({ user: req.user._id })
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: notifications.length,
                data: notifications
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async markAsReadAPI(req, res) {
        try {
            const { id } = req.params;
            const notification = await Notification.findOneAndUpdate(
                { _id: id, user: req.user._id },
                { isRead: true },
                { new: true }
            );

            if (!notification) {
                return res.status(404).json({ success: false, message: 'Notification not found.' });
            }

            res.status(200).json({ success: true, message: 'Notification marked as read.', data: notification });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new NotificationController();
