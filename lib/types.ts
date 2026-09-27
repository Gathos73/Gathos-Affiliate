export type Affiliate = { id: string; email: string; name: string | null; created_at?: string };
export type Code = { id: string; code: string; label: string | null; click_count: number; is_active: boolean; created_at: string };
export type Stats = { wallet_balance: number; total_earned: number; total_withdrawn: number; total_conversions: number; total_referrals: number; total_clicks: number; can_withdraw: boolean; min_withdrawal: number; has_pending_withdrawal: boolean };
export type Conversion = { id: string; user_email: string | null; commission_usd: number; plan: string; status: string; created_at: string; affiliate_codes: { code: string; label: string | null } | null };
export type Withdrawal = { id: string; amount: number; payout_details: { method: string }; status: string; admin_notes: string | null; requested_at: string; processed_at: string | null };
export type Overview = { affiliate: Affiliate; codes: Code[]; stats: Stats };
