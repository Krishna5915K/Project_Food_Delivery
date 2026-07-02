const ROLES = {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
    OWNER: 'restaurant_owner',
    DELIVERY: 'delivery_boy'
};

const ORDER_STATUS = {
    PLACED: 'placed',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

const PAYMENT_METHODS = {
    COD: 'cod',
    CARD: 'card',
    WALLET: 'wallet'
};

module.exports = {
    ROLES,
    ORDER_STATUS,
    PAYMENT_STATUS,
    PAYMENT_METHODS
};
