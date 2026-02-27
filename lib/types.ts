export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Profile {
    id: string
    username: string
    email: string
    avatar_url: string | null
    phone: string | null
    location: string | null
    bio: string | null
    is_verified: boolean
    is_banned: boolean
    wallet_balance: number
    created_at: string
    updated_at: string
}

export interface Category {
    id: string
    name: string
    parent_id: string | null
    sort_order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Brand {
    id: string
    name: string
    logo_url: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export type ListingStatus = 'draft' | 'active' | 'paused' | 'sold' | 'deleted'
export type ListingCondition = 'new' | 'very_good' | 'good' | 'fair' | 'poor'

export interface Listing {
    id: string
    seller_id: string
    category_id: string
    brand_id: string | null
    title: string
    description: string
    price: number
    size: string | null
    color: string | null
    condition: ListingCondition
    status: ListingStatus
    views_count: number
    likes_count: number
    created_at: string
    updated_at: string
}

export interface ListingPhoto {
    id: string
    listing_id: string
    photo_url: string
    sort_order: number
    created_at: string
}

export interface Favorite {
    user_id: string
    listing_id: string
    created_at: string
}

export interface Follow {
    follower_id: string
    following_id: string
    created_at: string
}

export interface SearchAlert {
    id: string
    user_id: string
    query: string
    filters: Json
    is_active: boolean
    created_at: string
}

export interface Conversation {
    id: string
    listing_id: string | null
    created_at: string
    updated_at: string
}

export type MessageType = 'text' | 'image' | 'offer'

export interface Message {
    id: string
    conversation_id: string
    sender_id: string
    type: MessageType
    content: string
    is_read: boolean
    created_at: string
}

export type TransactionStatus = 'pending' | 'paid' | 'escrow' | 'shipped' | 'delivered' | 'completed' | 'disputed' | 'refunded' | 'cancelled'

export interface Transaction {
    id: string
    buyer_id: string
    seller_id: string
    listing_id: string
    amount: number
    fees: number
    net_amount: number
    bictorys_charge_id: string | null
    status: TransactionStatus
    payment_method: string | null
    created_at: string
    updated_at: string
}

export interface Shipment {
    id: string
    transaction_id: string
    carrier: string
    tracking_number: string | null
    status: string
    created_at: string
    updated_at: string
}

export interface Review {
    id: string
    transaction_id: string
    reviewer_id: string
    reviewed_id: string
    rating: number
    comment: string | null
    created_at: string
}

export type ReportStatus = 'pending' | 'in_review' | 'resolved' | 'dismissed'

export interface Report {
    id: string
    reporter_id: string
    target_id: string
    target_type: 'listing' | 'profile' | 'message'
    reason: string
    description: string | null
    status: ReportStatus
    created_at: string
    updated_at: string
}

export interface Notification {
    id: string
    user_id: string
    type: string
    content: Json
    is_read: boolean
    created_at: string
}

export type DisputeStatus = 'open' | 'in_review' | 'resolved_buyer' | 'resolved_seller' | 'closed'

export interface Dispute {
    id: string
    transaction_id: string
    buyer_id: string
    seller_id: string
    reason: string
    description: string
    status: DisputeStatus
    resolution_note: string | null
    created_at: string
    updated_at: string
}

export interface Boost {
    id: string
    listing_id: string
    amount: number
    expires_at: string
    created_at: string
}

export type WalletHistoryType = 'credit' | 'debit'

export interface WalletHistory {
    id: string
    user_id: string
    type: WalletHistoryType
    amount: number
    description: string
    status?: string // 'pending', 'completed', 'failed' pour les retraits
    created_at: string
}

export type AdminRole = 'admin' | 'super_admin'

export interface Admin {
    id: string
    role: AdminRole
    created_at: string
}

export interface Config {
    key: string
    value: Json
    created_at: string
    updated_at: string
}
